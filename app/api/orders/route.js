import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import axios from "axios";

//Get a new order
export async function POST(request) {
    try {
        //user and has from clerk
        const {userId, has} = getAuth(request)
       //check if the userid is  not there
       if(!userId){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
       }
       const {items, addressId, paymentMethod, couponCode} = await request.json()

       //check if all required fields are there
       if(!Array.isArray(items) || items.length === 0 || !addressId || !paymentMethod){
        return NextResponse.json({error: "All fields are required"}, {status: 400})
       }

       //get user email for Paystack
       const user = await prisma.user.findUnique({
        where: { id: userId }
       })
       const userEmail = user?.email

       //check coupon
       let coupon = null
       if(couponCode){
        coupon = await prisma.coupon.findUnique({
            where: {
                code: couponCode.toUpperCase(),
                expiresAt: {
                    gt: new Date()
                }
            }
        })
       }
       //no coupon found
       if(couponCode && !coupon){
        return NextResponse.json({error: "Invalid or expired coupon"}, {status: 404})
       }
       //suppose coupon is found, check if for new users
       if(couponCode && coupon.forNewUsers){
        const userOrders = await prisma.order.findMany({
            where: {
                userId: userId
            }
        })
        if(userOrders.length > 0){
            return NextResponse.json({error: "This coupon is only for new users"}, {status: 403})
        }
       }
       //check if the coupon has plus plan
       if(couponCode && coupon.forMember){
        const hasPlusPlan = has({plan: "plus"})
        if(!hasPlusPlan){
            return NextResponse.json({error: "This coupon is only for Plus members"}, {status: 403})
        }
       }

       //Group orders by storeId using a map
       const storeByOrders = new Map()

       for(const item of items){
        //validate that productId exists
        if(!item.productId){
            return NextResponse.json({error: "Invalid product in cart"}, {status: 400})
        }
        const product = await prisma.product.findUnique({
            where: {
                id: item.productId
        }
    })
    if(!product){
        return NextResponse.json({error: "Product not found"}, {status: 404})
    }
    const storeId = product.storeId
    //if the storeId is not in the map, add it
    if(!storeByOrders.has(storeId)){
        storeByOrders.set(storeId, [])
    }
    //let's get the store id and push the item to the array
    storeByOrders.get(storeId).push({...item, price: product.price})
       
}
let orderIds = []
let totalOrderAmount = 0

let shippingFeeAdded = false

//create orders for each seller
for(const [storeId, orderItems] of storeByOrders.entries()){
    //calculate total amount for the order
    let orderAmount = orderItems.reduce((acc, item) => acc +
     item.price * item.quantity, 0)

     //coupon is true, provide the total
     if(coupon){
        orderAmount = orderAmount - (coupon.discount / 100 * orderAmount)
     }

     //if not a plus member and shipping fee not added,then use order amount + 5
     if(!has({plan: "plus"}) && !shippingFeeAdded){
        orderAmount += 5
        shippingFeeAdded = true
     }
     //let's provide the full amount
     totalOrderAmount += parseFloat(orderAmount.toFixed(2))

     //create the order
     const newOrder = await prisma.order.create({
        data: {
            userId,
            storeId,
            addressId,
            paymentMethod,
            total: parseFloat(orderAmount.toFixed(2)),
            isCouponUsed: coupon ? true : false,
            coupon: coupon ? coupon : {},
            status: paymentMethod === PaymentMethod.COD ? 'PROCESSING' : 'ORDER_PLACED',
            orderItems: {
                create: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
 }
}})
orderIds.push(newOrder.id)
}
//check if payment method is paystack
if(paymentMethod === PaymentMethod.PAYSTACK){
    //initialize paystack
    const origin = request.headers.get('origin')
    try {
        //create a paystack transaction
        const response = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: userEmail,
                amount: Math.round(totalOrderAmount * 100), // Paystack accepts amount in kobo
                metadata: {
                    orderIds: orderIds.join(','),
                    userId: userId,
                    appId: 'jeeshop'
                },
                callback_url: `${origin}/api/paystack`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        if(!response.data.data?.authorization_url) {
            throw new Error('No authorization URL received from Paystack')
        }
        return NextResponse.json({authorizationUrl: response.data.data.authorization_url})
    } catch(paystackError) {
        console.error('Paystack error:', paystackError.response?.data || paystackError.message)
        return NextResponse.json({error: paystackError.response?.data?.message || 'Payment initialization failed'}, {status: 400})
    }
}
//clear cart data
await prisma.user.update({
    where: {id: userId},
    data: {
        cart: {}
}
})
//return a response
return NextResponse.json({message: "Order placed successfully", orderIds, totalOrderAmount}, {status: 201})
} catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

//Get All order list

export async function GET(request) {
    try {
        //userid
        const {userId} = getAuth(request)
        //find many orders
        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
                OR:[
                    {paymentMethod: PaymentMethod.COD},
                    {AND:[
                        {paymentMethod: PaymentMethod.PAYSTACK},
                        {isPaid: true}
                    ]}
                ]
            },
            include:{
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        })
        return NextResponse.json({orders}, {status: 200})
} catch (error) {
        console.error(error)
        return NextResponse.json({error: error.message}, {status: 400})
    }
}
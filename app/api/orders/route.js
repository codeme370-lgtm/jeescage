import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import axios from "axios";

//Get a new order
export async function POST(request) {
    try {
        console.log('POST /api/orders incoming')
        const textBody = await request.text().catch(() => null)
        if(textBody) console.log('raw body length:', textBody.length)
        //user and has from clerk
        const {userId, has} = getAuth(request)
       //check if the userid is  not there
       if(!userId){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
       }
    const {items, addressId, paymentMethod, couponCode} = JSON.parse(textBody || "{}")
    console.log('order payload:', { itemsCount: Array.isArray(items) ? items.length : 0, addressId, paymentMethod, couponCode })

       //check if all required fields are there
       if(!Array.isArray(items) || items.length === 0 || !addressId || !paymentMethod){
        return NextResponse.json({error: "All fields are required"}, {status: 400})
       }

       //get user email for Paystack
       const user = await prisma.user.findUnique({
        where: { id: userId }
       })
       const userEmail = user?.email
             // validate address exists
             const addressExists = await prisma.address.findUnique({ where: { id: addressId } }).catch(() => null)
             if (!addressExists) {
                 return NextResponse.json({ error: "Address not found" }, { status: 404 })
             }

       //check coupon
       let coupon = null
       if(couponCode){
        coupon = await prisma.coupon.findFirst({
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
       if(couponCode && coupon.forNewUser){
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

//create orders for each seller
for(const [storeId, orderItems] of storeByOrders.entries()){
    //calculate total amount for the order
    let orderAmount = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

    //apply coupon discount if present
    if (coupon) {
        orderAmount = orderAmount - (coupon.discount / 100 * orderAmount)
    }

    // determine delivery fee rules based on address city
    // default delivery fee 0 when city is Kumasi (case-insensitive)
    const city = (addressExists.city || '').toString().toLowerCase()
    let deliveryFee = 0
    if (city !== 'kumasi') {
        // if order amount <= 500, flat GHC 20, else 5% of order amount
        if (orderAmount <= 500) {
            deliveryFee = 20
        } else {
            deliveryFee = parseFloat((orderAmount * 0.05).toFixed(2))
        }
    }

    // add delivery fee to the order amount
    orderAmount = parseFloat((orderAmount + deliveryFee).toFixed(2))

    // accumulate to total order amount
    totalOrderAmount += orderAmount

        //create the order
        let newOrder
        try {
            // Force payment method to PAYSTACK (COD disabled)
            const forcedPaymentMethod = PaymentMethod.PAYSTACK

            newOrder = await prisma.order.create({
                data: {
                    userId,
                    storeId,
                    addressId,
                    paymentMethod: forcedPaymentMethod,
                    total: parseFloat(orderAmount.toFixed(2)),
                    isCouponUsed: coupon ? true : false,
                    coupon: coupon ? coupon : {},
                    status: forcedPaymentMethod === PaymentMethod.COD ? 'PROCESSING' : 'ORDER_PLACED',
                    orderItems: {
                        create: orderItems.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })
            console.log('created order id:', newOrder.id)
            orderIds.push(newOrder.id)
        } catch (createErr) {
            console.error('Error creating order for storeId', storeId, 'items:', orderItems, createErr?.message ?? createErr)
            throw createErr
        }
}
//check if payment method is paystack
if(paymentMethod === PaymentMethod.PAYSTACK){
    //initialize paystack
    // prefer request origin, fallback to env var (useful in non-browser requests)
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    try {
        console.log('Initializing Paystack', { origin, totalOrderAmount, orderIds })
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
                // redirect the user to a frontend callback page (not the webhook)
                callback_url: `${origin}/paystack`
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

                // persist paystack reference on created orders to help later correlation
                const paystackRef = response.data.data.reference
                if(paystackRef){
                    await Promise.all(orderIds.map((oid) =>
                        prisma.order.update({ where: { id: oid }, data: { paystackReference: paystackRef } })
                    ))
                }
                console.log('Paystack initialized, authorization_url present')
                return NextResponse.json({authorizationUrl: response.data.data.authorization_url, reference: paystackRef})
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
    console.error('POST /api/orders failed:', error)
    try {
      console.error('detailed error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    } catch (e) { /* ignore stringify errors */ }
    return NextResponse.json({error: error.code || error.message || 'Unknown error'}, {status: 400})
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
                        {paymentStatus: {in: ["PENDING", "AUTHORIZED"]}}
                    ]}
                ]
            },
            include:{
                orderItems: {
                    include: {
                        product: true
                    }
                },
                address: true
            },
            orderBy: {createdAt: 'desc'}
        })
        return NextResponse.json({orders}, {status: 200})
} catch (error) {
        console.error(error)
        return NextResponse.json({error: error.message}, {status: 400})
    }
}
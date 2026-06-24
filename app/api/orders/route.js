import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import prisma from "@/lib/prisma";
import axios from "axios";
import { isSupportedPaymentMethod, normalizePaymentMethod } from "@/lib/paymentProviders.mjs";
import { createHubtelCheckoutSession } from "@/lib/hubtel";
import { savePendingCheckout, abandonPendingCheckout, createOrdersFromPendingCheckout } from "@/lib/checkoutLifecycle";

//Get a new order
export async function POST(request) {
    try {
        console.log('POST /api/orders incoming')
        const textBody = request ? await request.text().catch(() => null) : null
        if(textBody) console.log('raw body length:', textBody.length)
        // user is authenticated via session cookie
        const userId = getSessionUserId(request)
       //check if the userid is not there
       if(!userId){
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
       }
    const {items, addressId, paymentMethod, couponCode} = JSON.parse(textBody || "{}")
    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod)
    console.log('order payload:', { itemsCount: Array.isArray(items) ? items.length : 0, addressId, paymentMethod: normalizedPaymentMethod, couponCode })

       //check if all required fields are there
       if(!Array.isArray(items) || items.length === 0 || !addressId || !normalizedPaymentMethod){
        return NextResponse.json({error: "All fields are required"}, {status: 400})
       }

       if (!isSupportedPaymentMethod(normalizedPaymentMethod)) {
        return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 })
       }

       const selectedPaymentMethod = normalizedPaymentMethod === 'HUBTEL'
        ? PaymentMethod.HUBTEL
        : normalizedPaymentMethod === 'PAYSTACK'
          ? PaymentMethod.PAYSTACK
          : PaymentMethod.COD

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
       //check if the coupon is member-only
       if(couponCode && coupon.forMember){
            return NextResponse.json({error: "This coupon is only for members"}, {status: 403})
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
const orderDrafts = []

//prepare checkout drafts for each seller without creating persisted orders yet
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

        orderDrafts.push({
            storeId,
            orderAmount: parseFloat(orderAmount.toFixed(2)),
            orderItems: orderItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                selectedColor: item.selectedColor || null
            }))
        })
}
await savePendingCheckout(userId, {
    addressId,
    couponCode: couponCode || null,
    coupon,
    orderDrafts,
    paymentMethod: selectedPaymentMethod,
})

if(selectedPaymentMethod === PaymentMethod.COD){
    const createdOrders = await createOrdersFromPendingCheckout({
        userId,
        reference: `cod-${Date.now()}`,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: 'AUTHORIZED',
        status: 'PROCESSING',
    })
    return NextResponse.json({ message: 'Order placed successfully', orderIds: createdOrders.createdOrderIds, totalOrderAmount, paymentMethod: selectedPaymentMethod }, { status: 201 })
}

if(selectedPaymentMethod === PaymentMethod.PAYSTACK){
    //initialize paystack
    // prefer request origin, fallback to env var (useful in non-browser requests)
    const origin = request?.headers?.get?.('origin') || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
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

                const paystackRef = response.data.data.reference
                if(paystackRef){
                    const pendingCheckout = await prisma.user.findUnique({ where: { id: userId }, select: { cart: true } })
                    const cart = pendingCheckout?.cart && typeof pendingCheckout.cart === 'object' && !Array.isArray(pendingCheckout.cart) ? pendingCheckout.cart : {}
                    await prisma.user.update({
                        where: { id: userId },
                        data: { cart: { ...cart, pendingCheckout: { ...(cart.pendingCheckout || {}), reference: paystackRef, paymentMethod: selectedPaymentMethod } } }
                    })
                }
                console.log('Paystack initialized, authorization_url present')
                const authUrl = response.data.data.authorization_url
                console.log('Paystack full response:', JSON.stringify(response.data.data, null, 2))
                console.log('Authorization URL:', authUrl)
                return NextResponse.json({authorizationUrl: authUrl, reference: paystackRef})
    } catch(paystackError) {
        const paystackData = paystackError.response?.data
        const paystackMessage = paystackData?.message || paystackError.message || 'Payment initialization failed'
        const isIpBlocked = /ip address.*not allowed|not allowed to make this call/i.test(paystackMessage)

        console.error('Paystack error:', paystackData || paystackError.message)
        await abandonPendingCheckout(userId)

        return NextResponse.json(
            {
                error: paystackMessage,
                details: isIpBlocked
                    ? 'Paystack rejected the request because this server IP is not allowed. Please whitelist the deployment IP in your Paystack dashboard or switch to a permitted environment.'
                    : undefined
            },
            { status: 400 }
        )
    }
}
if(selectedPaymentMethod === PaymentMethod.HUBTEL){
    const origin = request?.headers?.get?.('origin') || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    try {
        const callbackUrl = `${origin || 'https://localhost:3000'}/hubtel`
        const hubtelResponse = await createHubtelCheckoutSession({
            amount: totalOrderAmount,
            email: userEmail,
            orderIds,
            userId,
            callbackUrl,
            description: 'Jeeshop order payment'
        })

        if (!hubtelResponse.authorizationUrl) {
            throw new Error('No authorization URL received from Hubtel')
        }

        if (hubtelResponse.reference) {
            const pendingCheckout = await prisma.user.findUnique({ where: { id: userId }, select: { cart: true } })
            const cart = pendingCheckout?.cart && typeof pendingCheckout.cart === 'object' && !Array.isArray(pendingCheckout.cart) ? pendingCheckout.cart : {}
            await prisma.user.update({
                where: { id: userId },
                data: { cart: { ...cart, pendingCheckout: { ...(cart.pendingCheckout || {}), reference: hubtelResponse.reference, paymentMethod: selectedPaymentMethod } } }
            })
        }

        return NextResponse.json({ authorizationUrl: hubtelResponse.authorizationUrl, reference: hubtelResponse.reference })
    } catch (hubtelError) {
        console.error('Hubtel error:', hubtelError.message || hubtelError)
        await abandonPendingCheckout(userId)
        return NextResponse.json({ error: hubtelError.message || 'Hubtel payment initialization failed' }, { status: 400 })
    }
}

return NextResponse.json({message: "Checkout initialized", orderIds: [], totalOrderAmount, paymentMethod: selectedPaymentMethod}, {status: 201})
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
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        //find many orders
        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
                OR:[
                    {paymentMethod: PaymentMethod.COD},
                    {AND:[
                        {paymentMethod: {in: [PaymentMethod.PAYSTACK, PaymentMethod.HUBTEL]}},
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
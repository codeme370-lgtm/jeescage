import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


//update user cart
export async function POST(request){
    try {
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401})
        }
        const { cartItems, cart } = await request.json()
        const payload = cartItems || cart || {}

        // Ensure payload is a valid JSON object
        if (typeof payload !== 'object' || payload === null) {
            return NextResponse.json({error: 'Invalid cart data structure'}, {status: 400})
        }

        // Sanitize cart items to ensure they're serializable
        const sanitizedPayload = Object.keys(payload).reduce((acc, key) => {
            const item = payload[key]
            if (typeof item === 'number') {
                acc[key] = item
            } else if (item && typeof item === 'object') {
                acc[key] = {
                    productId: String(item.productId || ''),
                    quantity: Number(item.quantity) || 0,
                    selectedColor: item.selectedColor ? String(item.selectedColor) : null,
                }
            }
            return acc
        }, {})

        //save the cart to the user object
        await prisma.user.update({
            where: {id: userId},
            data: {cart: sanitizedPayload}
        })
        return NextResponse.json({message: "Cart Updated Successfully"})
    } catch (error) {
        console.error('Cart update error:', error)
        return NextResponse.json({error: error.message || 'Failed to update cart'}, {status: 400})
    }
}


//get user cart
export async function GET(request){
    try {
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({error: 'Not authenticated'}, {status: 401})
        }
        //let's find the user

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        return NextResponse.json({cart: user.cart})
    } catch (error) {
        console.error(error)
       return NextResponse.json({error:error.code || error.message}, {status:400})
    
    }
}

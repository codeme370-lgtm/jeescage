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

        //save the cart to the user object
        await prisma.user.update({
            where: {id: userId},
            data: {cart: payload}
        })
        return NextResponse.json({message: "Cart Updated Successfully"})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.code || error.message}, {status:400})
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

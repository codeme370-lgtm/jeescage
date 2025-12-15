import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//verify coupon
export async function POST(request) {
    try {
        //let's get the user id
        const {userId, has}= getAuth(request)
        //code
        const {code} = await request.json()

        //prisma for coupon
        const coupon = await prisma.coupon.findUnique({
            where: {
                code: code.toupperCase(),
                expiresAt: {
                    gt: new Date()
                }
            }
        })
        //if no coupon
        if(!coupon) {
            return NextResponse.json({error: "Invalid or expired coupon"}, {status: 404})
        }
        //if coupon found and the user is new
        if(coupon.forNewUsers){
            const userOrders = await prisma.order.findMany({
                where: {
                    userId: userId
        }
    })
    //if the user has many orders
    if(userOrders.length > 0){
        return NextResponse.json({error: "This coupon is only for new users"}, {status: 403})
    }
}
//check if the coupon is for member
if(coupon.forMembers){
    const hasPlusPlan = has({plan: "plus"})
    //if the user does not have plus plan
    if(!hasPlusPlan){
        return NextResponse.json({error: "This coupon is only for Plus members"}, {status: 403})
    }
}

        return NextResponse.json({coupon}, {status: 200})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})

    }
}
    
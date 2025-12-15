import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"

//update seller order status

export async function POST(request) {
    try {
        const {userid}=getAuth(request)
        const storeId = await authSeller(userid)

        //suppose no store found
        if (!storeId) {
            return NextResponse({ message: "You are not authorized to perform this action" }, { status: 403 })
        }

        //update order status
        const { orderId, status } = await request.json()

        //update the order status in the database
        await prisma.order.update({
            where: {
                id: orderId,
                storeId: storeId
            },
            data: {
                status: status
            }
        })
        return NextResponse.json({ message: "Order status updated successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error:error.code || error.message }, { status: 500 })
    }
}

//Get all orders for a seller

export async function GET(request) {
    try {
        const {userid}=getAuth(request)
        const storeId = await authSeller(userId)
        //suppose no store found
        if (!storeId) {
            return NextResponse({ message: "You are not authorized to perform this action" }, { status: 403 })
        }
        const orders = await prisma.order.findMany({
            where: {
                storeId: storeId},
            include: {
                user: true, address: true, orderItems: { include: { product: true }}
            },
            orderBy: { createdAt: 'desc'}
        },
    )
        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error:error.code || error.message }, { status: 500 })
    }
}
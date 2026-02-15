import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"

//update seller order status

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        //suppose no store found
        if (!storeId) {
            return NextResponse.json({ message: "You are not authorized to perform this action" }, { status: 403 })
        }

        //update order status
        const { orderId, status } = await request.json()

        //update the order status in the database
        const res = await prisma.order.updateMany({
            where: { id: orderId, storeId: storeId },
            data: { status: status }
        })
        if (res.count === 0) {
            return NextResponse.json({ message: "Order not found or unauthorized" }, { status: 404 })
        }
        return NextResponse.json({ message: "Order status updated successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error:error.code || error.message }, { status: 500 })
    }
}

//Get all orders for a seller

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        console.log('GET /api/store/orders userId=', userId)
        const storeId = await authSeller(userId)
        console.log('GET /api/store/orders resolved storeId=', storeId)
        //suppose no store found
        if (!storeId) {
            console.warn('GET /api/store/orders: unauthorized - no store for userId=', userId)
            return NextResponse.json({ message: "You are not authorized to perform this action or your store is not approved" }, { status: 403 })
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
        console.log('GET /api/store/orders: orders found count=', orders.length)
        return NextResponse.json({ orders }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error:error.code || error.message }, { status: 500 })
    }
}
import { getSessionUserId } from "@/lib/authHelpers"
import authAdmin from "@/middlewares/authAdmin"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request) {
    try {
        const userId = await getSessionUserId(request)
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        await authAdmin(userId)

        // Fetch all customers with their order data
        const customers = await prisma.user.findMany({
            where: {
                buyerOrders: {
                    some: {}
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                buyerOrders: {
                    select: {
                        id: true,
                        total: true,
                        createdAt: true,
                        orderItems: {
                            select: {
                                quantity: true,
                                price: true
                            }
                        }
                    }
                }
            }
        })

        // Calculate metrics for each customer
        const customerMetrics = customers.map(customer => {
            const orders = customer.buyerOrders || []
            const totalOrders = orders.length
            const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0)
            const totalQuantity = orders.reduce((sum, order) => {
                return sum + order.orderItems.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
            }, 0)
            const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                image: customer.image,
                joinDate: orders.length > 0 ? orders[0].createdAt : null,
                totalOrders,
                totalSpent,
                totalQuantity,
                avgOrderValue,
                lastOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : null
            }
        })

        // Filter out customers with no orders
        const activeCustomers = customerMetrics.filter(c => c.totalOrders > 0)

        // Sort by different metrics
        const topBySpending = [...activeCustomers].sort((a, b) => b.totalSpent - a.totalSpent)
        const topByQuantity = [...activeCustomers].sort((a, b) => b.totalQuantity - a.totalQuantity)
        const mostVisited = [...activeCustomers].sort((a, b) => b.totalOrders - a.totalOrders)

        return NextResponse.json({
            topBySpending,
            topByQuantity,
            mostVisited,
            totalCustomers: activeCustomers.length,
            allCustomers: activeCustomers
        }, { status: 200 })
    } catch (error) {
        console.error("Error fetching customer analytics:", error)
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
    }
}

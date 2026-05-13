import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
    try {
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get query parameter to determine if we want all or just unread
        const url = new URL(request.url)
        const onlyUnread = url.searchParams.get('unreadOnly') === 'true'

        // Get the store for this user
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            // Return empty alerts if store doesn't exist yet
            return NextResponse.json({ alerts: [] }, { status: 200 })
        }

        // Get all address change alerts for this store
        const alerts = await prisma.addressChangeAlert.findMany({
            where: {
                storeId: store.id,
                ...(onlyUnread && { isRead: false })
            },
            include: {
                order: {
                    include: {
                        user: true,
                        orderItems: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                user: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ alerts }, { status: 200 })

    } catch (error) {
        console.error("Error fetching address change alerts:", error)
        console.error("Error details:", error.message, error.code)
        return NextResponse.json({ error: error.message || "Failed to fetch alerts", alerts: [] }, { status: 200 })
    }
}

export async function PATCH(request) {
    try {
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { alertId } = await request.json()

        if (!alertId) {
            return NextResponse.json({ error: "Missing alertId" }, { status: 400 })
        }

        // Get the store for this user
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        // Mark alert as read
        const alert = await prisma.addressChangeAlert.update({
            where: { id: alertId },
            data: { isRead: true }
        })

        if (alert.storeId !== store.id) {
            return NextResponse.json({ error: "Unauthorized - Alert does not belong to this store" }, { status: 403 })
        }

        return NextResponse.json({ alert }, { status: 200 })

    } catch (error) {
        console.error("Error marking alert as read:", error)
        return NextResponse.json({ error: error.message || "Failed to update alert" }, { status: 500 })
    }
}

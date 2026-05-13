import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { inngest } from '@/lib/inngest'

export async function POST(request) {
    try {
        const userId = getSessionUserId(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { orderId, newAddressId } = await request.json()

        if (!orderId || !newAddressId) {
            return NextResponse.json({ error: "Missing orderId or newAddressId" }, { status: 400 })
        }

        // Verify the order belongs to the user and get current details
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true, store: true, user: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        if (order.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized - Order does not belong to this user" }, { status: 403 })
        }

        // Verify the new address exists and belongs to the user
        const newAddress = await prisma.address.findUnique({
            where: { id: newAddressId }
        })

        if (!newAddress) {
            return NextResponse.json({ error: "New address not found" }, { status: 404 })
        }

        if (newAddress.userId !== userId) {
            return NextResponse.json({ error: "Unauthorized - Address does not belong to this user" }, { status: 403 })
        }

        // Check if order has already been shipped (can only change address before shipping)
        if (order.status === "SHIPPED" || order.status === "DELIVERED") {
            return NextResponse.json({ error: "Cannot change address for shipped or delivered orders" }, { status: 400 })
        }

        // Store old address for the alert
        const oldAddress = order.address

        // Update the order address
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { addressId: newAddressId },
            include: { 
                address: true,
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

        // Create an alert for the store owner
        try {
            const createdAlert = await prisma.addressChangeAlert.create({
                data: {
                    orderId,
                    storeId: order.storeId,
                    userId,
                    oldAddress: oldAddress,
                    newAddress: newAddress
                },
                include: {
                    order: {
                        include: {
                            user: true,
                            orderItems: { include: { product: true } }
                        }
                    },
                    user: true
                }
            })
            // Send an Inngest event for any background processing
            try {
                await inngest.send({
                    name: 'app/address.change',
                    data: createdAlert
                })
            } catch (ie) {
                console.warn('Failed to send inngest event for address change:', ie.message)
            }
        } catch (alertError) {
            console.warn("Warning: Failed to create address change alert:", alertError.message)
            // Continue anyway - address was updated successfully
        }

        return NextResponse.json({
            message: "Address updated successfully",
            order: updatedOrder
        }, { status: 200 })

    } catch (error) {
        console.error("Error updating order address:", error)
        console.error("Error details:", error.message, error.code)
        return NextResponse.json({ error: error.message || "Failed to update address" }, { status: 500 })
    }
}

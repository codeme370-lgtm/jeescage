import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma"
import pusher from "@/lib/pusher"

export async function POST(request) {
  try {
    const userId = getSessionUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, status } = await request.json()
    if (!orderId || !status) return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 })

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== userId) return NextResponse.json({ error: 'Not authorized for this order' }, { status: 403 })

    const report = await prisma.deliveryReport.create({ data: { orderId, storeId: order.storeId, userId, status } })

    // If user reports RECEIVED, mark order as deliveryConfirmed
    if (status === 'RECEIVED') {
      await prisma.order.update({ where: { id: orderId }, data: { deliveryConfirmed: true } })
    }

    // notify store via pusher
    try {
      await pusher.trigger(`private-store-${order.storeId}`, 'deliveryReport', { report, orderId })
    } catch (pErr) {
      console.warn('Pusher notify failed', pErr?.message)
    }

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('delivery-report error', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

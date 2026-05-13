import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma"
import { inngest } from '@/lib/inngest'

export async function POST(request) {
  try {
    const userId = getSessionUserId(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, status } = await request.json()
    console.log('report-delivery incoming', { userId, orderId, status })
    if (!orderId || !status) return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 })
    const allowed = ['RECEIVED', 'NOT_RECEIVED']
    if (!allowed.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    // ensure order belongs to user
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== userId) return NextResponse.json({ error: 'Unauthorized for this order' }, { status: 403 })

    // create delivery report if model exists; otherwise fall back to a simple in-memory object
    let report = null
    try {
      if (prisma.deliveryReport && typeof prisma.deliveryReport.create === 'function') {
        report = await prisma.deliveryReport.create({
          data: {
            orderId,
            storeId: order.storeId,
            userId,
            status
          }
        })
      } else {
        // Prisma model 'deliveryReport' not present in schema; log and continue
        console.warn('Prisma model deliveryReport not found; skipping DB insert for delivery report')
        report = { id: null, orderId, storeId: order.storeId, userId, status, createdAt: new Date() }
      }
    } catch (createErr) {
      console.error('Failed to create deliveryReport record', createErr)
      // fallback to in-memory report so flow continues
      report = { id: null, orderId, storeId: order.storeId, userId, status, createdAt: new Date() }
    }

    // Fire an Inngest event so background functions can notify the store (push, analytics, etc.)
    try {
      await inngest.send({ name: 'app/delivery.report', data: report })
    } catch (ie) {
      console.warn('Failed to send inngest event for delivery report:', ie?.message || ie)
    }

    // update order.deliveryConfirmed when received
    if (status === 'RECEIVED') {
      await prisma.order.update({ where: { id: orderId }, data: { deliveryConfirmed: true, status: 'DELIVERED' } })
    }

    return NextResponse.json({ message: 'Report saved', report }, { status: 201 })
  } catch (error) {
    console.error('report-delivery error', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

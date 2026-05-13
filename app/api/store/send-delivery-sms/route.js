import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"
import pusher from '@/lib/pusher'

export async function POST(request) {
  try {
    const userId = getSessionUserId(request)
    const storeId = await authSeller(userId)
    if (!storeId) return NextResponse.json({ message: "You are not authorized to perform this action" }, { status: 403 })

    const { orderId, hours, message } = await request.json()
    if (!orderId || !hours) return NextResponse.json({ error: "orderId and hours are required" }, { status: 400 })

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: { address: true, orderItems: { include: { product: true } }, user: true }
    })
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    const phone = order.address?.phone
    if (!phone) return NextResponse.json({ error: "Customer phone number missing" }, { status: 400 })

    // Build a concise product list for the SMS
    const productNames = (order.orderItems || []).map(i => i.product?.name).filter(Boolean)
    const previewList = productNames.slice(0, 3).join(', ') + (productNames.length > 3 ? '...' : '')
    const shortId = order.id?.slice(0, 8)
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Jeeshop'

    const defaultMessage = `Hello ${order.user?.name || ''}, thanks for buying ${previewList || 'your items'} from ${siteName}. Your order #${shortId} will be delivered within the next ${hours} hours. We'll notify you if anything changes — ${siteName}`
    const smsBody = (message && message.trim().length > 0) ? message : defaultMessage

    // persist delivery window and deadline on the order and return updated order
    let updatedOrder = null
    try {
      const deadline = new Date(Date.now() + Number(hours) * 3600 * 1000)
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { deliveryWindowHours: Number(hours), deliveryDeadline: deadline, deliveryConfirmed: false },
        include: { address: true, orderItems: { include: { product: true } }, user: true }
      })

      // notify user and store via Pusher so clients can react in real-time
      try {
        if (updatedOrder?.userId) {
          await pusher.trigger(`private-user-${updatedOrder.userId}`, 'orderUpdated', { orderId: updatedOrder.id, deliveryDeadline: updatedOrder.deliveryDeadline })
        }
        if (updatedOrder?.storeId) {
          await pusher.trigger(`private-store-${updatedOrder.storeId}`, 'orderUpdated', { orderId: updatedOrder.id, deliveryDeadline: updatedOrder.deliveryDeadline })
        }
      } catch (pErr) {
        console.warn('Pusher notify failed', pErr?.message || pErr)
      }
    } catch (uErr) {
      console.error('Failed to persist delivery deadline', uErr)
    }

    // Try Vonage (Nexmo) first if configured, then Textbelt as a last-resort fallback.
    let sent = false
    let lastError = null

    // Try Vonage (Nexmo) if configured (lower-cost commercial provider)
    if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET && process.env.VONAGE_FROM) {
      try {
        const axios = require('axios')
        const payload = {
          api_key: process.env.VONAGE_API_KEY,
          api_secret: process.env.VONAGE_API_SECRET,
          to: phone,
          from: process.env.VONAGE_FROM,
          text: smsBody
        }
        const resp = await axios.post('https://rest.nexmo.com/sms/json', payload)
        if (resp?.data && resp.data.messages && resp.data.messages[0] && resp.data.messages[0].status === '0') {
          sent = true
        } else {
          console.error('Vonage rejected message', resp?.data)
          lastError = resp?.data || lastError
        }
      } catch (vErr) {
        console.error('Failed to send SMS via Vonage', vErr)
        lastError = vErr
      }
    }

    if (!sent) {
      // Try Vonage (Nexmo) if configured (lower-cost commercial provider)
      if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET && process.env.VONAGE_FROM) {
        try {
          const axios = require('axios')
          const payload = {
            api_key: process.env.VONAGE_API_KEY,
            api_secret: process.env.VONAGE_API_SECRET,
            to: phone,
            from: process.env.VONAGE_FROM,
            text: smsBody
          }
          const resp = await axios.post('https://rest.nexmo.com/sms/json', payload)
          if (resp?.data && resp.data.messages && resp.data.messages[0] && resp.data.messages[0].status === '0') {
            sent = true
          } else {
            console.error('Vonage rejected message', resp?.data)
            lastError = resp?.data || lastError
          }
        } catch (vErr) {
          console.error('Failed to send SMS via Vonage', vErr)
          lastError = vErr
        }
      }

      // If still not sent, attempt Textbelt as last-resort free fallback.
      if (!sent) {
        try {
          const axios = require('axios')
          const key = process.env.TEXTBELT_KEY || 'textbelt'
          const resp = await axios.post('https://textbelt.com/text', { phone, message: smsBody, key })
          if (resp?.data?.success) {
            sent = true
          } else {
            console.error('Textbelt rejected message', resp?.data)
            lastError = resp?.data || lastError
          }
        } catch (tbErr) {
          console.error('Failed to send SMS via Textbelt', tbErr)
          lastError = tbErr
        }
      }
    }

    if (!sent) {
      console.error('All SMS providers failed', lastError)
      return NextResponse.json({ error: 'Failed to send SMS via all providers' }, { status: 500 })
    }

    return NextResponse.json({ message: 'SMS queued/sent', phone, order: updatedOrder }, { status: 200 })
  } catch (error) {
    console.error('send-delivery-sms error', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}

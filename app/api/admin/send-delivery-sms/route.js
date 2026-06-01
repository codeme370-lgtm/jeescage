import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";
import pusher from '@/lib/pusher';

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ message: "You are not authorized to perform this action" }, { status: 403 });
    }

    const { orderId, hours, message } = await request.json();
    if (!orderId || !hours) {
      return NextResponse.json({ error: "orderId and hours are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true, orderItems: { include: { product: true } }, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const phone = order.address?.phone;
    if (!phone) {
      return NextResponse.json({ error: "Customer phone number missing" }, { status: 400 });
    }

    const productNames = (order.orderItems || []).map(i => i.product?.name).filter(Boolean);
    const previewList = productNames.slice(0, 3).join(', ') + (productNames.length > 3 ? '...' : '');
    const shortId = order.id?.slice(0, 8);
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Jeeshop';
    const defaultMessage = `Hello ${order.user?.name || ''}, thanks for buying ${previewList || 'your items'} from ${siteName}. Your order #${shortId} will be delivered within the next ${hours} hours. We'll notify you if anything changes — ${siteName}`;
    const smsBody = (message && message.trim().length > 0) ? message : defaultMessage;

    const deadline = new Date(Date.now() + Number(hours) * 3600 * 1000);
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { deliveryWindowHours: Number(hours), deliveryDeadline: deadline, deliveryConfirmed: false },
      include: { address: true, orderItems: { include: { product: true } }, user: true },
    });

    try {
      if (updatedOrder?.userId) {
        await pusher.trigger(`private-user-${updatedOrder.userId}`, 'orderUpdated', { orderId: updatedOrder.id, deliveryDeadline: updatedOrder.deliveryDeadline });
      }
      if (updatedOrder?.storeId) {
        await pusher.trigger(`private-store-${updatedOrder.storeId}`, 'orderUpdated', { orderId: updatedOrder.id, deliveryDeadline: updatedOrder.deliveryDeadline });
      }
    } catch (err) {
      console.warn('Pusher notify failed', err?.message || err);
    }

    return NextResponse.json({ message: 'SMS queued/sent', phone, order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error('send-delivery-sms error', error);
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}

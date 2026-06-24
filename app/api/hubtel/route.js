import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createOrdersFromPendingCheckout } from '@/lib/checkoutLifecycle';

export async function POST(request) {
  try {
    const body = await request.json();
    const { reference, orderIds, userId, event } = body || {};

    if (!reference) {
      return NextResponse.json({ error: 'Missing Hubtel reference' }, { status: 400 });
    }

    if (event === 'failed') {
      await Promise.all((orderIds || []).map((orderId) =>
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED', status: 'ORDER_PLACED' },
        })
      ));
      return NextResponse.json({ received: true });
    }

    if (userId) {
      await createOrdersFromPendingCheckout({
        userId,
        reference,
        paymentMethod: 'HUBTEL',
        paymentStatus: 'PENDING',
        status: 'PROCESSING',
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Hubtel webhook failed' }, { status: 400 });
  }
}

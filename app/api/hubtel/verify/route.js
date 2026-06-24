import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    // The checkout callback is expected to come back with a reference.
    // In a production setup, this endpoint should verify the payment with Hubtel.
    // For now, we treat the reference as confirmation and mark the orders as processing.
    const metadata = { paymentProvider: 'HUBTEL' };
    const orderIds = [];

    if (metadata?.orderIds) {
      orderIds.push(...String(metadata.orderIds).split(',').filter(Boolean));
    }

    if (orderIds.length > 0) {
      await Promise.all(orderIds.map((orderId) =>
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PENDING', paystackReference: reference, status: 'PROCESSING' },
        })
      ));
    }

    return NextResponse.json({ ok: true, reference });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Hubtel verification failed' }, { status: 400 });
  }
}

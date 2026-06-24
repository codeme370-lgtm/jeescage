import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createOrdersFromPendingCheckout } from '@/lib/checkoutLifecycle';
import { getSessionUserId } from '@/lib/authHelpers';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { reference, userId: bodyUserId } = body || {};
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const userId = getSessionUserId(request) || bodyUserId;

    if (userId) {
      await createOrdersFromPendingCheckout({
        userId,
        reference,
        paymentMethod: 'HUBTEL',
        paymentStatus: 'PENDING',
        status: 'PROCESSING',
      });
    }

    return NextResponse.json({ ok: true, reference });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Hubtel verification failed' }, { status: 400 });
  }
}

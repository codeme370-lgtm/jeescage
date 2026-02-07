import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Paystack signature" },
        { status: 400 }
      );
    }

    // Verify Paystack signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const { orderIds, userId, appId } = metadata;

      if (appId !== "jeeshop") {
        return NextResponse.json({ received: true });
      }

      const orderIdsArray = orderIds.split(",");

      // Mark orders as paid
      await Promise.all(
        orderIdsArray.map((orderId) =>
          prisma.order.update({
            where: { id: orderId },
            data: { isPaid: true, status: "PROCESSING" },
          })
        )
      );

      // Clear user cart
      await prisma.user.update({
        where: { id: userId },
        data: { cart: {} },
      });
    } else if (event.event === "charge.failed") {
      const { metadata } = event.data;
      const { orderIds, userId, appId } = metadata;

      if (appId !== "jeeshop") {
        return NextResponse.json({ received: true });
      }

      const orderIdsArray = orderIds.split(",");

      // Delete failed orders
      await Promise.all(
        orderIdsArray.map((orderId) =>
          prisma.order.delete({
            where: { id: orderId },
          })
        )
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

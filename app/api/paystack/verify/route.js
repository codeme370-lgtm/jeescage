import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Verify transaction with Paystack
    const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    const data = resp.data;
    if (!data.status || !data.data) {
      throw new Error("Invalid verification response from Paystack");
    }

    const transaction = data.data;

    // If transaction was successful, update orders using metadata
    if (transaction.status === "success") {
      const metadata = transaction.metadata || {};
      const { orderIds, userId, appId } = metadata;
      if (appId !== "jeeshop") {
        return NextResponse.json({ ok: true });
      }

      const orderIdsArray = (orderIds || "").toString().split(",").filter(Boolean);

      await Promise.all(
        orderIdsArray.map((orderId) =>
          prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PENDING",
              paystackReference: reference,
              status: "PROCESSING",
            },
          })
        )
      );

      // Clear user cart if userId provided
      if (userId) {
        await prisma.user.update({ where: { id: userId }, data: { cart: {} } });
      }
    }

    return NextResponse.json({ ok: true, transaction });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 400 });
  }
}

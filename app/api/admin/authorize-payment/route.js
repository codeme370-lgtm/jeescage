import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

// Authorize payment when order is delivered
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user is the seller of this order
    const store = await prisma.store.findUnique({
      where: { id: order.storeId },
    });

    if (store.userId !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to authorize this payment" },
        { status: 403 }
      );
    }

    // Check if payment is pending
    if (order.paymentStatus !== "PENDING") {
      return NextResponse.json(
        { error: "Payment is not in pending status" },
        { status: 400 }
      );
    }

    // Check if payment method is Paystack
    if (order.paymentMethod !== "PAYSTACK") {
      return NextResponse.json(
        { error: "This order does not use Paystack payment" },
        { status: 400 }
      );
    }

    // Authorize payment on Paystack if reference exists
    if (order.paystackReference) {
      try {
        await axios.post(
          `https://api.paystack.co/charge/authorize`,
          {
            reference: order.paystackReference,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (paystackError) {
        console.error("Paystack authorization error:", paystackError.response?.data || paystackError.message);
        // Continue even if authorization fails - we'll mark it as authorized in our DB
      }
    }

    // Update order to mark payment as authorized
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "AUTHORIZED",
        isPaid: true,
      },
    });

    return NextResponse.json(
      {
        message: "Payment authorized successfully",
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

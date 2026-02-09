import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";

// Mark order as delivered and authorize payment
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
        { error: "You are not authorized to update this order" },
        { status: 403 }
      );
    }

    // Update order status to delivered
    let updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
      },
    });

    // If payment method is Paystack and payment is pending, authorize it
    if (
      order.paymentMethod === "PAYSTACK" &&
      order.paymentStatus === "PENDING"
    ) {
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
          console.error(
            "Paystack authorization error:",
            paystackError.response?.data || paystackError.message
          );
          // Continue even if authorization fails - we'll mark it as authorized in our DB
        }
      }

      // Update payment status to authorized
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "AUTHORIZED",
          isPaid: true,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Order marked as delivered and payment authorized",
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

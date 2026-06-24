import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const preferredPaymentMethod = body?.preferredPaymentMethod;
    const supportedMethods = ["PAYSTACK", "HUBTEL"];
    if (!preferredPaymentMethod || !supportedMethods.includes(preferredPaymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { cart: true }
    });
    const cart = typeof user?.cart === 'object' && user?.cart !== null ? user.cart : {};

    const updatedCart = {
      ...cart,
      preferredPaymentMethod,
    };

    await prisma.user.update({
      where: { id: userId },
      data: { cart: updatedCart },
    });

    return NextResponse.json({ preferredPaymentMethod: updatedCart.preferredPaymentMethod });
  } catch (error) {
    console.error("POST /api/user/payment-method error:", error);
    return NextResponse.json({ error: error.message || "Failed to update payment method" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        cart: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((subtotal, order) => subtotal + order.total, 0);
    const paymentMethodsUsed = [...new Set(orders.map((order) => order.paymentMethod))];
    const lastPaymentMethod = orders.length > 0 ? orders[orders.length - 1].paymentMethod : null;
    const joinedAt = orders.length > 0 ? orders[0].createdAt : null;

    const reviewsCount = await prisma.rating.count({
      where: { userId },
    });

    return NextResponse.json({
      user,
      addresses,
      stats: {
        totalOrders,
        totalSpent,
        reviewsCount,
        paymentMethodsUsed,
        lastPaymentMethod,
        joinedAt,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        cart: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    const message = error?.code === "P2002" && error?.meta?.target?.includes("email")
      ? "Email is already in use"
      : error.message || "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

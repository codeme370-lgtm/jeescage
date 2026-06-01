import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        address: true,
        orderItems: { include: { product: true } },
        store: true,
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, status } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ message: "Order status updated successfully", order }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

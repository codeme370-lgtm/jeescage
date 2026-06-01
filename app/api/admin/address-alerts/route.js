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

    const url = new URL(request.url);
    const onlyUnread = url.searchParams.get('unreadOnly') === 'true';

    const alerts = await prisma.addressChangeAlert.findMany({
      where: {
        ...(onlyUnread ? { isRead: false } : {}),
      },
      include: {
        order: {
          include: {
            user: true,
            orderItems: { include: { product: true } },
            store: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Server error", alerts: [] }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { alertId } = await request.json();
    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const alert = await prisma.addressChangeAlert.update({
      where: { id: alertId },
      data: { isRead: true },
    });

    return NextResponse.json({ alert }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

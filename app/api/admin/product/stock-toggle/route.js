import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { inStock: !existing.inStock },
    });

    return NextResponse.json({ message: "Stock status updated", product: updated }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

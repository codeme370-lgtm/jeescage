import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";

export async function GET(request) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // defensive check: surface clearer error if prisma or model is missing
    if (!prisma) {
      console.error('POST /api/admin/product/category: prisma is undefined');
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
    }
    if (!prisma.category || typeof prisma.category.create !== 'function') {
      console.error('POST /api/admin/product/category: prisma.category.create is not available', {
        prismaKeys: Object.keys(prisma),
        categoryProp: prisma.category,
      });
      return NextResponse.json({ error: 'Database model unavailable' }, { status: 500 });
    }
    const created = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

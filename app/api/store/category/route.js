import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/authHelpers";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getFallbackPayloadForRoute, isDatabaseUnavailableError } from "@/lib/prismaFallback.mjs";

export async function GET(request) {
  try {
    console.log('API: GET /api/store/category called')
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json(getFallbackPayloadForRoute('categories'), { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists', category: existingCategory },
        { status: 409 }
      );
    }
    
    const created = await prisma.category.create({ data: { name, slug } });
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (isDatabaseUnavailableError(error)) {
      return NextResponse.json({ error: "Categories service is temporarily unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

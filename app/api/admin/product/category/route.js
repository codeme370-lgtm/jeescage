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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

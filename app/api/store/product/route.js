import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";


export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = Number(formData.get("price"));
    const category = formData.get("category");
    const mrp = Number(formData.get("mrp"));
    const imageUrls = formData.getAll("imageUrls");

    if (
      !name ||
      !description ||
      isNaN(price) ||
      !category ||
      isNaN(mrp) ||
      imageUrls.length < 1
    ) {
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    // Use the uploaded image URLs directly
    const imagesUrl = imageUrls;

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({ message: "product added successfully" });
  } catch (error) {
    console.error("product:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

//Get all products for a seller
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action" },
        { status: 401 }
      );
    }

    //fetch products for the seller's store with optimized query
    const products = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        price: true,
        mrp: true,
        category: true,
        description: true,
        images: true,
        inStock: true,
        createdAt: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("product:get error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

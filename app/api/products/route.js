import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//Get all products or products by storeId
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    let products;

    if (storeId) {
      //get products for a specific store
      products = await prisma.product.findMany({
        where: { storeId },
        select: {
          id: true,
          name: true,
          price: true,
          mrp: true,
          category: true,
          description: true,
          images: true,
          videoUrl: true,
          availableColors: true,
          inStock: true,
          quantity: true,
          rating: true,
          store: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      //get all products
      products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          mrp: true,
          category: true,
          description: true,
          images: true,
          videoUrl: true,
          availableColors: true,
          inStock: true,
          quantity: true,
          rating: true,
          store: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    const productsWithVideoFlag = products.map((product) => ({
      ...product,
      hasVideo: Boolean(product.videoUrl),
    }));

    return NextResponse.json({ products: productsWithVideoFlag }, { status: 200 });
  } catch (error) {
    console.error("products:get error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

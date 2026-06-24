import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";


export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
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
    const quantity = Number(formData.get("quantity"));
    const imageUrls = formData.getAll("imageUrls");
    const videoUrl = formData.get("videoUrl");
    const availableColors = formData.getAll("availableColors").filter(Boolean);

    if (
      !name ||
      !description ||
      isNaN(price) ||
      !category ||
      isNaN(mrp) ||
      isNaN(quantity) ||
      imageUrls.length < 1
    ) {
      return NextResponse.json(
        { error: "missing product details" },
        { status: 400 }
      );
    }

    // Use the uploaded image URLs directly
    const imagesUrl = imageUrls;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        videoUrl: videoUrl || null,
        images: imagesUrl,
        quantity,
        availableColors: availableColors.length > 0 ? availableColors : [],
        storeId,
      },
    });

    return NextResponse.json({ message: "product added successfully", product });
  } catch (error) {
    console.error("product:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// Update existing product (store owner)
export async function PATCH(request) {
  try {
    const userId = getSessionUserId(request);
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

    const { productId, name, price, mrp, description, category, quantity, videoUrl } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found or not authorized" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name ?? existing.name,
        price: typeof price === 'number' ? price : existing.price,
        mrp: typeof mrp === 'number' ? mrp : existing.mrp,
        description: description ?? existing.description,
        category: category ?? existing.category,
        videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
        quantity: typeof quantity === 'number' ? quantity : existing.quantity,
        inStock: typeof quantity === 'number' ? quantity > 0 : existing.inStock,
      },
    });

    return NextResponse.json({ message: "product updated successfully", product: updated }, { status: 200 });
  } catch (error) {
    console.error("product:update error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

//Get all products for a seller
export async function GET(request) {
  try {
    const userId = getSessionUserId(request);
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
        quantity: true,
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

//Delete a product
export async function DELETE(request) {
  try {
    const userId = getSessionUserId(request);
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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    // Check if the product belongs to the store
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or not authorized" },
        { status: 404 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("product:delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

import { getSessionUserId, ensureAdminStore } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
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
    const availableColors = formData.getAll("availableColors").filter(Boolean);
    const imageUrls = formData.getAll("imageUrls");
    const videoUrl = formData.get("videoUrl");

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

    const adminStore = await ensureAdminStore(userId);

    const imagesUrl = imageUrls;

    const createData = {
      name,
      description,
      mrp,
      price,
      category,
      videoUrl: videoUrl || null,
      images: imagesUrl,
      quantity,
      storeId: adminStore.id,
    }

    if (availableColors && availableColors.length > 0) {
      // only include availableColors when provided to avoid DB errors if column missing
      createData.availableColors = availableColors
    }

    const product = await prisma.product.create({ data: createData });

    return NextResponse.json({ message: "product added successfully", product });
  } catch (error) {
    console.error("product:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

// Update existing product (admin)
export async function PATCH(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action" },
        { status: 401 }
      );
    }

    const { productId, name, price, mrp, description, category, quantity, videoUrl, availableColors } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData = {
      name: name ?? existing.name,
      price: typeof price === 'number' ? price : existing.price,
      mrp: typeof mrp === 'number' ? mrp : existing.mrp,
      description: description ?? existing.description,
      category: category ?? existing.category,
      videoUrl: videoUrl !== undefined ? videoUrl : existing.videoUrl,
      quantity: typeof quantity === 'number' ? quantity : existing.quantity,
      inStock: typeof quantity === 'number' ? quantity > 0 : existing.inStock,
    }

    if (availableColors !== undefined) {
      // only attempt to update availableColors if it's provided in request
      updateData.availableColors = Array.isArray(availableColors) ? availableColors.filter(Boolean) : existing.availableColors
    }

    const updated = await prisma.product.update({ where: { id: productId }, data: updateData });

    return NextResponse.json({ message: "product updated successfully", product: updated }, { status: 200 });
  } catch (error) {
    console.error("product:update error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

//Get all products
export async function GET(request) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action" },
        { status: 401 }
      );
    }

    //fetch all products
    const products = await prisma.product.findMany({
      include: {
        store: {
          select: { id: true, name: true }
        }
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

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
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

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
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

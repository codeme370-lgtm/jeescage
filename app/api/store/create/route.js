import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ensureUser from "@/lib/ensureUser";


export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await ensureUser(userId);

    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contacts = formData.get("contacts");
    const address = formData.get("address");
    const image = formData.get("image");

    // image is optional; use default general logo when not provided
    if (!name || !username || !description || !email || !contacts || !address) {
      return NextResponse.json({ error: "missing store info" }, { status: 400 });
    }

    const existingStore = await prisma.store.findFirst({ where: { userId } });
    if (existingStore) {
      return NextResponse.json({ status: existingStore.status });
    }

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase().trim() },
    });

    if (isUsernameTaken) {
      return NextResponse.json({ error: "username is already taken" }, { status: 400 });
    }

    // Do not upload/store custom logos. Use a general default logo instead.
    const logoUrl = "/favicon.ico";

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase().trim(),
        email,
        contact: contacts,
        address,
        logo: logoUrl,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } },
    });

    return NextResponse.json({ message: "applied, waiting for approval" });
  } catch (error) {
    console.error("store:create error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

//Get seller/store status
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json({ status: "no_store" }, { status: 200 });
    }

    return NextResponse.json({ status: store.status }, { status: 200 });
  } catch (error) {
    console.error("store:create GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

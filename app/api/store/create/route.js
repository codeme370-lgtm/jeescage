import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import ensureUser from "@/lib/ensureUser";


export async function POST(request) {
  try {
    const userId = getSessionUserId(request);
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
    return NextResponse.json({ error: "Store creation is disabled. Please contact the administrator." }, { status: 403 });
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
    const userId = getSessionUserId(request);
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

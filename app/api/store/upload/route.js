import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";

// Upload image and return URL
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
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // TODO: Upload to Cloudinary or your preferred cloud storage
    // For now, return the base64 data URI
    // In production, you would upload to Cloudinary like this:
    // const formDataCloudinary = new FormData();
    // formDataCloudinary.append("file", dataURI);
    // formDataCloudinary.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);
    // const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
    //   method: 'POST',
    //   body: formDataCloudinary
    // });
    // const result = await response.json();
    // const imageUrl = result.secure_url;

    const imageUrl = dataURI; // Temporary solution - use base64

    return NextResponse.json(
      { imageUrl, message: "Image uploaded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("image:upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";
import crypto from "crypto";

// Upload image and return URL
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
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary configuration is missing" },
        { status: 500 }
      );
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Generate Cloudinary signature for authenticated upload
    const timestamp = Math.floor(Date.now() / 1000);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Create signature string
    const signatureString = `folder=jeeshop/products&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    // Upload to Cloudinary with authentication
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", dataURI);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", "jeeshop/products");

    // Determine upload endpoint based on file type
    const isVideo = file.type.startsWith('video/');
    const uploadEndpoint = isVideo ? 'video/upload' : 'image/upload';

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${uploadEndpoint}`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const result = await response.json();
      const mediaUrl = result.secure_url;

      return NextResponse.json(
        { mediaUrl, message: `${isVideo ? 'Video' : 'Image'} uploaded successfully` },
        { status: 200 }
      );
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || `Failed to upload ${isVideo ? 'video' : 'image'} to Cloudinary` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("image:upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

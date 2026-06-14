import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import crypto from "crypto";

// Upload image and return URL
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

    // Validate file size
    const isVideo = file.type.startsWith('video/');
    const maxSizeVideo = 500 * 1024 * 1024; // 500MB for videos
    const maxSizeImage = 100 * 1024 * 1024; // 100MB for images
    const maxSize = isVideo ? maxSizeVideo : maxSizeImage;

    if (file.size > maxSize) {
      const maxSizeMB = isVideo ? 500 : 100;
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
    cloudinaryFormData.append("file", new Blob([buffer], { type: file.type }), file.name);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", "jeeshop/products");

    // Determine upload endpoint based on file type
    const uploadEndpoint = isVideo ? 'video/upload' : 'image/upload';

    try {
      // Create abort controller for timeout (longer for videos)
      const timeoutMs = isVideo ? 120000 : 60000; // 2 min for video, 1 min for image
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${uploadEndpoint}`,
          {
            method: "POST",
            body: cloudinaryFormData,
            signal: abortController.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Cloudinary upload failed");
        }

        const result = await response.json();
        const mediaUrl = result.secure_url;

        return NextResponse.json(
          { mediaUrl, imageUrl: mediaUrl, message: `${isVideo ? 'Video' : 'Image'} uploaded successfully` },
          { status: 200 }
        );
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error(`Upload timeout - ${isVideo ? 'video' : 'image'} upload took too long. Please try a smaller file.`);
        }
        throw fetchError;
      }
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

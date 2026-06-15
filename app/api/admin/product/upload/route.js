import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import crypto from "crypto";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

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

    // Configure Cloudinary SDK
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'jeeshop/products', resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        // Pipe buffer to Cloudinary upload stream
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

      const mediaUrl = result.secure_url;
      return NextResponse.json(
        { mediaUrl, imageUrl: mediaUrl, message: `${isVideo ? 'Video' : 'Image'} uploaded successfully` },
        { status: 200 }
      );
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      console.error("Error details:", {
        message: uploadError.message,
        name: uploadError.name,
        stack: uploadError.stack,
      });
      return NextResponse.json(
        { error: uploadError.message || `Failed to upload ${isVideo ? 'video' : 'image'} to Cloudinary` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("image:upload error:", error);
    console.error("Outer error details:", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

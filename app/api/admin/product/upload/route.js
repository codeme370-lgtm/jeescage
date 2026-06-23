import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import authAdmin from "@/middlewares/authAdmin";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";




export async function POST(request) {

  const uploadId = crypto.randomUUID();
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated", uploadId }, { status: 401 });
    }

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "you are not authorized to perform this action", uploadId },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: "Invalid request body. Expected multipart/form-data.",
          receivedContentType: contentType || null,
          uploadId,
        },
        { status: 400 }
      );
    }

    let formData;
    try {
      formData = await request.formData();
    } catch (err) {
      return NextResponse.json(
        {
          error: "Payload too large or malformed multipart/form-data.",
          details: err?.message || String(err),
          uploadId,
        },
        { status: 413 }
      );
    }

    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided", uploadId }, { status: 400 });
    }

    if (typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        {
          error: "Invalid file payload. Expected a File.",
          uploadId,
        },
        { status: 400 }
      );
    }

    const fileName = file?.name || "(no-name)";
    const fileType = file?.type || "";
    const fileSize = Number(file?.size || 0);

    const isVideo = fileType.toLowerCase().startsWith("video/");
    const resourceType = isVideo ? "video" : "image";
    const safeName = (fileName || "file")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .toLowerCase() || "file";
    const publicId = `jeeshop/products/${safeName}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const maxSizeVideo = 500 * 1024 * 1024;
    const maxSizeImage = 100 * 1024 * 1024;
    const maxSize = isVideo ? maxSizeVideo : maxSizeImage;

    if (!fileSize || fileSize > maxSize) {
      return NextResponse.json(
        {
          error: isVideo ? "Video file is missing/invalid size" : "Image file is missing/invalid size",
          details: { fileSize, maxAllowedBytes: maxSize },
          uploadId,
        },
        { status: 400 }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: "Cloudinary configuration is missing", uploadId }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "jeeshop/products",
              public_id: publicId,
              resource_type: resourceType,
              use_filename: false,
              unique_filename: false,
              overwrite: false,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

      const result = await streamUpload();
      const mediaUrl = result.secure_url;
      return NextResponse.json(
        {
          mediaUrl,
          imageUrl: mediaUrl,
          videoUrl: isVideo ? mediaUrl : undefined,
          message: `${isVideo ? "Video" : "Image"} uploaded successfully`,
          uploadId,
        },
        { status: 200 }
      );
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      console.error("Cloudinary error details:", {
        uploadId,
        fileName,
        fileType,
        fileSize,
        resourceType,
        message: uploadError?.message,
        name: uploadError?.name,
        stack: uploadError?.stack,
        http_code: uploadError?.http_code,
        raw: uploadError?.raw,
      });

      return NextResponse.json(
        {
          error: uploadError?.message || `Failed to upload ${isVideo ? "video" : "image"} to Cloudinary`,
          uploadId,
          file: { name: fileName, type: fileType, size: fileSize },
          resourceType,
          details: {
            http_code: uploadError?.http_code,
            rawMessage: uploadError?.raw || undefined,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("upload route outer error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Server error",
        uploadId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}


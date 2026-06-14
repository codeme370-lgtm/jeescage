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

    // Create signature - params must be in alphabetical order
    const params = {
      api_key: apiKey,
      folder: 'jeeshop/products',
      resource_type: 'auto',
      timestamp: timestamp.toString(),
    };

    // Sort params and create signature string
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const signatureString = sortedParams + apiSecret;
    const signature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');

    // Upload to Cloudinary with authentication
    const cloudinaryFormData = new FormData();
    // Append as buffer directly wrapped in a way that works on Node.js
    cloudinaryFormData.append("file", new Blob([buffer], { type: file.type }), file.name);
    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", timestamp.toString());
    cloudinaryFormData.append("signature", signature);
    cloudinaryFormData.append("folder", "jeeshop/products");
    cloudinaryFormData.append("resource_type", "auto");

    // Use unified upload endpoint with resource_type=auto
    const uploadEndpoint = 'upload';

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
          console.error("Cloudinary error response:", {
            status: response.status,
            errorMessage: errorData.error?.message,
            fullError: errorData,
            fileType: file.type,
            fileSize: file.size,
            isVideo
          });
          throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
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
      console.error("Error details:", {
        message: uploadError.message,
        name: uploadError.name,
        stack: uploadError.stack
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

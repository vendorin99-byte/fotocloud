import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const displayName = formData.get("displayName") as string;
    const category = formData.get("category") as string;
    const price = parseInt(formData.get("price") as string);

    if (!file || !displayName || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload to Cloudinary
    const buffer = await file.arrayBuffer();
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "fotocloud/marketplace",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(Buffer.from(buffer));
    });

    const uploadData = uploadResponse as any;

    // Get first project (or create placeholder)
    let project = await prisma.project.findFirst({
      where: { photographerId: session.user.id },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          photographerId: session.user.id,
          name: "Marketplace Photos",
          description: "Direct uploads for marketplace",
        },
      });
    }

    // Create MediaItem
    const mediaItem = await prisma.mediaItem.create({
      data: {
        projectId: project.id,
        name: displayName,
        displayName,
        category: category || null,
        price,
        isForSale: true,
        type: "photo",
        thumbnailUrl: uploadData.secure_url,
        webViewUrl: uploadData.secure_url,
        downloadUrl: uploadData.secure_url,
        mimeType: file.type,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      mediaItem,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

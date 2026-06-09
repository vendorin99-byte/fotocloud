import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  driveLink: z.string().url(),
  displayName: z.string(),
  category: z.string().optional(),
  price: z.number().int().positive(),
});

function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const fileId = extractDriveFileId(data.driveLink);
    if (!fileId) {
      return NextResponse.json(
        { error: "Invalid Google Drive link" },
        { status: 400 }
      );
    }

    // Get first project (or create placeholder)
    let project = await prisma.project.findFirst({
      where: { photographerId: session.user.id },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          photographerId: session.user.id,
          name: "Marketplace Photos",
          description: "Photos for marketplace",
        },
      });
    }

    // Create thumbnail URL from Google Drive
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Create MediaItem linked to Drive file
    const mediaItem = await prisma.mediaItem.create({
      data: {
        projectId: project.id,
        driveFileId: fileId,
        name: data.displayName,
        displayName: data.displayName,
        category: data.category || null,
        price: data.price,
        isForSale: true,
        thumbnailUrl,
        webViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
        downloadUrl,
        mimeType: "image/jpeg",
      },
    });

    return NextResponse.json({
      success: true,
      mediaItem,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Drive sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  driveLink: z.string().url(),
  displayName: z.string().optional(),
  category: z.string().optional(),
  price: z.number().int().positive(),
  projectName: z.string().optional(), // Custom project name
});

function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractDriveFileName(url: string): string | null {
  // Extract from various Drive URL patterns
  // Pattern 1: /d/ID/view?usp=sharing&name=filename
  let match = url.match(/[?&]name=([^&]+)/);
  if (match) return decodeURIComponent(match[1]);

  // Pattern 2: Just use generic name based on file ID
  return null;
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

    // Create or get project - prioritize custom projectName
    const projectName = data.projectName || "Marketplace Photos";
    let project = await prisma.project.findFirst({
      where: { photographerId: session.user.id, name: projectName },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          photographerId: session.user.id,
          name: projectName,
          description: "Photos for marketplace",
          driveFolderId: fileId.substring(0, 20), // Use file ID as reference
        },
      });
    }

    // Use displayName if provided, otherwise generic name (don't auto-extract from Drive)
    const fileName = data.displayName || `Photo-${fileId.substring(0, 8)}`;

    // Create thumbnail URL from Google Drive
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Create MediaItem linked to Drive file
    const mediaItem = await prisma.mediaItem.create({
      data: {
        projectId: project.id,
        driveFileId: fileId,
        name: fileName,
        displayName: data.displayName || fileName,
        category: data.category || null,
        price: data.price,
        isForSale: true,
        type: "photo",
        thumbnailUrl,
        webViewUrl: `https://drive.google.com/file/d/${fileId}/view`,
        downloadUrl,
        mimeType: "image/jpeg",
      },
    });

    return NextResponse.json({
      success: true,
      mediaItem,
      projectName: project.name,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Drive sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

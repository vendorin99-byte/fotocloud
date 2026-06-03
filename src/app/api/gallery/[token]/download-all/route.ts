import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      select: { id: true, projectId: true, isActive: true, canDownload: true, expiresAt: true },
    });

    if (!accessToken?.isActive || !accessToken.canDownload) {
      return NextResponse.json({ error: "Download not allowed" }, { status: 403 });
    }

    if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 403 });
    }

    // Get approved media items
    const items = await prisma.mediaItem.findMany({
      where: {
        projectId: accessToken.projectId,
        isHidden: false,
        reviews: {
          some: {
            accessTokenId: accessToken.id,
            status: "approved",
          },
        },
      },
      select: {
        id: true,
        name: true,
        downloadUrl: true,
      },
    });

    // Return JSON list of download URLs (client will handle zip)
    // Or return redirect to first file for MVP
    if (items.length === 0) {
      return NextResponse.json({ error: "No approved items" }, { status: 404 });
    }

    return NextResponse.json({
      projectId: accessToken.projectId,
      count: items.length,
      items: items.map((i) => ({
        name: i.name,
        url: i.downloadUrl,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

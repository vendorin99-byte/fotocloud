import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; mediaId: string }> }
) {
  const { token, mediaId } = await params;

  const accessToken = await prisma.accessToken.findUnique({
    where: { token },
    select: {
      id: true,
      isActive: true,
      expiresAt: true,
      canDownload: true,
      projectId: true,
    },
  });

  if (!accessToken?.isActive) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 403 });
  }
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token sudah expired" }, { status: 403 });
  }
  if (!accessToken.canDownload) {
    return NextResponse.json({ error: "Download tidak diizinkan" }, { status: 403 });
  }

  const mediaItem = await prisma.mediaItem.findFirst({
    where: { id: mediaId, projectId: accessToken.projectId, isHidden: false },
  });

  if (!mediaItem) {
    return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
  }

  const downloadUrl = `https://drive.google.com/uc?export=download&id=${mediaItem.driveFileId}`;
  return NextResponse.redirect(downloadUrl);
}

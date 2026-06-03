import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { token },
      select: { id: true, projectId: true, isActive: true, expiresAt: true },
    });

    if (!accessToken?.isActive || (accessToken.expiresAt && accessToken.expiresAt < new Date())) {
      return NextResponse.json({ error: "Token invalid" }, { status: 403 });
    }

    // Track view
    await prisma.galleryView.create({
      data: {
        projectId: accessToken.projectId,
        accessTokenId: accessToken.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

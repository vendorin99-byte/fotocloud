import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  mediaItemId: z.string(),
  status: z.enum(["approved", "revision_requested"]),
  revisionNote: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const accessToken = await prisma.accessToken.findUnique({
    where: { token },
    select: { id: true, isActive: true, expiresAt: true, projectId: true },
  });

  if (!accessToken?.isActive) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 403 });
  }
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token sudah expired" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verify media item belongs to the same project
    const mediaItem = await prisma.mediaItem.findFirst({
      where: { id: data.mediaItemId, projectId: accessToken.projectId },
    });
    if (!mediaItem) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
    }

    const review = await prisma.mediaReview.upsert({
      where: {
        mediaItemId_accessTokenId: {
          mediaItemId: data.mediaItemId,
          accessTokenId: accessToken.id,
        },
      },
      update: {
        status: data.status,
        revisionNote: data.revisionNote ?? null,
        reviewedAt: new Date(),
      },
      create: {
        mediaItemId: data.mediaItemId,
        accessTokenId: accessToken.id,
        status: data.status,
        revisionNote: data.revisionNote ?? null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(review);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

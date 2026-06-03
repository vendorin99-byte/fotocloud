import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  mediaItemId: z.string(),
  authorName: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
  timestampSecs: z.number().int().nonnegative().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const accessToken = await prisma.accessToken.findUnique({
    where: { token },
    select: {
      id: true,
      isActive: true,
      expiresAt: true,
      canComment: true,
      projectId: true,
    },
  });

  if (!accessToken?.isActive) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 403 });
  }
  if (accessToken.expiresAt && accessToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token sudah expired" }, { status: 403 });
  }
  if (!accessToken.canComment) {
    return NextResponse.json({ error: "Komentar tidak diizinkan" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const mediaItem = await prisma.mediaItem.findFirst({
      where: { id: data.mediaItemId, projectId: accessToken.projectId },
    });
    if (!mediaItem) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        mediaItemId: data.mediaItemId,
        accessTokenId: accessToken.id,
        authorName: data.authorName,
        body: data.body,
        timestampSecs: data.timestampSecs ?? null,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

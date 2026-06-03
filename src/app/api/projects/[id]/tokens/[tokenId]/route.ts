import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedToken(tokenId: string, userId: string) {
  return prisma.accessToken.findFirst({
    where: {
      id: tokenId,
      project: { photographerId: userId },
    },
  });
}

const updateSchema = z.object({
  label: z.string().optional(),
  isActive: z.boolean().optional(),
  canDownload: z.boolean().optional(),
  canComment: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tokenId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tokenId } = await params;
  const token = await getOwnedToken(tokenId, session.user.id);
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.accessToken.update({
      where: { id: tokenId },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tokenId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tokenId } = await params;
  const token = await getOwnedToken(tokenId, session.user.id);
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.accessToken.delete({ where: { id: tokenId } });
  return NextResponse.json({ success: true });
}

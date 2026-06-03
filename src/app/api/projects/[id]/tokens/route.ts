import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils/slugify";

async function getOwnedProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, photographerId: userId },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tokens = await prisma.accessToken.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true, comments: true } } },
  });

  return NextResponse.json(tokens);
}

const createSchema = z.object({
  label: z.string().optional(),
  canDownload: z.boolean().default(true),
  canComment: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Auto-generate slug from project name
    const baseSlug = slugify(project.name);
    // Ensure uniqueness by appending random suffix if slug taken
    let slug = baseSlug;
    const existing = await prisma.accessToken.findUnique({ where: { slug } });
    if (existing) slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const token = await prisma.accessToken.create({
      data: {
        projectId: id,
        slug,
        label: data.label,
        canDownload: data.canDownload,
        canComment: data.canComment,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(token, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

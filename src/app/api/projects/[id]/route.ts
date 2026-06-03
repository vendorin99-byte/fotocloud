import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDriveFolderId, isValidDriveFolderUrl } from "@/lib/utils/drive-url";

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, photographerId: userId },
  });
  return project;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, photographerId: session.user.id },
    include: {
      mediaItems: {
        where: { isHidden: false },
        orderBy: [{ sortOrder: "asc" }, { takenAt: "asc" }],
        include: {
          _count: { select: { reviews: true, comments: true } },
          reviews: {
            select: { status: true, accessToken: { select: { label: true } } },
          },
        },
      },
      accessTokens: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { reviews: true, comments: true } } },
      },
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  clientName: z.string().optional(),
  description: z.string().optional(),
  driveFolderUrl: z.string().optional(),
});

export async function PATCH(
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
    const data = updateSchema.parse(body);

    let driveFolderId = project.driveFolderId;
    if (data.driveFolderUrl !== undefined) {
      if (data.driveFolderUrl && !isValidDriveFolderUrl(data.driveFolderUrl)) {
        return NextResponse.json({ error: "URL Google Drive tidak valid" }, { status: 400 });
      }
      driveFolderId = data.driveFolderUrl
        ? extractDriveFolderId(data.driveFolderUrl)
        : null;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.clientName !== undefined && { clientName: data.clientName }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.driveFolderUrl !== undefined && {
          driveFolderUrl: data.driveFolderUrl,
          driveFolderId,
          syncStatus: "pending",
        }),
      },
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
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getOwnedProject(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

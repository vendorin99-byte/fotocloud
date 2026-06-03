import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractDriveFolderId, isValidDriveFolderUrl } from "@/lib/utils/drive-url";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { photographerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { mediaItems: true, accessTokens: true } },
    },
  });

  return NextResponse.json(projects);
}

const createSchema = z.object({
  name: z.string().min(1),
  clientName: z.string().optional(),
  description: z.string().optional(),
  driveFolderUrl: z.string().optional(),
});

export const FREE_PROJECT_LIMIT = 1;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Enforce free tier limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        planExpiresAt: true,
        _count: { select: { projects: true } },
      },
    });

    const isPro =
      user?.plan === "pro" &&
      (!user.planExpiresAt || user.planExpiresAt > new Date());

    if (!isPro && (user?._count.projects ?? 0) >= FREE_PROJECT_LIMIT) {
      return NextResponse.json(
        { error: "free_limit", message: `Akun gratis hanya bisa membuat ${FREE_PROJECT_LIMIT} project. Upgrade ke Pro untuk unlimited.` },
        { status: 403 }
      );
    }

    let driveFolderId: string | null = null;
    if (data.driveFolderUrl) {
      if (!isValidDriveFolderUrl(data.driveFolderUrl)) {
        return NextResponse.json({ error: "URL Google Drive tidak valid" }, { status: 400 });
      }
      driveFolderId = extractDriveFolderId(data.driveFolderUrl);
    }

    const project = await prisma.project.create({
      data: {
        name: data.name,
        clientName: data.clientName,
        description: data.description,
        driveFolderUrl: data.driveFolderUrl,
        driveFolderId,
        photographerId: session.user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

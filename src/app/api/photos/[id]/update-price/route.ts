import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  price: z.number().int().min(0).optional(),
  isForSale: z.boolean().optional(),
  category: z.string().optional(),
  displayName: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verify ownership
    const mediaItem = await prisma.mediaItem.findUnique({
      where: { id: params.id },
      include: { project: true },
    });

    if (!mediaItem) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (mediaItem.project.photographerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update
    const updated = await prisma.mediaItem.update({
      where: { id: params.id },
      data: {
        price: data.price,
        isForSale: data.isForSale,
        category: data.category,
        displayName: data.displayName,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Update price error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

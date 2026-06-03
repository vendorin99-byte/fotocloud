import { NextRequest, NextResponse } from "next/server";
import { getGalleryByToken } from "@/lib/gallery/token";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const gallery = await getGalleryByToken(token);

  if (!gallery) {
    return NextResponse.json(
      { error: "Galeri tidak ditemukan atau link tidak aktif" },
      { status: 404 }
    );
  }

  return NextResponse.json(gallery);
}

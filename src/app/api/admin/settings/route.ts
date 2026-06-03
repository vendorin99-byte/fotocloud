import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    const created = await prisma.appSettings.create({
      data: { id: "default" },
    });
    return NextResponse.json(created);
  }

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const updated = await prisma.appSettings.update({
    where: { id: "default" },
    data: {
      proMonthlyPrice: body.proMonthlyPrice ?? undefined,
      proYearlyPrice: body.proYearlyPrice ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

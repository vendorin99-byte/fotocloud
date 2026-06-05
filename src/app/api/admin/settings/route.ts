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
      pro1MonthPrice: body.pro1MonthPrice ?? undefined,
      pro3MonthPrice: body.pro3MonthPrice ?? undefined,
      pro12MonthPrice: body.pro12MonthPrice ?? undefined,
      trialDays: body.trialDays ?? undefined,
      freeProjectLimit: body.freeProjectLimit ?? undefined,
    },
  });

  return NextResponse.json(updated);
}

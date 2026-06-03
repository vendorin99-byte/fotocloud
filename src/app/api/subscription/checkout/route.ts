import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSnapToken, PRO_PLANS, type PlanKey } from "@/lib/midtrans";

const schema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { plan } = schema.parse(body);

    const planConfig = PRO_PLANS[plan as PlanKey];
    const orderId = `FC-${session.user.id.slice(-6)}-${Date.now()}`;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    const snapToken = await createSnapToken({
      orderId,
      amount: planConfig.amount,
      customerName: user?.name ?? "Fotografer",
      customerEmail: user?.email ?? "",
      itemName: planConfig.description,
    });

    // Save pending subscription record
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        orderId,
        snapToken,
        amount: planConfig.amount,
        planDurationDays: planConfig.days,
        status: "pending",
      },
    });

    return NextResponse.json({ snapToken, orderId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

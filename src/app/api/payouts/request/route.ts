import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  amount: z.number().int().min(100000), // Min Rp 100K
  bankName: z.string(),
  bankAccount: z.string(),
  accountHolder: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    // Get current balance
    const balance = await prisma.photographerBalance.findUnique({
      where: { photographerId: session.user.id },
    });

    if (!balance || balance.balance < data.amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Check for pending payout
    const pending = await prisma.payoutRequest.findFirst({
      where: {
        photographerId: session.user.id,
        status: "pending",
      },
    });

    if (pending) {
      return NextResponse.json(
        { error: "Anda sudah memiliki payout request yang pending" },
        { status: 400 }
      );
    }

    // Create payout request
    const payout = await prisma.payoutRequest.create({
      data: {
        photographerId: session.user.id,
        amount: data.amount,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        accountHolder: data.accountHolder,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
      amount: payout.amount,
      status: payout.status,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Payout request error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { photographerId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (err) {
    console.error("Payout list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

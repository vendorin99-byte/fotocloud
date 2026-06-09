import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create balance
    let balance = await prisma.photographerBalance.findUnique({
      where: { photographerId: session.user.id },
    });

    if (!balance) {
      balance = await prisma.photographerBalance.create({
        data: {
          photographerId: session.user.id,
          balance: 0,
          totalEarned: 0,
          totalPaidOut: 0,
        },
      });
    }

    // Get recent transactions (last 10)
    const transactions = await prisma.transaction.findMany({
      where: { photographerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get pending payout requests
    const pendingPayouts = await prisma.payoutRequest.findMany({
      where: {
        photographerId: session.user.id,
        status: "pending",
      },
    });

    return NextResponse.json({
      balance: balance.balance,
      totalEarned: balance.totalEarned,
      totalPaidOut: balance.totalPaidOut,
      pendingPayoutAmount: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
      recentTransactions: transactions,
      pendingPayouts,
    });
  } catch (err) {
    console.error("Balance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

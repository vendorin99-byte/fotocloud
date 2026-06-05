import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    const subscription = await prisma.subscription.findUnique({
      where: { orderId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check status via Midtrans
    const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");
    const statusResponse = await fetch(
      `https://app.sandbox.midtrans.com/v2/${orderId}/status`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error(`Midtrans check failed (${statusResponse.status}):`, errorText);
      return NextResponse.json(
        { error: `Failed to check: ${statusResponse.status}` },
        { status: 500 }
      );
    }

    const statusData = await statusResponse.json() as any;
    const isPaid =
      (statusData.transaction_status === "capture" &&
        statusData.fraud_status === "accept") ||
      statusData.transaction_status === "settlement";

    if (isPaid && subscription.status !== "paid") {
      const now = new Date();
      const planExpiresAt = new Date(
        now.getTime() + subscription.planDurationDays * 24 * 60 * 60 * 1000
      );

      await prisma.$transaction([
        prisma.subscription.update({
          where: { orderId },
          data: { status: "paid", paidAt: now },
        }),
        prisma.user.update({
          where: { id: subscription.userId },
          data: { plan: "pro", planExpiresAt, trialEndsAt: null },
        }),
      ]);

      const periodLabel =
        subscription.planDurationDays === 30
          ? "1 Bulan"
          : subscription.planDurationDays === 90
            ? "3 Bulan"
            : "1 Tahun";
      if (subscription.user.email) {
        await sendPaymentReceiptEmail(
          subscription.user.email,
          subscription.user.name || "User",
          orderId,
          subscription.amount,
          periodLabel
        );
      }

      return NextResponse.json({ status: "paid" });
    }

    return NextResponse.json({ status: subscription.status });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

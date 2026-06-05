import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { sendPaymentReceiptEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    order_id: orderId,
    transaction_status: txStatus,
    fraud_status: fraudStatus,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
  } = body;

  // Verify signature
  if (!verifyMidtransSignature(orderId, statusCode, grossAmount, signatureKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const isPaid =
    (txStatus === "capture" && fraudStatus === "accept") ||
    txStatus === "settlement";

  const isFailed =
    txStatus === "cancel" ||
    txStatus === "deny" ||
    txStatus === "expire";

  const subscription = await prisma.subscription.findUnique({
    where: { orderId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (isPaid && subscription.status !== "paid") {
    const now = new Date();
    const planExpiresAt = new Date(now.getTime() + subscription.planDurationDays * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { orderId },
        data: { status: "paid", paidAt: now },
      }),
      prisma.user.update({
        where: { id: subscription.userId },
        data: {
          plan: "pro",
          planExpiresAt,
          trialEndsAt: null, // Clear trial when upgrading
        },
      }),
    ]);

    // Send payment receipt email
    const periodLabel = subscription.planDurationDays === 30 ? "1 Bulan" : subscription.planDurationDays === 90 ? "3 Bulan" : "1 Tahun";
    if (subscription.user.email) {
      await sendPaymentReceiptEmail(
        subscription.user.email,
        subscription.user.name || "User",
        orderId,
        subscription.amount,
        periodLabel
      );
    }
  } else if (isFailed) {
    await prisma.subscription.update({
      where: { orderId },
      data: { status: txStatus === "expire" ? "expired" : "failed" },
    });
  }

  return NextResponse.json({ ok: true });
}

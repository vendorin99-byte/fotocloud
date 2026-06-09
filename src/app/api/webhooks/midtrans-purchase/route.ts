import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Midtrans webhook for photo purchases
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body.order_id;
    const transactionStatus = body.transaction_status;

    if (!orderId) {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // Find purchases by order ID
    const purchases = await prisma.purchase.findMany({
      where: { midtransOrderId: orderId },
    });

    if (!purchases.length) {
      return NextResponse.json({ error: "Purchases not found" }, { status: 404 });
    }

    // Update status based on transaction status
    let newStatus = "pending";
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      newStatus = "paid";
    } else if (transactionStatus === "deny" || transactionStatus === "cancel") {
      newStatus = "failed";
    }

    // Update all purchases for this order
    await Promise.all(
      purchases.map((purchase) =>
        prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: newStatus,
            paidAt: newStatus === "paid" ? new Date() : null,
          },
        })
      )
    );

    // If paid, create transactions and update balance
    if (newStatus === "paid") {
      const buyerEmail = purchases[0].buyerEmail;
      const buyerName = purchases[0].buyerName;

      // Get commission config
      const config = await prisma.commissionConfig.findUnique({
        where: { id: "default" },
      });

      const photographerPercent = config?.photographerPercent || 80;

      // Get media items and their photographers
      for (const purchase of purchases) {
        const mediaItem = await prisma.mediaItem.findUnique({
          where: { id: purchase.mediaItemId },
          include: { project: { select: { photographerId: true } } },
        });

        if (mediaItem) {
          const photographerId = mediaItem.project.photographerId;
          const photographerAmount = Math.floor(
            (purchase.amount * photographerPercent) / 100
          );

          // Create transaction record
          await prisma.transaction.create({
            data: {
              photographerId,
              type: "sale",
              amount: photographerAmount,
              description: `Sale: ${mediaItem.displayName || mediaItem.name}`,
              purchaseId: purchase.id,
              status: "completed",
            },
          });

          // Update or create photographer balance
          const existingBalance =
            await prisma.photographerBalance.findUnique({
              where: { photographerId },
            });

          if (existingBalance) {
            await prisma.photographerBalance.update({
              where: { photographerId },
              data: {
                balance: {
                  increment: photographerAmount,
                },
                totalEarned: {
                  increment: photographerAmount,
                },
              },
            });
          } else {
            await prisma.photographerBalance.create({
              data: {
                photographerId,
                balance: photographerAmount,
                totalEarned: photographerAmount,
                totalPaidOut: 0,
              },
            });
          }
        }
      }

      // TODO: Send purchase confirmation email
      console.log(`[Purchase confirmed] ${buyerEmail} - ${orderId}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

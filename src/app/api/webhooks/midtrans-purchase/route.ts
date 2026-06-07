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

    // If paid, send confirmation email
    if (newStatus === "paid") {
      const buyerEmail = purchases[0].buyerEmail;
      const buyerName = purchases[0].buyerName;

      // TODO: Send purchase confirmation email
      console.log(`[Purchase confirmed] ${buyerEmail} - ${orderId}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  mediaItemIds: z.array(z.string()).min(1),
  buyerEmail: z.string().email(),
  buyerName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mediaItemIds, buyerEmail, buyerName } = schema.parse(body);

    // Get media items & verify they're for sale
    const mediaItems = await prisma.mediaItem.findMany({
      where: {
        id: { in: mediaItemIds },
        isForSale: true,
      },
    });

    if (mediaItems.length !== mediaItemIds.length) {
      return NextResponse.json(
        { error: "Some photos not available for purchase" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalPrice = mediaItems.reduce((sum, item) => sum + (item.price || 0), 0);

    if (totalPrice === 0) {
      return NextResponse.json(
        { error: "Total price must be greater than 0" },
        { status: 400 }
      );
    }

    // Generate order ID
    const orderId = `PHOTO-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create purchases
    const purchases = await Promise.all(
      mediaItemIds.map((mediaItemId) =>
        prisma.purchase.create({
          data: {
            mediaItemId,
            buyerEmail,
            buyerName,
            amount: mediaItems.find((m) => m.id === mediaItemId)?.price || 0,
            midtransOrderId: orderId,
            status: "pending",
          },
        })
      )
    );

    // Initialize Midtrans Snap
    const midtrans = require("midtrans-client");
    const snap = new midtrans.Snap({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const transactionParams = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPrice,
      },
      customer_details: {
        email: buyerEmail,
        first_name: buyerName || "Buyer",
      },
      item_details: mediaItems.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: 1,
        name: item.displayName || item.name,
      })),
    };

    const snapToken = await snap.createTransaction(transactionParams);

    return NextResponse.json({
      snapToken: snapToken.token,
      orderId,
      totalPrice,
      purchaseIds: purchases.map((p) => p.id),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Purchase error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET purchase details
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const purchases = await prisma.purchase.findMany({
      where: { midtransOrderId: orderId },
      include: { mediaItem: true },
    });

    return NextResponse.json({ purchases });
  } catch (err) {
    console.error("Get purchases error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

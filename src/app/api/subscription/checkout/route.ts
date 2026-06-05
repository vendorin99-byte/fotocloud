import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  period: z.enum(["1month", "3months", "12months"]),
});

const PRICING: Record<string, { amount: number; durationDays: number }> = {
  "1month": { amount: 9900, durationDays: 30 },
  "3months": { amount: 27000, durationDays: 90 },
  "12months": { amount: 99000, durationDays: 365 },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { period } = schema.parse(body);

    const pricing = PRICING[period];
    if (!pricing) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    const orderId = `FOTOCLOUD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        orderId,
        amount: pricing.amount,
        planDurationDays: pricing.durationDays,
        status: "pending",
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    });

    const transactionDetails = {
      order_id: orderId,
      gross_amount: pricing.amount,
    };

    const customerDetails = {
      first_name: user?.name || "Customer",
      email: user?.email || "user@example.com",
    };

    const itemDetails = [
      {
        id: period,
        price: pricing.amount,
        quantity: 1,
        name: `FotoCloud Pro - ${period === "1month" ? "1 Bulan" : period === "3months" ? "3 Bulan" : "1 Tahun"}`,
      },
    ];

    const midtransPayload = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails,
    };

    const authString = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString("base64");
    const snapResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!snapResponse.ok) {
      console.error("Midtrans error:", await snapResponse.text());
      return NextResponse.json(
        { error: "Failed to create payment token" },
        { status: 500 }
      );
    }

    const snapData = await snapResponse.json() as any;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { snapToken: snapData.token },
    });

    return NextResponse.json({
      orderId,
      snapToken: snapData.token,
      snapUrl: snapData.redirect_url,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

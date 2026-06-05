import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subs = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (subs.length === 0) {
    return NextResponse.json({ error: "No subscriptions found" });
  }

  const latest = subs[0];

  // Try to check status from Midtrans
  if (!process.env.MIDTRANS_SERVER_KEY) {
    return NextResponse.json({
      error: "MIDTRANS_SERVER_KEY not configured",
      subs: subs.map((s) => ({
        orderId: s.orderId,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  }

  const authString = Buffer.from(
    `${process.env.MIDTRANS_SERVER_KEY}:`
  ).toString("base64");

  const statusResponse = await fetch(
    `https://app.sandbox.midtrans.com/v2/${latest.orderId}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
      },
    }
  );

  const responseText = await statusResponse.text();
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (e) {
    parsedResponse = responseText.substring(0, 300);
  }

  return NextResponse.json({
    subscriptions: subs.map((s) => ({
      orderId: s.orderId,
      status: s.status,
      createdAt: s.createdAt,
    })),
    midtransCheck: {
      statusCode: statusResponse.status,
      ok: statusResponse.ok,
      response: parsedResponse,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        message: message.trim(),
        isFromAdmin: false,
      },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (err) {
    console.error("Chat send error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

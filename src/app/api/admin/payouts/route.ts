import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin-only: Get all payout requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get("status") || "pending";

    const payouts = await prisma.payoutRequest.findMany({
      where: {
        status: status as any,
      },
      include: {
        photographer: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (err) {
    console.error("Admin payouts list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

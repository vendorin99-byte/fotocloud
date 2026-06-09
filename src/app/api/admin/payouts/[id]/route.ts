import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Check admin role

    const body = await req.json();
    const { action, rejectionReason } = approveSchema.parse(body);

    // Get payout request
    const payout = await prisma.payoutRequest.findUnique({
      where: { id: params.id },
      include: { photographer: true },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    if (payout.status !== "pending") {
      return NextResponse.json(
        { error: "Payout sudah diproses" },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Reject payout
      await prisma.payoutRequest.update({
        where: { id: params.id },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || null,
        },
      });

      return NextResponse.json({ success: true, status: "rejected" });
    } else {
      // Approve payout
      // Create transaction
      await prisma.transaction.create({
        data: {
          photographerId: payout.photographerId,
          type: "payout",
          amount: payout.amount,
          description: `Payout ke rekening ${payout.bankAccount}`,
          payoutRequestId: payout.id,
          status: "pending", // Mark as pending until actually transferred
        },
      });

      // Update payout request status
      await prisma.payoutRequest.update({
        where: { id: params.id },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, status: "approved" });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("Admin payout update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

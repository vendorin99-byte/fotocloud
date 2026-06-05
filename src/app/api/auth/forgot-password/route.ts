import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json({
        message: "Jika email terdaftar, link reset password akan dikirim",
        success: true,
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store in database (hash the token)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Add these fields to schema: resetToken, resetTokenExpiry
        // For now, we'll store in a comment: TODO add to schema
      },
    });

    // TODO: Send email with reset link
    // const resetUrl = `https://fotocloud.com/reset-password?token=${resetToken}`;
    // await sendResetPasswordEmail(user.email, resetUrl);

    return NextResponse.json({
      message: "Jika email terdaftar, link reset password akan dikirim",
      success: true,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

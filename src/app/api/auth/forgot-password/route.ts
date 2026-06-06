import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";
import { generateToken, hashToken, getTokenExpiry } from "@/lib/tokens";
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
    const resetToken = generateToken();
    const hashedToken = hashToken(resetToken);
    const resetTokenExpiry = getTokenExpiry(1);

    // Store in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    await sendResetPasswordEmail(user.email, resetUrl);

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

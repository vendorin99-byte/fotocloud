import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const email = req.nextUrl.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  try {
    const hashedToken = hashToken(token);

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: hashedToken,
        },
      },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.redirect(new URL("/login?error=expired_token", req.url));
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete token after use
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: hashedToken,
        },
      },
    });

    return NextResponse.redirect(new URL("/login?verified=true", req.url));
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}

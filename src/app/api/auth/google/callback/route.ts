import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exchangeGoogleCode } from "@/lib/google/oauth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=google_denied", req.url)
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        googleAccessToken: tokens.accessToken,
        googleRefreshToken: tokens.refreshToken,
        googleTokenExpiry: tokens.expiresAt,
        googleEmail: tokens.email,
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?success=google_connected", req.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=google_failed", req.url)
    );
  }
}

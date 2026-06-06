import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { generateToken, hashToken, getTokenExpiry } from "@/lib/tokens";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(data.password, 12);

    // Set trial expiry to 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Generate email verification token (valid 24 hours)
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hashedVerifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        businessName: data.businessName,
        plan: "free",
        trialEndsAt,
      },
      select: { id: true, email: true, name: true },
    });

    // Create verification token
    const verifyToken = generateToken();
    const hashedVerifyToken = hashToken(verifyToken);
    const verifyTokenExpiry = getTokenExpiry(24);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token: hashedVerifyToken,
        expires: verifyTokenExpiry,
      },
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verifyToken}&email=${encodeURIComponent(user.email!)}`;
    await sendVerificationEmail(user.email!, verifyUrl);

    return NextResponse.json(
      {
        ...user,
        message: "Akun berhasil dibuat. Check email untuk verifikasi."
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

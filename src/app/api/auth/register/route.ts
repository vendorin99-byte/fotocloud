import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

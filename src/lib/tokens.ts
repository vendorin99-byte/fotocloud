import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getTokenExpiry(expiryHours: number = 24): Date {
  return new Date(Date.now() + expiryHours * 60 * 60 * 1000);
}

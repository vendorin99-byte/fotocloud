// Email service — siap untuk Resend (https://resend.com)
// Tambahkan RESEND_API_KEY ke env vars untuk mengaktifkan email

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    // Silently skip if no API key — log in dev
    if (process.env.NODE_ENV === "development") {
      console.log("[Email skipped - no RESEND_API_KEY]", payload.subject, "→", payload.to);
    }
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "FotoCloud <onboarding@resend.dev>",
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  return res.ok;
}

export async function sendGalleryReadyEmail({
  clientEmail,
  clientName,
  projectName,
  galleryUrl,
}: {
  clientEmail: string;
  clientName: string;
  projectName: string;
  galleryUrl: string;
}) {
  return sendEmail({
    to: clientEmail,
    subject: `Galeri foto Anda sudah siap — ${projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Halo ${clientName}! 👋</h2>
        <p>Galeri foto <strong>${projectName}</strong> sudah siap untuk Anda review.</p>
        <p>
          <a href="${galleryUrl}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            Lihat Galeri
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px">Link: ${galleryUrl}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px">FotoCloud — Platform galeri fotografer profesional</p>
      </div>
    `,
  });
}

export async function sendReviewNotificationEmail({
  photographerEmail,
  clientName,
  projectName,
  approvedCount,
  revisionCount,
  galleryUrl,
}: {
  photographerEmail: string;
  clientName: string;
  projectName: string;
  approvedCount: number;
  revisionCount: number;
  galleryUrl: string;
}) {
  return sendEmail({
    to: photographerEmail,
    subject: `${clientName} sudah review galeri — ${projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Review baru dari ${clientName}</h2>
        <p>Project: <strong>${projectName}</strong></p>
        <ul>
          <li>✅ Disetujui: <strong>${approvedCount}</strong> foto</li>
          <li>✎ Revisi: <strong>${revisionCount}</strong> foto</li>
        </ul>
        <p>
          <a href="${galleryUrl}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">
            Lihat Detail
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px">FotoCloud</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  return sendEmail({
    to: email,
    subject: "Verifikasi Email FotoCloud",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">FotoCloud</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Verifikasi Email Anda</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Halo,<br/><br/>
            Terima kasih telah mendaftar di FotoCloud! Untuk menyelesaikan pendaftaran, silakan verifikasi email Anda dengan mengklik tombol di bawah.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verifikasi Email
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Atau copy dan paste link di bawah ke browser Anda:<br/>
            <code style="background: #fff; padding: 10px; display: block; word-break: break-all; border-left: 3px solid #667eea; margin-top: 10px;">${verifyUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Link berlaku selama 24 jam. Jika Anda tidak membuat akun ini, abaikan email ini.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Reset Password FotoCloud",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">FotoCloud</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Password Anda</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Halo,<br/><br/>
            Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Atau copy dan paste link di bawah ke browser Anda:<br/>
            <code style="background: #fff; padding: 10px; display: block; word-break: break-all; border-left: 3px solid #667eea; margin-top: 10px;">${resetUrl}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Link berlaku selama 1 jam. Jika Anda tidak meminta reset password ini, abaikan email ini dan password Anda akan tetap aman.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentReceiptEmail(
  email: string,
  name: string,
  transactionId: string,
  amount: number,
  periodLabel: string
) {

  return sendEmail({
    to: email,
    subject: "Pembayaran Berhasil - FotoCloud Pro",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Pembayaran Berhasil! ✓</h2>
        <p>Halo ${name},</p>
        <p>Terima kasih! Upgrade Pro Anda sudah aktif.</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;font-size:13px">
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Paket:</strong> FotoCloud Pro - ${periodLabel}</p>
          <p><strong>Harga:</strong> Rp ${amount.toLocaleString("id-ID")}</p>
        </div>
        <p>Fitur Pro Anda:</p>
        <ul style="font-size:13px">
          <li>✓ Unlimited projects</li>
          <li>✓ No watermark</li>
          <li>✓ Per-photo analytics</li>
          <li>✓ Bulk download</li>
        </ul>
        <p>
          <a href="https://fotocloud-iota.vercel.app/dashboard" style="color:#111827;text-decoration:none;font-weight:bold">
            Mulai sekarang →
          </a>
        </p>
      </div>
    `,
  });
}

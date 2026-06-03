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
      from: process.env.EMAIL_FROM ?? "FotoCloud <noreply@fotocloud.app>",
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

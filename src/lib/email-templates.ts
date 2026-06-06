export function verificationEmailTemplate(verifyLink: string, userName: string) {
  return {
    subject: "Verify Your FotoCloud Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">FotoCloud</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${userName},<br/><br/>
            Thank you for signing up for FotoCloud! To get started, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Or copy and paste this link in your browser:<br/>
            <code style="background: #fff; padding: 10px; display: block; word-break: break-all; border-left: 3px solid #667eea;">${verifyLink}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This link expires in 24 hours.
          </p>
        </div>
      </div>
    `,
  };
}

export function resetPasswordEmailTemplate(resetLink: string, userName: string) {
  return {
    subject: "Reset Your FotoCloud Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">FotoCloud</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${userName},<br/><br/>
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Or copy and paste this link in your browser:<br/>
            <code style="background: #fff; padding: 10px; display: block; word-break: break-all; border-left: 3px solid #667eea;">${resetLink}</code>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };
}

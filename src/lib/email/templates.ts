function baseTemplate(title: string, bodyHtml: string) {
  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background: #faf6ee; padding: 32px 16px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fffdf8; border: 1px solid #e4dcc8; border-radius: 12px; overflow: hidden;">
      <div style="background: #1e2a4a; padding: 24px; text-align: center;">
        <span style="color: #faf6ee; font-size: 20px; letter-spacing: 0.05em;">Petal &amp; Papers</span>
      </div>
      <div style="padding: 32px 28px; color: #241f1a;">
        <h1 style="font-size: 20px; margin: 0 0 16px; color: #1e2a4a;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding: 20px 28px; border-top: 1px solid #e4dcc8; text-align: center;">
        <p style="font-size: 12px; color: #7a756c; margin: 0;">Handcrafted gifts, made from the heart.</p>
      </div>
    </div>
  </div>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display: inline-block; margin-top: 8px; background: #a67c3d; color: #faf6ee; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-family: sans-serif; font-size: 14px;">${label}</a>`;
}

export function registrationEmail({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return baseTemplate(
    `Welcome, ${name}!`,
    `<p style="line-height: 1.6;">Thanks for joining Petal &amp; Papers. Please verify your email to activate your account.</p>
     ${button(verifyUrl, "Verify My Email")}
     <p style="font-size: 12px; color: #7a756c; margin-top: 20px;">This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>`,
  );
}

export function emailVerifiedEmail({ name }: { name: string }) {
  return baseTemplate(
    `You're all set, ${name}!`,
    `<p style="line-height: 1.6;">Your email is verified and your account is ready. Start browsing handcrafted, personalized gifts.</p>`,
  );
}

export function passwordResetEmail({ name, otp }: { name: string; otp: string }) {
  return baseTemplate(
    `Reset your password`,
    `<p style="line-height: 1.6;">Hi ${name}, use the code below to reset your password. It expires in 10 minutes.</p>
     <p style="font-family: monospace; font-size: 28px; letter-spacing: 0.3em; text-align: center; background: #f2ead9; padding: 16px; border-radius: 8px; margin: 20px 0;">${otp}</p>
     <p style="font-size: 12px; color: #7a756c;">If you didn't request this, you can safely ignore this email.</p>`,
  );
}

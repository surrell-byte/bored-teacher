import nodemailer from 'nodemailer';

function getTransporter() {
  const sender = process.env.GMAIL_USER || 'boredteacherapp@gmail.com';
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!password) {
    throw new Error('Missing GMAIL_APP_PASSWORD. Set it in your environment to send verification emails.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender,
      pass: password,
    },
  });
}

export async function sendVerificationEmail(to: string, code: string, displayName = 'Player') {
  const sender = process.env.GMAIL_USER || 'boredteacherapp@gmail.com';
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2 style="margin-bottom: 12px;">Verify your email address</h2>
        <p>Hi ${displayName},</p>
        <p>Your new Bored Teacher App account is almost ready. Please use the code below to verify your email and continue.</p>
        <div style="margin: 24px 0; padding: 18px 20px; border-radius: 12px; background: #f3f7ff; border: 1px solid #dbe7ff; text-align: center;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #52607a; margin-bottom: 10px;">Your verification code</div>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.28em; color: #111827;">${code}</div>
        </div>
        <p>This code is valid for 48 hours. If you do not verify within that time, your account will stay locked until you do.</p>
        <p>Check your spam or junk mail folder if you do not see this email in your inbox.</p>
        <p>Warmly,<br />Bored Teacher App</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, displayName = 'Player') {
  const sender = process.env.GMAIL_USER || 'boredteacherapp@gmail.com';
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Welcome to Bored Teacher App!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2 style="margin-bottom: 12px;">Welcome aboard, ${displayName}!</h2>
        <p>Your account is live. Please verify your email to unlock the full app experience.</p>
        <p>As a welcome gift, you can claim one of our special starter avatars from the shop collection. You can pick one now and save the others for later.</p>
        <p>Thanks for joining the community,<br />Bored Teacher App</p>
      </div>
    `,
  });
}

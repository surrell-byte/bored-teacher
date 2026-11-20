import nodemailer from 'nodemailer';

const COMMUNICATION_EMAIL = 'boredteacherapp@gmail.com';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function getTransporter() {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (sender.toLowerCase() !== COMMUNICATION_EMAIL) {
    throw new Error(`GMAIL_USER must be ${COMMUNICATION_EMAIL}.`);
  }
  if (!password) {
    throw new Error('Missing GMAIL_APP_PASSWORD. Set it in your environment to send account and support emails.');
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
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeDisplayName = escapeHtml(displayName);
  const safeCode = escapeHtml(code);

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2 style="margin-bottom: 12px;">Verify your email address</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>Your new Bored Teacher App account is almost ready. Please use the code below to verify your email and continue.</p>
        <div style="margin: 24px 0; padding: 18px 20px; border-radius: 12px; background: #f3f7ff; border: 1px solid #dbe7ff; text-align: center;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #52607a; margin-bottom: 10px;">Your verification code</div>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.28em; color: #111827;">${safeCode}</div>
        </div>
        <p>This code is valid for 48 hours. If you do not verify within that time, your account will stay locked until you do.</p>
        <p>Check your spam or junk mail folder if you do not see this email in your inbox.</p>
        <p>Warmly,<br />Bored Teacher App</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, displayName = 'Player') {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeDisplayName = escapeHtml(displayName);

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Welcome to Bored Teacher App!',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2 style="margin-bottom: 12px;">Welcome aboard, ${safeDisplayName}!</h2>
        <p>Your account is live. Please verify your email to unlock the full app experience.</p>
        <p>As a welcome gift, you can claim one of our special starter avatars from the shop collection. You can pick one now and save the others for later.</p>
        <p>Thanks for joining the community,<br />Bored Teacher App</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, displayName = 'Player') {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeDisplayName = escapeHtml(displayName);
  const safeResetUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Reset your Bored Teacher App password',
    text: `Hi ${displayName},\n\nUse this secure link to reset your password:\n${resetUrl}\n\nIf you did not request a reset, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2>Reset your password</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>Use the secure link below to reset your Bored Teacher App password.</p>
        <p><a href="${safeResetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#176b61;color:#fff;text-decoration:none;font-weight:700;">Reset password</a></p>
        <p>If you did not request a reset, you can ignore this email.</p>
      </div>
    `,
  });
}

export interface SupportEmailDetails {
  message: string;
  type: 'suggestion' | 'grievance';
  page: string;
  name: string;
  email: string;
}

export async function sendSupportQuestionEmail(details: SupportEmailDetails) {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeName = escapeHtml(details.name);
  const safeEmail = escapeHtml(details.email);
  const safePage = escapeHtml(details.page);
  const safeMessage = escapeHtml(details.message).replace(/\r?\n/g, '<br>');
  const typeLabel = details.type === 'grievance' ? 'Problem or bug report' : 'Suggestion';

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to: COMMUNICATION_EMAIL,
    replyTo: details.email,
    subject: `Bored Teacher support: ${typeLabel}`,
    text: `${typeLabel}\nFrom: ${details.name} <${details.email}>\nPage: ${details.page}\n\n${details.message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #172033;">
        <h2>${typeLabel}</h2>
        <p><strong>From:</strong> ${safeName} &lt;${safeEmail}&gt;<br><strong>Page:</strong> ${safePage}</p>
        <div style="white-space:normal;padding:16px;border:1px solid #dbe7ff;border-radius:12px;background:#f6f8fc;">${safeMessage}</div>
      </div>
    `,
  });
}

export async function sendSupportReceiptEmail(to: string, details: Pick<SupportEmailDetails, 'message' | 'type' | 'name'>) {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeName = escapeHtml(details.name);
  const safeMessage = escapeHtml(details.message).replace(/\r?\n/g, '<br>');
  const typeLabel = details.type === 'grievance' ? 'problem or bug report' : 'suggestion';

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'We received your message',
    text: `Hi ${details.name},\n\nWe received your ${typeLabel} and will review it. Here is a copy of your message:\n\n${details.message}\n\nBored Teacher App Support`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2>We received your message</h2>
        <p>Hi ${safeName},</p>
        <p>Thanks for sending your ${typeLabel}. We will review it. Here is a copy for your records:</p>
        <div style="white-space:normal;padding:16px;border:1px solid #dbe7ff;border-radius:12px;background:#f6f8fc;">${safeMessage}</div>
        <p>Bored Teacher App Support</p>
      </div>
    `,
  });
}

export async function sendAccountDeletedEmail(to: string, displayName = 'Player') {
  const sender = process.env.GMAIL_USER?.trim() || COMMUNICATION_EMAIL;
  const transporter = getTransporter();
  const safeDisplayName = escapeHtml(displayName);

  await transporter.sendMail({
    from: `Bored Teacher App <${sender}>`,
    to,
    subject: 'Your Bored Teacher App account was deleted',
    text: `Hi ${displayName},\n\nThis confirms that your Bored Teacher App account was deleted. Associated profile, progress, feedback, and review data were removed. If you did not request this, contact ${COMMUNICATION_EMAIL}.\n\nBored Teacher App`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 560px; margin: 0 auto; color: #172033;">
        <h2>Account deleted</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>This confirms that your Bored Teacher App account was deleted. Associated profile, progress, feedback, and review data were removed.</p>
        <p>If you did not request this, contact <a href="mailto:${COMMUNICATION_EMAIL}">${COMMUNICATION_EMAIL}</a>.</p>
      </div>
    `,
  });
}

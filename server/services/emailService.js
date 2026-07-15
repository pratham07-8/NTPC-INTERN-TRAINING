import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // If not configured, return null to trigger fallback console logging
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: port == 465, // true for port 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a verification OTP email to the user
 * @param {string} toEmail - Recipient email
 * @param {string} otp - The 6-digit OTP code
 * @param {string} name - User's name
 */
export const sendOTPEmail = async (toEmail, otp, name) => {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ntpc.co.in';

  const mailOptions = {
    from: `"NTPC Intern Portal" <${fromEmail}>`,
    to: toEmail,
    subject: 'Email Verification OTP - NTPC Intern Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #ea580c; text-align: center;">NTPC Intern Portal</h2>
        <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for registering on the NTPC Intern Portal. To complete your signup process, please verify your email address using the following One-Time Password (OTP):</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated email. Please do not reply.</p>
      </div>
    `,
  };

  if (!transporter) {
    console.log('\n==================================================');
    console.log(`[SMTP FALLBACK] SMTP is not configured in .env.`);
    console.log(`Sending email to: ${toEmail}`);
    console.log(`Verification OTP: ${otp}`);
    console.log('==================================================\n');
    return { success: true, fallback: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP] Failed to send email:', error);
    // Return success: false but log the OTP to the console anyway so development doesn't break
    console.log('\n==================================================');
    console.log(`[SMTP ERROR FALLBACK] Failed to send email due to: ${error.message}`);
    console.log(`Backup OTP for ${toEmail} is: ${otp}`);
    console.log('==================================================\n');
    return { success: false, error: error.message };
  }
};

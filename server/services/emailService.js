import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Helper to send email via Resend API (HTTP API - 100% reliable on cloud platforms)
const sendViaResend = async ({ to, subject, html, attachments = [] }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const toList = Array.isArray(to) ? to : [to];
    const payload = {
      from: process.env.RESEND_FROM || 'NTPC Portal <onboarding@resend.dev>',
      to: toList,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (response.ok && data.id) {
      console.log(`[RESEND API] Email successfully delivered to ${toList.join(', ')}. ID: ${data.id}`);
      return { success: true, messageId: data.id };
    } else {
      console.error('[RESEND API ERROR]', data);
      return null;
    }
  } catch (err) {
    console.error('[RESEND API EXCEPTION]', err);
    return null;
  }
};

// Helper to send email via Mailtrap Sandbox API
const sendViaMailtrap = async ({ to, subject, html, attachments = [] }) => {
  const token = process.env.MAILTRAP_TOKEN;
  const inboxId = process.env.MAILTRAP_INBOX_ID;
  if (!token || !inboxId) return null;

  try {
    const toList = Array.isArray(to) ? to : to.split(',').map(e => e.trim());
    const formattedTo = toList.filter(Boolean).map(email => ({ email }));
    
    const formattedAttachments = attachments.map(att => ({
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      filename: att.filename,
      type: att.type || 'application/pdf',
      disposition: 'attachment'
    }));

    const response = await fetch(`https://sandbox.api.mailtrap.io/api/send/${inboxId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { email: 'no-reply@ntpc.co.in', name: 'NTPC Intern Portal' },
        to: formattedTo,
        subject,
        html,
        attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log(`[MAILTRAP] Email successfully delivered to Mailtrap Sandbox (Inbox #${inboxId}). Message IDs:`, data.message_ids);
      return { success: true, messageId: data.message_ids?.[0] };
    } else {
      console.error('[MAILTRAP API ERROR]', data);
      return null;
    }
  } catch (err) {
    console.error('[MAILTRAP API EXCEPTION]', err);
    return null;
  }
};

// Create standard Nodemailer transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : '';
  const port = process.env.SMTP_PORT || 465;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  // Remove any spaces from Google App Password if pasted with spaces (e.g. "abcd efgh ijkl mnop")
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass || user.includes('your-email')) {
    console.log('[SMTP CONFIG WARNING] Missing or default SMTP_USER / SMTP_PASS in environment variables.');
    return null;
  }

  // Use explicit SSL Port 465 for Gmail for cloud server compatibility (Render/AWS)
  if (!host || host.includes('gmail')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: parseInt(port) === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

/**
 * Sends a verification OTP email to the user
 */
export const sendOTPEmail = async (toEmail, otp, name) => {
  const subject = 'Email Verification OTP - NTPC Intern Portal';
  const html = `
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
  `;

  // 1. Try Nodemailer Gmail SMTP first (if SMTP credentials are provided and valid)
  const transporter = createTransporter();
  if (transporter) {
    const fromEmail = process.env.SMTP_USER || process.env.SMTP_FROM || 'no-reply@ntpc.co.in';
    try {
      const info = await transporter.sendMail({
        from: `"NTPC Intern Portal" <${fromEmail}>`,
        to: toEmail,
        subject,
        html,
      });
      console.log(`[SMTP] Email successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[SMTP] Failed to send email via Gmail SMTP:', error);
    }
  }

  // 2. Try Resend API next (if RESEND_API_KEY is present)
  const resendResult = await sendViaResend({ to: toEmail, subject, html });
  if (resendResult && resendResult.success) {
    return resendResult;
  }

  // 3. Try Mailtrap Sandbox API next (if MAILTRAP_TOKEN is present and SMTP failed/missing)
  const mailtrapResult = await sendViaMailtrap({ to: toEmail, subject, html });
  if (mailtrapResult && mailtrapResult.success) {
    return mailtrapResult;
  }

  // 4. Console Fallback if all send methods are missing/failed
  console.log('\n==================================================');
  console.log(`[CONSOLE FALLBACK] Verification OTP for ${toEmail}: ${otp}`);
  console.log('==================================================\n');
  return { success: true, fallback: true };
};

/**
 * Helper to format date as DD.MM.YYYY
 */
const formatDateDot = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Sends the approved training letter PDF to proposer and guide
 */
export const sendTrainingLetterEmail = async (toEmails, trainee, guide, pdfBuffer, proposer = null, hrUser = null, hrSignature = null) => {
  const traineeName = trainee.full_name || 'Trainee';
  const subject = `Approved NTPC Training Letter - ${traineeName}`;

  const currentDateFormatted = formatDateDot(new Date());
  const fromDateFormatted = formatDateDot(trainee.from_date);
  const toDateFormatted = formatDateDot(trainee.to_date);

  const rawInstitute = trainee.institute || '';
  let addressLines = [];
  if (rawInstitute.includes('\n')) {
    addressLines = rawInstitute.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  } else {
    addressLines = rawInstitute.split(',').map(l => l.trim()).filter(Boolean);
  }

  addressLines = addressLines.map((line, idx) => {
    const cleanLine = line.replace(/,\s*$/, '');
    return (idx < addressLines.length - 1) ? `${cleanLine},` : cleanLine;
  });

  if (addressLines.length > 0 && !addressLines[addressLines.length - 1].toLowerCase().includes('india')) {
    addressLines[addressLines.length - 1] += ', India';
  }

  const instituteLinesHtml = addressLines.map(line => `<p style="margin: 0; color: #1e293b;">${line}</p>`).join('');

  const guideSalut = guide.salutation || 'Mr./Ms.';
  const guideName = guide.full_name || 'Guide';
  const guideDesig = guide.designation || 'DGM';
  const guideDept = guide.department || 'IT';

  const proposerText = proposer ? `${proposer.name}, ${proposer.department || 'IT'}.` : 'As requested.';
  const rawHrName = hrUser?.name;
  const hrName = (rawHrName && !rawHrName.toLowerCase().includes('nidhi') && rawHrName.toUpperCase() !== 'HR')
    ? rawHrName
    : 'HR SIGNATURE';
  const hrDesignation = hrUser?.designation || 'Senior Manager-HR';

  let hrSignatureHtml = '';
  const sigSource = hrSignature || hrUser?.signature_url;
  if (sigSource && sigSource.startsWith('data:image')) {
    hrSignatureHtml = `<div style="margin: 5px 0;"><img src="${sigSource}" alt="HR Signature" style="height: 45px; max-width: 140px; object-contain: contain;" /></div>`;
  } else {
    hrSignatureHtml = `<div style="margin: 5px 0; font-family: 'Courier New', monospace; color: #2563eb; font-size: 13px; font-weight: bold; font-style: italic;">~ HR SIGNATURE ~</div>`;
  }

  // Load NTPC logo as Base64 for HTML email header
  let logoBase64Html = '';
  const possibleLogoPaths = [
    path.join(__dirname, '../assets/ntpc-logo.png'),
    path.join(__dirname, '../../client/src/assets/ntpc-logo.png'),
    path.join(__dirname, '../../client/public/ntpc-logo.png'),
    path.resolve('server/assets/ntpc-logo.png'),
    path.resolve('assets/ntpc-logo.png')
  ];
  for (const p of possibleLogoPaths) {
    if (fs.existsSync(p)) {
      try {
        const buf = fs.readFileSync(p);
        logoBase64Html = `data:image/png;base64,${buf.toString('base64')}`;
        break;
      } catch (e) { }
    }
  }

  const html = `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 680px; margin: 0 auto; background-color: #ffffff; padding: 40px 50px; border: 1px solid #cbd5e1; border-radius: 8px; color: #1e293b; line-height: 1.6;">
      
      <!-- Header Logo & Maharatan Tag -->
      <div style="margin-bottom: 25px;">
        ${logoBase64Html ? `<img src="${logoBase64Html}" alt="NTPC Logo" style="height: 52px; width: auto; display: block; margin-bottom: 4px;" />` : `<div style="font-size: 26px; font-weight: bold; color: #002060; font-family: Arial, sans-serif; letter-spacing: 1px;">NTPC</div>`}
        <div style="font-size: 10.5px; color: #64748b; font-family: Arial, sans-serif; margin-top: 2px;">A Maharatan Company</div>
      </div>

      <!-- Ref No & Date Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; font-weight: bold; color: #1e293b;">
        <tr>
          <td style="text-align: left;">Ref.No.01: HRS: HRB: TRG:${trainee.id || 26}</td>
          <td style="text-align: right;">Date: ${currentDateFormatted}</td>
        </tr>
      </table>

      <!-- Recipient Address Block -->
      <div style="margin-bottom: 22px; font-size: 14px;">
        <p style="margin: 0 0 6px 0;">To,</p>
        <p style="margin: 0 0 2px 0; font-weight: bold; color: #1e293b;">${trainee.salutation || 'Mr.'} ${traineeName}</p>
        ${instituteLinesHtml}
        ${!addressLines.some(l => l.toLowerCase().includes('india')) ? '<p style="margin: 0; color: #1e293b;">India</p>' : ''}
      </div>

      <p style="margin-bottom: 20px; font-size: 14px;">Dear Sir/Madam,</p>

      <!-- Paragraph 1 -->
      <p style="margin-bottom: 18px; text-align: justify; font-size: 14px;">
        Kindly refer to your letter request regarding vocational training/ Internship in NTPC, CC Noida.
      </p>

      <!-- Paragraph 2 -->
      <p style="margin-bottom: 18px; text-align: justify; font-size: 14px;">
        We are pleased to inform you that you can be accommodated in NTPC for doing training w.e.f. <strong>${fromDateFormatted}</strong> to <strong>${toDateFormatted}</strong>. You are advised to report to <strong>${guideSalut} ${guideName}, ${guideDesig}, ${guideDept}</strong>, NTPC Ltd, Corporate Centre, Noida, Uttar Pradesh for further guidance. You are requested to be physically present in office on all working days during the training period.
      </p>

      <!-- Paragraph 3 -->
      <p style="margin-bottom: 25px; text-align: justify; font-size: 14px;">
        We may, however, inform that as per rules, NTPC will not bear any liability financial or otherwise. During the training, you will have to make your own arrangements for boarding, lodging and traveling etc. It is expected from you to strictly follow company rules & regulations and display good conduct, failing which permission can be withdrawn any time without assigning any reasons.
      </p>

      <p style="margin-bottom: 15px; font-size: 14px;">Thanking you.</p>

      <!-- Signatory Block -->
      <div style="margin-bottom: 30px; font-size: 14px;">
        <p style="margin: 0 0 8px 0;">Yours faithfully</p>
        ${hrSignatureHtml}
        <p style="margin: 4px 0 0 0; font-weight: bold; color: #1e293b;">${hrName}</p>
        <p style="margin: 0; color: #475569; font-size: 13px;">${hrDesignation}</p>
      </div>

      <!-- Copy To Section -->
      <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 18px; font-size: 13px;">
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Copy to:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="width: 140px; font-weight: bold; padding: 4px 0; vertical-align: top; color: #334155;">Proposer</td>
            <td style="padding: 4px 0; vertical-align: top; color: #1e293b;">: ${proposerText}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0; vertical-align: top; color: #334155;">Guide / Facilitator</td>
            <td style="padding: 4px 0; vertical-align: top; color: #1e293b;">: As mentioned above</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 4px 0; vertical-align: top; color: #334155;">Security Office</td>
            <td style="padding: 4px 0; vertical-align: top; color: #1e293b;">: Temporary I-Card may please be issued to the candidate for the period mentioned above.</td>
          </tr>
        </table>
      </div>

      <!-- Official Footer -->
      <div style="margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 14px; text-align: center; font-size: 10.5px; color: #64748b; font-family: Arial, sans-serif;">
        <p style="margin: 0 0 4px 0;">ENGINEERING OFFICE COMPLEX, Plot No. A-8A, Sector-24, Post Box No. 13, Noida 201301 (U.P.)</p>
        <p style="margin: 0;">Tel: 0120-4948000, 0120-2410333, 0120-2410801 Fax: 0120-2410136, 0120-2410137</p>
      </div>

    </div>
  `;

  const attachmentFilename = `NTPC_Training_Letter_${traineeName.replace(/\s+/g, '_')}.pdf`;
  const attachments = [
    {
      filename: attachmentFilename,
      content: pdfBuffer,
      type: 'application/pdf'
    }
  ];

  // 1. Try Nodemailer Transporter first (if SMTP credentials are provided and valid)
  const transporter = createTransporter();
  if (transporter) {
    const fromEmail = process.env.SMTP_USER || process.env.SMTP_FROM || 'no-reply@ntpc.co.in';
    try {
      const info = await transporter.sendMail({
        from: `"NTPC Intern Portal" <${fromEmail}>`,
        to: Array.isArray(toEmails) ? toEmails.join(',') : toEmails,
        subject,
        html,
        attachments: [
          {
            filename: attachmentFilename,
            content: pdfBuffer
          }
        ]
      });
      console.log(`[SMTP] Training letter successfully sent to ${toEmails.join(', ')}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[SMTP] Failed to send training letter email via SMTP:', error);
    }
  }

  // 2. Try Resend API next if credentials are in .env
  const resendResult = await sendViaResend({ to: toEmails, subject, html, attachments });
  if (resendResult && resendResult.success) {
    return resendResult;
  }

  // 3. Try Mailtrap API next if credentials are in .env
  const mailtrapResult = await sendViaMailtrap({ to: toEmails, subject, html, attachments });
  if (mailtrapResult && mailtrapResult.success) {
    return mailtrapResult;
  }

  // 4. Console Fallback if all send methods missing/failed
  console.log('\n==================================================');
  console.log(`[CONSOLE FALLBACK] Training letter generated for: ${Array.isArray(toEmails) ? toEmails.join(', ') : toEmails}`);
  console.log(`Attachment: ${attachmentFilename}`);
  console.log('==================================================\n');
  return { success: true, fallback: true };
};



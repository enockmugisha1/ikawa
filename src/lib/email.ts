import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: { filename: string; content: Buffer; cid?: string }[];
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        console.warn('[Email] SMTP not configured – skipping email');
        return false;
    }

    try {
        await transporter.sendMail({
            from: `"CWMS" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
            attachments,
        });
        console.log(`[Email] Sent to ${to}: ${subject}`);
        return true;
    } catch (error) {
        console.error('[Email] Failed:', error);
        return false;
    }
}

export async function sendOtpEmail(to: string, otp: string, name: string) {
    return sendEmail({
        to,
        subject: 'CWMS – Password Reset Code',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <div style="background:#065f46;color:white;padding:16px;border-radius:8px;text-align:center;margin-bottom:20px;">
                    <h2 style="margin:0;">CWMS</h2>
                    <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Coffee Worker Management System</p>
                </div>
                <p>Hello <strong>${name}</strong>,</p>
                <p>You requested a password reset. Use the code below:</p>
                <div style="text-align:center;margin:24px 0;">
                    <div style="display:inline-block;background:#f0fdf4;border:2px solid #065f46;border-radius:8px;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#065f46;">
                        ${otp}
                    </div>
                </div>
                <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
            </div>
        `,
    });
}

export async function sendQrBadgeEmail(
    to: string,
    workerName: string,
    workerId: string,
    qrDataUrl: string
) {
    // Convert data URL to Buffer for attachment
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(base64Data, 'base64');

    return sendEmail({
        to,
        subject: `CWMS – Your Worker QR Badge`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <div style="background:#065f46;color:white;padding:16px;border-radius:8px;text-align:center;margin-bottom:20px;">
                    <h2 style="margin:0;">CWMS</h2>
                    <p style="margin:4px 0 0;font-size:12px;opacity:0.85;">Coffee Worker Management System</p>
                </div>
                <p>Hello <strong>${workerName}</strong>,</p>
                <p>You have been registered in the Coffee Worker Management System. Below is your QR badge for check-in:</p>
                <div style="text-align:center;margin:20px 0;">
                    <img src="cid:qrbadge" alt="QR Code" style="width:200px;height:200px;border:1px solid #d1fae5;border-radius:8px;" />
                </div>
                <p style="text-align:center;font-weight:bold;font-size:16px;color:#111827;">${workerName}</p>
                <p style="text-align:center;font-family:monospace;color:#6b7280;background:#f0fdf4;padding:6px 12px;border-radius:6px;display:inline-block;margin:0 auto;">ID: ${workerId}</p>
                <p style="color:#6b7280;font-size:13px;margin-top:16px;border-top:1px solid #e5e7eb;padding-top:12px;">
                    Show this QR code to your supervisor during check-in. You can also download and print it.
                </p>
            </div>
        `,
        attachments: [
            { filename: 'qr-badge.png', content: qrBuffer, cid: 'qrbadge' },
        ],
    });
}

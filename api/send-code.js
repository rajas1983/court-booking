import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405.json({ error: 'Method not allowed' }));
  }

  const { email, code, firstName } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  try {
    const data = await resend.emails.send({
      from: 'AceCourt Arena <onboarding@resend.dev>', // Use your verified domain in production
      to: [email],
      subject: 'Your AceCourt Verification Code',
      html: `
        <div style="font-family: sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px;">
          <h2 style="color: #38bdf8; margin-top: 0;">Welcome to AceCourt Arena, ${firstName || 'Guest'}!</h2>
          <p style="color: #94a3b8; font-size: 14px;">Please use the following 6-digit verification code to complete your registration:</p>
          <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 16px; border-radius: 12px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #34d399; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
}

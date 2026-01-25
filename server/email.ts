import { Resend } from 'resend';

let resend: Resend | null = null;

// Initialize Resend client
function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface InquiryEmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiryType: string;
  propertyId?: number;
}

/**
 * Send email notification when a new inquiry is submitted
 */
export async function sendInquiryNotification(data: InquiryEmailData): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.warn('[Email] Resend API key not configured, skipping email notification');
    return false;
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #D4AF37; color: #1A1A1A; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #1A1A1A; }
            .value { color: #555; margin-top: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Inquiry from Nivaara Website</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value">${data.email}</div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${data.phone}</div>
              </div>
              <div class="field">
                <div class="label">Inquiry Type:</div>
                <div class="value">${data.inquiryType}</div>
              </div>
              ${data.propertyId ? `
              <div class="field">
                <div class="label">Property ID:</div>
                <div class="value">${data.propertyId}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${data.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This inquiry was submitted through the Nivaara Real Estate website.</p>
              <p>© ${new Date().getFullYear()} Nivaara Real Estate. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Inquiries <noreply@nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: `New Inquiry from ${data.name} - ${data.inquiryType}`,
      html: emailHtml,
      replyTo: data.email,
    });

    console.log('[Email] Inquiry notification sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send inquiry notification:', error);
    return false;
  }
}

/**
 * Send confirmation email to the user who submitted the inquiry
 */
export async function sendInquiryConfirmation(data: InquiryEmailData): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.warn('[Email] Resend API key not configured, skipping confirmation email');
    return false;
  }

  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #D4AF37; color: #1A1A1A; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
            .contact-info { margin-top: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #D4AF37; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Nivaara</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Thank you for your inquiry. We have received your message and our team will get back to you within 24 hours.</p>
              <p><strong>Your inquiry details:</strong></p>
              <p>${data.message}</p>
              <div class="contact-info">
                <p><strong>Contact Us:</strong></p>
                <p>📧 Email: info@nivaararealty.com</p>
                <p>📞 Phone: +91 9764515697</p>
                <p>📍 Office: Office No. 203, Sr No.69/4, Plot.B Zen Square, Kharadi, Pune (MH)</p>
              </div>
              <p>We Build Trust. Your trusted real estate partner across India and international markets.</p>
            </div>
            <div class="footer">
              <p>RERA Registered | Transparency. Trust. Excellence.</p>
              <p>© ${new Date().getFullYear()} Nivaara Real Estate. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Real Estate <noreply@nivaararealty.com>',
      to: data.email,
      subject: 'Thank You for Your Inquiry - Nivaara Real Estate',
      html: emailHtml,
      replyTo: 'info@nivaararealty.com',
    });

    console.log('[Email] Confirmation email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send confirmation email:', error);
    return false;
  }
}

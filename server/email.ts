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

/**
 * Send email notification to info@nivaararealty.com when a public property is submitted
 */
export async function sendNewPropertySubmissionNotification(data: {
  title: string;
  location: string;
  price: string | number | null;
  priceLabel: string | null;
  propertyType: string;
  bedrooms: number | null;
  submitterName: string;
  submitterPhone: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Email] Resend not configured, skipping new property submission notification');
    return false;
  }

  const priceDisplay = data.priceLabel || (data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : 'Not specified');

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #D4AF37; color: #1A1A1A; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #1A1A1A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { color: #444; margin-top: 3px; font-size: 15px; }
            .action-box { background: #fff; border-left: 4px solid #D4AF37; padding: 15px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;font-size:22px;">New Listing Pending Review</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A property has been submitted via the public listing form</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Property Title</div>
                <div class="value">${data.title}</div>
              </div>
              <div class="field">
                <div class="label">Location</div>
                <div class="value">${data.location}</div>
              </div>
              <div class="field">
                <div class="label">Type &amp; Bedrooms</div>
                <div class="value">${data.bedrooms ? `${data.bedrooms} BHK ` : ''}${data.propertyType}</div>
              </div>
              <div class="field">
                <div class="label">Price</div>
                <div class="value">${priceDisplay}</div>
              </div>
              <div class="field">
                <div class="label">Submitted By</div>
                <div class="value">${data.submitterName}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="value">${data.submitterPhone}</div>
              </div>
              <div class="action-box">
                <p style="margin:0;font-weight:bold;">Action Required</p>
                <p style="margin:6px 0 0;">Please log in to the admin panel and review this submission. You can approve or reject it from the <strong>Review Queue</strong>.</p>
                <p style="margin:8px 0 0;"><a href="https://nivaararealty.com/admin/review-queue" style="color:#D4AF37;font-weight:bold;">Go to Review Queue →</a></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nivaara Realty Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Listings <noreply@nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: `New Listing Pending Review – ${data.title} (${data.location})`,
      html,
    });

    console.log('[Email] New property submission notification sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send new property submission notification:', error);
    return false;
  }
}

/**
 * Send email notification to info@nivaararealty.com when a public project is submitted
 */
export async function sendNewProjectSubmissionNotification(data: {
  name: string;
  builderName: string;
  city: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  submitterName: string;
  submitterPhone: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Email] Resend not configured, skipping new project submission notification');
    return false;
  }

  const priceDisplay = (data.minPrice || data.maxPrice)
    ? `₹${data.minPrice ? Number(data.minPrice).toLocaleString('en-IN') : '?'} – ₹${data.maxPrice ? Number(data.maxPrice).toLocaleString('en-IN') : '?'}`
    : 'Not specified';

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #1A1A1A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { color: #444; margin-top: 3px; font-size: 15px; }
            .action-box { background: #fff; border-left: 4px solid #D4AF37; padding: 15px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;font-size:22px;">New Project Pending Review</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A project has been submitted via the public listing form</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Project Name</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Builder</div>
                <div class="value">${data.builderName}</div>
              </div>
              <div class="field">
                <div class="label">Location</div>
                <div class="value">${data.location}${data.city && data.city !== data.location ? `, ${data.city}` : ''}</div>
              </div>
              <div class="field">
                <div class="label">Price Range</div>
                <div class="value">${priceDisplay}</div>
              </div>
              <div class="field">
                <div class="label">Submitted By</div>
                <div class="value">${data.submitterName}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="value">${data.submitterPhone}</div>
              </div>
              <div class="action-box">
                <p style="margin:0;font-weight:bold;">Action Required</p>
                <p style="margin:6px 0 0;">Please log in to the admin panel and review this submission. You can approve or reject it from the <strong>Review Queue</strong>.</p>
                <p style="margin:8px 0 0;"><a href="https://nivaararealty.com/admin/review-queue" style="color:#D4AF37;font-weight:bold;">Go to Review Queue →</a></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nivaara Realty Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Listings <noreply@nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: `New Project Pending Review – ${data.name} by ${data.builderName}`,
      html,
    });

    console.log('[Email] New project submission notification sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send new project submission notification:', error);
    return false;
  }
}

/**
 * Send email notification to info@nivaararealty.com when a public property listing is edited
 */
export async function sendPropertyReEditNotification(data: {
  title: string;
  location: string;
  price: string | number | null;
  priceLabel: string | null;
  propertyType: string;
  bedrooms: number | null;
  submitterName: string;
  submitterPhone: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Email] Resend not configured, skipping property re-edit notification');
    return false;
  }

  const priceDisplay = data.priceLabel || (data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : 'Not specified');

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #D4AF37; color: #1A1A1A; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #1A1A1A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { color: #444; margin-top: 3px; font-size: 15px; }
            .action-box { background: #fff; border-left: 4px solid #D4AF37; padding: 15px; margin-top: 20px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;font-size:22px;">Listing Edited – Re-Review Required</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A public property listing has been updated and is pending re-approval</p>
            </div>
            <div class="content">
              <p><span class="badge">✏️ Edited by Owner</span></p>
              <div class="field">
                <div class="label">Property Title</div>
                <div class="value">${data.title}</div>
              </div>
              <div class="field">
                <div class="label">Location</div>
                <div class="value">${data.location}</div>
              </div>
              <div class="field">
                <div class="label">Type &amp; Bedrooms</div>
                <div class="value">${data.bedrooms ? `${data.bedrooms} BHK ` : ''}${data.propertyType}</div>
              </div>
              <div class="field">
                <div class="label">Price</div>
                <div class="value">${priceDisplay}</div>
              </div>
              <div class="field">
                <div class="label">Owner</div>
                <div class="value">${data.submitterName}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="value">${data.submitterPhone}</div>
              </div>
              <div class="action-box">
                <p style="margin:0;font-weight:bold;">Action Required</p>
                <p style="margin:6px 0 0;">The owner has edited their listing. It has been moved back to <strong>Pending Review</strong>. Please review the updated content and approve or reject it.</p>
                <p style="margin:8px 0 0;"><a href="https://nivaararealty.com/admin/review-queue" style="color:#D4AF37;font-weight:bold;">Go to Review Queue →</a></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nivaara Realty Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Listings <noreply@nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: `Re-Review Required – ${data.title} (edited by owner)`,
      html,
    });

    console.log('[Email] Property re-edit notification sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send property re-edit notification:', error);
    return false;
  }
}

/**
 * Send email notification to info@nivaararealty.com when a public project listing is edited
 */
export async function sendProjectReEditNotification(data: {
  name: string;
  builderName: string;
  city: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  submitterName: string;
  submitterPhone: string;
}): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.warn('[Email] Resend not configured, skipping project re-edit notification');
    return false;
  }

  const priceDisplay = (data.minPrice || data.maxPrice)
    ? `₹${data.minPrice ? Number(data.minPrice).toLocaleString('en-IN') : '?'} – ₹${data.maxPrice ? Number(data.maxPrice).toLocaleString('en-IN') : '?'}`
    : 'Not specified';

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1A1A1A; color: #D4AF37; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 12px; }
            .label { font-weight: bold; color: #1A1A1A; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { color: #444; margin-top: 3px; font-size: 15px; }
            .action-box { background: #fff; border-left: 4px solid #D4AF37; padding: 15px; margin-top: 20px; }
            .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin:0;font-size:22px;">Project Edited – Re-Review Required</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A public project listing has been updated and is pending re-approval</p>
            </div>
            <div class="content">
              <p><span class="badge">✏️ Edited by Owner</span></p>
              <div class="field">
                <div class="label">Project Name</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="field">
                <div class="label">Builder</div>
                <div class="value">${data.builderName}</div>
              </div>
              <div class="field">
                <div class="label">Location</div>
                <div class="value">${data.location}${data.city && data.city !== data.location ? `, ${data.city}` : ''}</div>
              </div>
              <div class="field">
                <div class="label">Price Range</div>
                <div class="value">${priceDisplay}</div>
              </div>
              <div class="field">
                <div class="label">Owner</div>
                <div class="value">${data.submitterName}</div>
              </div>
              <div class="field">
                <div class="label">Contact Phone</div>
                <div class="value">${data.submitterPhone}</div>
              </div>
              <div class="action-box">
                <p style="margin:0;font-weight:bold;">Action Required</p>
                <p style="margin:6px 0 0;">The owner has edited their project listing. It has been moved back to <strong>Pending Review</strong>. Please review the updated content and approve or reject it.</p>
                <p style="margin:8px 0 0;"><a href="https://nivaararealty.com/admin/review-queue" style="color:#D4AF37;font-weight:bold;">Go to Review Queue →</a></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nivaara Realty Solutions. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await client.emails.send({
      from: 'Nivaara Listings <noreply@nivaararealty.com>',
      to: 'info@nivaararealty.com',
      subject: `Re-Review Required – ${data.name} by ${data.builderName} (edited by owner)`,
      html,
    });

    console.log('[Email] Project re-edit notification sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send project re-edit notification:', error);
    return false;
  }
}

import * as postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN as string);

const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'noreply@lanforge.com';
const FROM_NAME = process.env.POSTMARK_FROM_NAME || 'LANForge';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const escapeHtml = (unsafe: string): string => {
  return String(unsafe)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
};

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  email: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export const sendOrderConfirmation = async (data: OrderEmailData): Promise<void> => {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  await client.sendEmail({
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: data.email,
    Subject: `Order Confirmation #${data.orderNumber} - LANForge`,
    HtmlBody: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#10b981;padding:32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:28px">LANForge</h1>
            <p style="color:#d1fae5;margin:8px 0 0">Order Confirmed! 🎉</p>
          </div>
          <div style="padding:32px">
            <h2 style="color:#111827">Hi ${escapeHtml(data.customerName)},</h2>
            <p style="color:#6b7280">Thank you for your order! We're getting it ready for you.</p>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:24px 0">
              <p style="margin:0;font-size:14px;color:#6b7280">Order Number</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#10b981">#${escapeHtml(data.orderNumber)}</p>
            </div>
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:8px;text-align:left;color:#6b7280;font-size:14px">Item</th>
                  <th style="padding:8px;text-align:center;color:#6b7280;font-size:14px">Qty</th>
                  <th style="padding:8px;text-align:right;color:#6b7280;font-size:14px">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <div style="margin-top:16px;border-top:2px solid #e5e7eb;padding-top:16px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="color:#6b7280">Subtotal</span>
                <span>$${data.subtotal.toFixed(2)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="color:#6b7280">Shipping</span>
                <span>${data.shipping === 0 ? 'FREE' : '$' + data.shipping.toFixed(2)}</span>
              </div>
              ${data.discount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#10b981"><span>Discount</span><span>-$${data.discount.toFixed(2)}</span></div>` : ''}
              <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;margin-top:8px">
                <span>Total</span>
                <span style="color:#10b981">$${data.total.toFixed(2)}</span>
              </div>
            </div>
            <div style="margin-top:32px;padding:16px;background:#f9fafb;border-radius:8px">
              <p style="margin:0;font-size:14px;font-weight:bold;color:#111827">Shipping To:</p>
              <p style="margin:4px 0 0;color:#6b7280;font-size:14px">
                ${escapeHtml(data.shippingAddress.address)}, ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zip)}
              </p>
            </div>
            <div style="text-align:center;margin-top:32px">
              <a href="${FRONTEND_URL}/order-status?order=${data.orderNumber}" 
                 style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
                Track Your Order
              </a>
            </div>
          </div>
          <div style="background:#f9fafb;padding:24px;text-align:center;color:#9ca3af;font-size:12px">
            <p>© 2026 LANForge. All rights reserved.</p>
            <p><a href="${FRONTEND_URL}" style="color:#10b981">lanforge.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    TextBody: `Order Confirmation #${data.orderNumber}\n\nHi ${data.customerName},\nThank you for your order!\n\nTotal: $${data.total.toFixed(2)}\n\nTrack your order: ${FRONTEND_URL}/order-status?order=${encodeURIComponent(data.orderNumber)}`,
    MessageStream: 'outbound',
  });
};

export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  await client.sendEmail({
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: email,
    Subject: `Welcome to LANForge, ${name}! Here's 10% off 🎮`,
    HtmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#10b981;padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">Welcome to LANForge!</h1>
        </div>
        <div style="padding:32px">
          <h2>Hi ${escapeHtml(name)},</h2>
          <p>Welcome to the LANForge family! We build high-performance gaming PCs tailored for players like you.</p>
          <p>As a welcome gift, use code <strong style="color:#10b981;font-size:20px">WELCOME10</strong> for 10% off your first order!</p>
          <div style="text-align:center;margin-top:32px">
            <a href="${FRONTEND_URL}/products" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
              Shop Now
            </a>
          </div>
        </div>
      </div>
    `,
    TextBody: `Welcome to LANForge, ${name}! Use code WELCOME10 for 10% off your first order. Shop at ${FRONTEND_URL}`,
    MessageStream: 'outbound',
  });
};

export const sendShippingNotification = async (
  name: string,
  email: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
): Promise<void> => {
  await client.sendEmail({
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: email,
    Subject: `Your LANForge order #${orderNumber} has shipped! 📦`,
    HtmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#3b82f6;padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0">Your order is on its way!</h1>
        </div>
        <div style="padding:32px">
          <h2>Hi ${escapeHtml(name)},</h2>
          <p>Great news! Your order <strong>#${escapeHtml(orderNumber)}</strong> has been shipped.</p>
          <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:24px 0">
            <p style="margin:0;font-size:14px;color:#6b7280">Tracking Number</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:#3b82f6">${escapeHtml(trackingNumber)}</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:14px">Carrier: ${escapeHtml(carrier)}</p>
          </div>
          <div style="text-align:center;margin-top:32px">
            <a href="${FRONTEND_URL}/order-status?order=${encodeURIComponent(orderNumber)}" style="background:#3b82f6;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
              Track Order
            </a>
          </div>
        </div>
      </div>
    `,
    TextBody: `Your order #${orderNumber} has shipped! Tracking: ${trackingNumber} via ${carrier}`,
    MessageStream: 'outbound',
  });
};

export const sendPasswordReset = async (
  name: string,
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  await client.sendEmail({
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: email,
    Subject: 'Reset your LANForge password',
    HtmlBody: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="padding:32px">
          <h2>Hi ${escapeHtml(name)},</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align:center;margin-top:32px">
            <a href="${resetUrl}" style="background:#10b981;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
              Reset Password
            </a>
          </div>
          <p style="margin-top:24px;color:#6b7280;font-size:14px">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
    TextBody: `Reset your LANForge password: ${resetUrl}\nThis link expires in 1 hour.`,
    MessageStream: 'outbound',
  });
};

export const sendCampaignEmail = async (
  to: string[],
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<void> => {
  const messages = to.map((email) => ({
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: email,
    Subject: subject,
    HtmlBody: htmlBody,
    TextBody: textBody,
    MessageStream: 'broadcast',
  }));

  // Send in batches of 500
  for (let i = 0; i < messages.length; i += 500) {
    await client.sendEmailBatch(messages.slice(i, i + 500));
  }
};
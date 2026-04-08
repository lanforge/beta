import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_KEY as string);

const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || 'support@lanforge.co';
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
  shippingInsurance: number;
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

interface OrderStatusUpdateData {
  email: string;
  orderNumber: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
}

export const sendOrderStatusUpdate = async (data: OrderStatusUpdateData): Promise<void> => {
  const formattedStatus = data.status.replace(/-/g, ' ').toUpperCase();
  const subject = `Order Status Updated: ${formattedStatus} - LANForge`;
  
  let trackingHtml = '';
  if (data.trackingNumber) {
    trackingHtml = `
      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:32px;">
        <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Tracking Information</p>
        <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:#f8fafc;">${escapeHtml(data.trackingNumber)}</p>
        ${data.carrier ? `<p style="margin:4px 0 0;font-size:14px;color:#cbd5e1;">Carrier: ${escapeHtml(data.carrier)}</p>` : ''}
      </div>
    `;
  }

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: data.email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
        <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #064e3b 0%, #10b981 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
            <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
            <p style="color:#d1fae5;margin:16px 0 0;font-size:18px;font-weight:500;">Order Update</p>
          </div>
          
          <div style="padding:30px 20px;box-sizing:border-box;word-break:break-word;">
            <h2 style="color:#f8fafc;margin:0 0 16px;font-size:24px;">Hi ${escapeHtml(data.customerName)},</h2>
            <p style="color:#94a3b8;margin:0 0 32px;font-size:16px;line-height:1.6;">
              The status of your order <strong>#${escapeHtml(data.orderNumber)}</strong> has been updated.
            </p>
            
            <div style="text-align:center;padding:24px 15px;border:1px solid #10b981;border-radius:12px;background-color:rgba(16, 185, 129, 0.1);margin-bottom:32px;box-sizing:border-box;">
              <h3 style="color:#10b981;margin:0;font-size:24px;text-transform:uppercase;letter-spacing:1px;word-break:break-word;">${formattedStatus}</h3>
            </div>
            
            ${trackingHtml}
            
            <!-- Action Button -->
            <div style="text-align:center;margin-top:40px;">
              <a href="${FRONTEND_URL}/order-status?order=${data.orderNumber}" 
                 style="display:inline-block;background-color:#10b981;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.4);max-width:100%;box-sizing:border-box;">
                Track Your Order Live
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
            <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#10b981;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `Order Status Update: ${formattedStatus}\n\nHi ${data.customerName},\nYour order #${data.orderNumber} is now: ${formattedStatus}\n\n${data.trackingNumber ? `Tracking: ${data.trackingNumber} (${data.carrier || ''})\n\n` : ''}Track live: ${FRONTEND_URL}/order-status?order=${encodeURIComponent(data.orderNumber)}`,
  });

  if (error) {
    console.error('Resend error sending order status update:', error);
  }
};

export const sendOrderConfirmation = async (data: OrderEmailData): Promise<void> => {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 8px;border-bottom:1px solid #334155;color:#f8fafc;font-size:15px;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:16px 8px;border-bottom:1px solid #334155;text-align:center;color:#94a3b8;font-size:15px;">
            ${item.quantity}
          </td>
          <td style="padding:16px 8px;border-bottom:1px solid #334155;text-align:right;color:#f8fafc;font-size:15px;font-weight:600;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: data.email,
    subject: `Order Confirmation #${data.orderNumber} - LANForge`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
        <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #064e3b 0%, #10b981 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
            <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
            <p style="color:#d1fae5;margin:16px 0 0;font-size:18px;font-weight:500;">Order Confirmed! 🚀</p>
          </div>
          
          <div style="padding:30px 20px;box-sizing:border-box;">
            <h2 style="color:#f8fafc;margin:0 0 16px;font-size:24px;">Hi ${escapeHtml(data.customerName)},</h2>
            <p style="color:#94a3b8;margin:0 0 32px;font-size:16px;line-height:1.6;">
              Thank you for trusting LANForge with your build. We've received your order and our team is already getting everything ready for you.
            </p>
            
            <!-- Order Info Card -->
            <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px 15px;margin-bottom:32px;box-sizing:border-box;">
              <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Order Number</p>
              <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#10b981;word-break:break-word;">#${escapeHtml(data.orderNumber)}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#cbd5e1;">Placed on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            
            <!-- Items Table -->
            <h3 style="color:#f8fafc;font-size:18px;margin:0 0 16px;border-bottom:2px solid #334155;padding-bottom:12px;">Order Details</h3>
            <div style="overflow-x:auto;">
              <table style="width:100%;min-width:280px;border-collapse:collapse;margin-bottom:32px;">
                <thead>
                  <tr>
                    <th style="padding:12px 8px;text-align:left;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #334155;">Item</th>
                    <th style="padding:12px 8px;text-align:center;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #334155;">Qty</th>
                    <th style="padding:12px 8px;text-align:right;color:#94a3b8;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #334155;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            
            <!-- Summary -->
            <div style="width:100%;max-width:300px;margin-left:auto;border-top:1px solid #334155;padding-top:24px;margin-top:24px;box-sizing:border-box;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding-bottom:12px;font-size:15px;color:#94a3b8;text-align:left;">Subtotal</td>
                  <td style="padding-bottom:12px;font-size:15px;color:#f8fafc;font-weight:500;text-align:right;">$${data.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;font-size:15px;color:#94a3b8;text-align:left;">Shipping</td>
                  <td style="padding-bottom:12px;font-size:15px;color:#f8fafc;font-weight:500;text-align:right;">${data.shipping === 0 ? 'FREE' : '$' + data.shipping.toFixed(2)}</td>
                </tr>
                ${data.shippingInsurance > 0 || data.shippingInsurance === 0 ? `<tr><td style="padding-bottom:12px;font-size:15px;color:#94a3b8;text-align:left;">Shipping Insurance</td><td style="padding-bottom:12px;font-size:15px;color:#f8fafc;font-weight:500;text-align:right;">${data.shippingInsurance === 0 ? 'FREE' : '$' + data.shippingInsurance.toFixed(2)}</td></tr>` : ''}
                ${data.tax > 0 ? `<tr><td style="padding-bottom:12px;font-size:15px;color:#94a3b8;text-align:left;">Tax</td><td style="padding-bottom:12px;font-size:15px;color:#f8fafc;font-weight:500;text-align:right;">$${data.tax.toFixed(2)}</td></tr>` : ''}
                ${data.discount > 0 ? `<tr><td style="padding-bottom:12px;font-size:15px;color:#10b981;text-align:left;">Discount</td><td style="padding-bottom:12px;font-size:15px;color:#10b981;font-weight:500;text-align:right;">-$${data.discount.toFixed(2)}</td></tr>` : ''}
                <tr>
                  <td style="padding-top:20px;font-size:22px;font-weight:bold;color:#f8fafc;text-align:left;border-top:1px solid #334155;">Total</td>
                  <td style="padding-top:20px;font-size:22px;font-weight:bold;color:#10b981;text-align:right;border-top:1px solid #334155;">$${data.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <!-- Shipping Info -->
            <div style="margin-top:40px;background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px 15px;box-sizing:border-box;">
              <p style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Shipping Address</p>
              <p style="margin:0;color:#f8fafc;font-size:15px;line-height:1.6;word-break:break-word;">
                ${escapeHtml(data.shippingAddress.address)}<br/>
                ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zip)}<br/>
                ${escapeHtml(data.shippingAddress.country)}
              </p>
            </div>
            
            <!-- Action Button -->
            <div style="text-align:center;margin-top:48px;">
              <a href="${FRONTEND_URL}/order-status?order=${data.orderNumber}" 
                 style="display:inline-block;background-color:#10b981;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.4);max-width:100%;box-sizing:border-box;">
                Track Your Order
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
            <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#10b981;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `Order Confirmation #${data.orderNumber}\n\nHi ${data.customerName},\nThank you for your order!\n\nTotal: $${data.total.toFixed(2)}\n\nTrack your order: ${FRONTEND_URL}/order-status?order=${encodeURIComponent(data.orderNumber)}`,
  });

  if (error) {
    console.error("Resend sendOrderConfirmation Error:", error);
    throw new Error(error.message);
  }
};

export const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `Welcome to LANForge, ${name}! Here's 10% off 🎮`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
        <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #064e3b 0%, #10b981 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
            <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
            <p style="color:#d1fae5;margin:16px 0 0;font-size:18px;font-weight:500;">Welcome to LANForge! 🎮</p>
          </div>
          
          <div style="padding:30px 20px;box-sizing:border-box;word-break:break-word;">
            <h2 style="color:#f8fafc;margin:0 0 16px;font-size:24px;">Hi ${escapeHtml(name)},</h2>
            <p style="color:#94a3b8;margin:0 0 24px;font-size:16px;line-height:1.6;">
              Welcome to the LANForge family! We build high-performance gaming PCs tailored for players like you.
            </p>
            
            <div style="text-align:center;padding:24px 15px;border:1px solid #10b981;border-radius:12px;background-color:rgba(16, 185, 129, 0.1);margin-bottom:32px;box-sizing:border-box;">
              <p style="margin:0;font-size:16px;color:#94a3b8;margin-bottom:8px;">As a welcome gift, use code for 10% off your first order!</p>
              <h3 style="color:#10b981;margin:0;font-size:28px;letter-spacing:1px;word-break:break-word;">WELCOME10</h3>
            </div>
            
            <!-- Action Button -->
            <div style="text-align:center;margin-top:40px;">
              <a href="${FRONTEND_URL}/products" 
                 style="display:inline-block;background-color:#10b981;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.4);max-width:100%;box-sizing:border-box;">
                Shop Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
            <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#10b981;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `Welcome to LANForge, ${name}! Use code WELCOME10 for 10% off your first order. Shop at ${FRONTEND_URL}`,
  });
  if (error) throw new Error(error.message);
};

export const sendShippingNotification = async (
  name: string,
  email: string,
  orderNumber: string,
  trackingNumber: string,
  carrier: string
): Promise<void> => {
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `Your LANForge order #${orderNumber} has shipped! 📦`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
        <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
            <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
            <p style="color:#dbeafe;margin:16px 0 0;font-size:18px;font-weight:500;">Your order is on its way! 📦</p>
          </div>
          
          <div style="padding:30px 20px;box-sizing:border-box;word-break:break-word;">
            <h2 style="color:#f8fafc;margin:0 0 16px;font-size:24px;">Hi ${escapeHtml(name)},</h2>
            <p style="color:#94a3b8;margin:0 0 32px;font-size:16px;line-height:1.6;">
              Great news! Your order <strong>#${escapeHtml(orderNumber)}</strong> has been shipped.
            </p>
            
            <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px 15px;margin-bottom:32px;box-sizing:border-box;">
              <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Tracking Number</p>
              <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:#3b82f6;word-break:break-word;">${escapeHtml(trackingNumber)}</p>
              <p style="margin:4px 0 0;font-size:14px;color:#cbd5e1;">Carrier: ${escapeHtml(carrier)}</p>
            </div>
            
            <!-- Action Button -->
            <div style="text-align:center;margin-top:40px;">
              <a href="${FRONTEND_URL}/order-status?order=${encodeURIComponent(orderNumber)}" 
                 style="display:inline-block;background-color:#3b82f6;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(59, 130, 246, 0.4);max-width:100%;box-sizing:border-box;">
                Track Order
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
            <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#3b82f6;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `Your order #${orderNumber} has shipped! Tracking: ${trackingNumber} via ${carrier}`,
  });
  if (error) throw new Error(error.message);
};

export const sendPasswordReset = async (
  name: string,
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: 'Reset your LANForge password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
        <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #064e3b 0%, #10b981 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
            <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
            <p style="color:#d1fae5;margin:16px 0 0;font-size:18px;font-weight:500;">Password Reset Request</p>
          </div>
          
          <div style="padding:30px 20px;box-sizing:border-box;word-break:break-word;">
            <h2 style="color:#f8fafc;margin:0 0 16px;font-size:24px;">Hi ${escapeHtml(name)},</h2>
            <p style="color:#94a3b8;margin:0 0 24px;font-size:16px;line-height:1.6;">
              We received a request to reset your password. Click the button below to set a new password:
            </p>
            
            <!-- Action Button -->
            <div style="text-align:center;margin-top:40px;margin-bottom:32px;">
              <a href="${resetUrl}" 
                 style="display:inline-block;background-color:#10b981;color:#ffffff;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.4);max-width:100%;box-sizing:border-box;">
                Reset Password
              </a>
            </div>
            
            <p style="color:#64748b;margin:0;font-size:14px;line-height:1.5;text-align:center;">
              This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
            <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
            <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#10b981;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `Reset your LANForge password: ${resetUrl}\nThis link expires in 1 hour.`,
  });
  if (error) throw new Error(error.message);
};

export const sendCampaignEmail = async (
  to: string[],
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<void> => {
  const wrappedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#0f172a;margin:0;padding:20px 10px;-webkit-font-smoothing:antialiased;">
      <div style="width:100%;max-width:640px;margin:0 auto;background-color:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);box-sizing:border-box;">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #064e3b 0%, #10b981 100%);padding:30px 20px;text-align:center;box-sizing:border-box;">
          <img src="${FRONTEND_URL}/logo-2.png" alt="LANForge Logo" style="max-height:60px;width:auto;max-width:100%;display:block;margin:0 auto;">
          <p style="color:#d1fae5;margin:16px 0 0;font-size:18px;font-weight:500;">${escapeHtml(subject)}</p>
        </div>
        
        <div style="padding:30px 20px;box-sizing:border-box;word-break:break-word;color:#f8fafc;font-size:16px;line-height:1.6;">
          ${htmlBody}
        </div>
        
        <!-- Footer -->
        <div style="background-color:#0f172a;padding:30px 20px;text-align:center;border-top:1px solid #334155;box-sizing:border-box;">
          <p style="margin:0 0 12px;color:#64748b;font-size:13px;">© ${new Date().getFullYear()} LANForge. Built for performance.</p>
          <p style="margin:0;"><a href="${FRONTEND_URL}" style="color:#10b981;text-decoration:none;font-size:13px;font-weight:500;">Visit our website</a></p>
          <p style="margin:12px 0 0;color:#64748b;font-size:11px;">You are receiving this because you opted in to our marketing emails.</p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  const messages = to.map((email) => ({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: subject,
    html: wrappedHtml,
    text: textBody,
  }));

  // Resend max batch size is 100
  for (let i = 0; i < messages.length; i += 100) {
    const { error } = await resend.batch.send(messages.slice(i, i + 100));
    if (error) throw new Error(error.message);
  }
};
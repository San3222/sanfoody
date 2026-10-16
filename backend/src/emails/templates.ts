// src/emails/templates.ts
// ============================================
// HTML Email Templates — SanFoody
// ============================================

const BRAND_COLOR = "#E63946";
const ORANGE = "#F97316";
const CREAM = "#FFF8F0";
const CHARCOAL = "#1F2937";

// ============================================
// Base Layout
// ============================================

function baseLayout(content: string, previewText?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SanFoody</title>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${CHARCOAL};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ORANGE} 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                San<span style="color: ${CREAM};">Foody</span>
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 13px;">
                Premium food, delivered fresh
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${CHARCOAL}; padding: 24px 40px; text-align: center;">
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                &copy; ${new Date().getFullYear()} SanFoody. All rights reserved.
              </p>
              <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 11px;">
                Made with care, delivered with speed.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================
// Reusable Components
// ============================================

function primaryButton(text: string, url: string): string {
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${ORANGE} 100%); border-radius: 999px;">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function infoBox(content: string): string {
    return `
    <div style="background-color: ${CREAM}; border-left: 4px solid ${BRAND_COLOR}; padding: 16px 20px; border-radius: 8px; margin: 20px 0;">
      ${content}
    </div>
  `;
}

function heading(text: string): string {
    return `<h2 style="margin: 0 0 16px 0; color: ${CHARCOAL}; font-size: 22px; font-weight: 700;">${text}</h2>`;
}

function paragraph(text: string): string {
    return `<p style="margin: 0 0 16px 0; color: #4B5563; font-size: 15px; line-height: 1.6;">${text}</p>`;
}

// ============================================
// 1. Welcome Email
// ============================================

export function welcomeEmail(data: { name: string }): string {
    const content = `
    ${heading(`Welcome, ${data.name}! 🍔`)}
    ${paragraph("Thanks for joining SanFoody. You've taken the first step toward a world of delicious flavors, delivered hot to your door.")}
    
    ${infoBox(`
      <p style="margin: 0; color: ${CHARCOAL}; font-size: 14px; font-weight: 600;">Here's what you can do:</p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
        <li>Discover 500+ restaurants near you</li>
        <li>Track your order live, from kitchen to doorstep</li>
        <li>Earn loyalty points on every order</li>
        <li>Get exclusive offers and discounts</li>
      </ul>
    `)}
    
    ${primaryButton("Browse Restaurants", "http://localhost:5173/restaurants")}
    
    ${paragraph("Have questions? Reply to this email — our support team is always ready to help.")}
  `;
    return baseLayout(content, "Welcome to SanFoody — Delicious food awaits!");
}

// ============================================
// 2. Order Confirmation
// ============================================

export function orderConfirmationEmail(data: {
    customerName: string;
    orderId: string;
    restaurantName: string;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    estimatedDelivery?: string;
}): string {
    const itemsHtml = data.items
        .map(
            (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; color: ${CHARCOAL}; font-size: 14px;">
          ${item.quantity}× ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: ${CHARCOAL}; font-size: 14px; font-weight: 600;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
        )
        .join("");

    const content = `
    ${heading("Order Confirmed! 🎉")}
    ${paragraph(`Thanks ${data.customerName}, your order from <strong>${data.restaurantName}</strong> has been placed successfully.`)}
    
    ${infoBox(`
      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
      <p style="margin: 0; color: ${CHARCOAL}; font-size: 18px; font-weight: 700; font-family: monospace;">${data.orderId}</p>
      ${data.estimatedDelivery ? `
        <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</p>
        <p style="margin: 4px 0 0 0; color: ${CHARCOAL}; font-size: 15px; font-weight: 600;">${data.estimatedDelivery}</p>
      ` : ""}
    `)}
    
    <h3 style="margin: 24px 0 12px 0; color: ${CHARCOAL}; font-size: 16px; font-weight: 700;">Your Order</h3>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${itemsHtml}
      <tr>
        <td style="padding: 16px 0 0 0; color: ${CHARCOAL}; font-size: 16px; font-weight: 700;">Total</td>
        <td style="padding: 16px 0 0 0; text-align: right; color: ${BRAND_COLOR}; font-size: 18px; font-weight: 800;">₹${data.total}</td>
      </tr>
    </table>
    
    ${primaryButton("Track Your Order", `http://localhost:5173/order/${data.orderId}`)}
    
    ${paragraph("We'll notify you as soon as your order is on the way!")}
  `;
    return baseLayout(content, `Your order ${data.orderId} is confirmed!`);
}

// ============================================
// 3. New Order Alert (Restaurant)
// ============================================

export function newOrderAlertEmail(data: {
    restaurantName: string;
    orderId: string;
    customerName: string;
    total: number;
    itemsCount: number;
    address: string;
}): string {
    const content = `
    ${heading("🔔 New Order Received!")}
    ${paragraph(`You have a new order at <strong>${data.restaurantName}</strong>. Please log in to accept it.`)}
    
    ${infoBox(`
      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
      <p style="margin: 0 0 12px 0; color: ${CHARCOAL}; font-size: 18px; font-weight: 700; font-family: monospace;">${data.orderId}</p>
      
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Customer</td>
          <td style="padding: 4px 0; text-align: right; color: ${CHARCOAL}; font-size: 13px; font-weight: 600;">${data.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Items</td>
          <td style="padding: 4px 0; text-align: right; color: ${CHARCOAL}; font-size: 13px; font-weight: 600;">${data.itemsCount}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Total</td>
          <td style="padding: 4px 0; text-align: right; color: ${BRAND_COLOR}; font-size: 15px; font-weight: 700;">₹${data.total}</td>
        </tr>
      </table>
      
      <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 12px;">Deliver to: ${data.address}</p>
    `)}
    
    ${primaryButton("View Order", "http://localhost:5173/restaurant/orders")}
    
    ${paragraph("<strong>⚡ Action needed:</strong> Accept the order within 5 minutes to avoid auto-cancellation.")}
  `;
    return baseLayout(content, `New order ${data.orderId} — ₹${data.total}`);
}

// ============================================
// 4. Delivery Partner Assigned
// ============================================

export function deliveryAssignedEmail(data: {
    customerName: string;
    orderId: string;
    deliveryPartnerName: string;
    deliveryPartnerPhone?: string;
}): string {
    const content = `
    ${heading("Your delivery partner is on the way! 🚴")}
    ${paragraph(`Hi ${data.customerName}, your order <strong>${data.orderId}</strong> has been assigned to a delivery partner.`)}
    
    ${infoBox(`
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="padding: 8px 0;">
            <div style="display: inline-block; width: 48px; height: 48px; border-radius: 50%; background: ${CREAM}; text-align: center; line-height: 48px; font-size: 20px;">🚴</div>
          </td>
          <td style="padding: 8px 0 8px 12px;">
            <p style="margin: 0; color: ${CHARCOAL}; font-size: 15px; font-weight: 700;">${data.deliveryPartnerName}</p>
            ${data.deliveryPartnerPhone ? `<p style="margin: 4px 0 0 0; color: #6B7280; font-size: 13px;">📞 ${data.deliveryPartnerPhone}</p>` : ""}
          </td>
        </tr>
      </table>
    `)}
    
    ${primaryButton("Track Live", `http://localhost:5173/order/${data.orderId}`)}
    
    ${paragraph("You can track your delivery in real-time on the SanFoody app.")}
  `;
    return baseLayout(content, "Your delivery partner is on the way!");
}

// ============================================
// 5. Order Delivered + Rating CTA
// ============================================

export function orderDeliveredEmail(data: {
    customerName: string;
    orderId: string;
    restaurantName: string;
    total: number;
    ratingUrl: string;
}): string {
    const content = `
    ${heading("Enjoy your meal! 🎉")}
    ${paragraph(`Hi ${data.customerName}, your order from <strong>${data.restaurantName}</strong> has been delivered. We hope you love it!`)}
    
    ${infoBox(`
      <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order ${data.orderId}</p>
      <p style="margin: 8px 0 0 0; color: ${CHARCOAL}; font-size: 20px; font-weight: 800;">₹${data.total}</p>
    `)}
    
    ${paragraph("How was your delivery experience? Your feedback helps us improve and rewards great delivery partners.")}
    
    ${primaryButton("⭐ Rate Your Delivery", data.ratingUrl)}
    
    ${paragraph("Thanks for choosing SanFoody. See you soon! 🍕")}
  `;
    return baseLayout(content, "Your order has been delivered!");
}

// ============================================
// 6. Payout Status (Delivery Partner)
// ============================================

export function payoutStatusEmail(data: {
    partnerName: string;
    amount: number;
    status: "processing" | "completed" | "failed";
    transactionId?: string;
    reason?: string;
}): string {
    const statusMessages = {
        processing: {
            emoji: "⏳",
            title: "Withdrawal Approved",
            message: "Your withdrawal is being processed. Money will be transferred within 24 hours.",
            color: "#3B82F6",
        },
        completed: {
            emoji: "✅",
            title: "Withdrawal Completed",
            message: "Your money has been transferred successfully. Check your UPI/bank account.",
            color: "#16A34A",
        },
        failed: {
            emoji: "❌",
            title: "Withdrawal Rejected",
            message: "Your withdrawal was rejected. The amount has been refunded to your SanFoody wallet.",
            color: "#DC2626",
        },
    };

    const status = statusMessages[data.status];

    const content = `
    ${heading(`${status.emoji} ${status.title}`)}
    ${paragraph(`Hi ${data.partnerName}, here's an update on your withdrawal request.`)}
    
    ${infoBox(`
      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</p>
      <p style="margin: 0; color: ${status.color}; font-size: 28px; font-weight: 800;">₹${data.amount}</p>
      
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.05);">
        <p style="margin: 0; color: #4B5563; font-size: 14px;">${status.message}</p>
        ${data.transactionId ? `<p style="margin: 8px 0 0 0; color: #6B7280; font-size: 12px;">Transaction ID: <strong>${data.transactionId}</strong></p>` : ""}
        ${data.reason ? `<p style="margin: 8px 0 0 0; color: #DC2626; font-size: 12px;">Reason: ${data.reason}</p>` : ""}
      </div>
    `)}
    
    ${primaryButton("View Earnings", "http://localhost:5173/delivery/earnings")}
  `;
    return baseLayout(content, `${status.title} — ₹${data.amount}`);
}

// ============================================
// 7. Gift Card Delivery
// ============================================

export function giftCardEmail(data: {
    recipientName: string;
    senderName: string;
    amount: number;
    code: string;
    message?: string;
}): string {
    const content = `
    ${heading(`🎁 You received a Gift Card!`)}
    ${paragraph(`Hi ${data.recipientName}, <strong>${data.senderName}</strong> has sent you a SanFoody gift card worth <strong>₹${data.amount}</strong>!`)}
    
    ${data.message ? `
      ${infoBox(`
        <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message from ${data.senderName}</p>
        <p style="margin: 8px 0 0 0; color: ${CHARCOAL}; font-size: 15px; font-style: italic;">"${data.message}"</p>
      `)}
    ` : ""}
    
    ${infoBox(`
      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Gift Card Code</p>
      <p style="margin: 0; color: ${BRAND_COLOR}; font-size: 22px; font-weight: 800; font-family: monospace; letter-spacing: 2px;">${data.code}</p>
    `)}
    
    ${primaryButton("Redeem Now", "http://localhost:5173/gift-cards")}
    
    ${paragraph("Enter this code on the Gift Cards page to add ₹" + data.amount + " to your SanFoody wallet. Valid for 1 year.")}
  `;
    return baseLayout(content, `You received a ₹${data.amount} gift card!`);
}

// ============================================
// 8. Loyalty Tier Upgrade
// ============================================

export function loyaltyTierEmail(data: {
    customerName: string;
    newTier: string;
    points: number;
}): string {
    const tierEmoji: Record<string, string> = {
        silver: "🥈",
        gold: "🥇",
        platinum: "💎",
    };
    const tierEmoji_ = tierEmoji[data.newTier.toLowerCase()] || "🏆";

    const content = `
    ${heading(`${tierEmoji_} You've reached ${data.newTier} Tier!`)}
    ${paragraph(`Congratulations ${data.customerName}! You've leveled up your SanFoody membership.`)}
    
    ${infoBox(`
      <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">New Tier</p>
      <p style="margin: 0 0 12px 0; color: ${BRAND_COLOR}; font-size: 28px; font-weight: 800;">${tierEmoji_} ${data.newTier}</p>
      <p style="margin: 0; color: #4B5563; font-size: 14px;">Total points earned: <strong>${data.points}</strong></p>
    `)}
    
    ${paragraph("Your new tier unlocks exclusive benefits:")}
    
    <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4B5563; font-size: 14px; line-height: 1.8;">
      <li>Higher points earning rate</li>
      <li>Priority support</li>
      <li>Exclusive offers and discounts</li>
      <li>Free delivery perks (Gold+)</li>
    </ul>
    
    ${primaryButton("View Your Rewards", "http://localhost:5173/loyalty")}
  `;
    return baseLayout(content, `You've reached ${data.newTier} tier!`);
}



// ============================================
// 9. Password Reset
// ============================================

export function passwordResetEmail(data: {
  name: string;
  resetLink: string;
}): string {
  const content = `
    ${heading("Reset Your Password 🔐")}
    ${paragraph(`Hi ${data.name}, we received a request to reset your SanFoody password.`)}
    
    ${paragraph("Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.")}
    
    ${primaryButton("Reset Password", data.resetLink)}
    
    ${infoBox(`
      <p style="margin: 0; color: #4B5563; font-size: 13px;">
        <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't change.
      </p>
    `)}
    
    <p style="margin: 24px 0 0 0; color: #6B7280; font-size: 12px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetLink}" style="color: ${BRAND_COLOR}; word-break: break-all;">${data.resetLink}</a>
    </p>
  `;
  return baseLayout(content, "Reset your SanFoody password");
}


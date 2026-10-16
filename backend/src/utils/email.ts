// src/utils/email.ts
// ============================================
// Email Service — Resend
// ============================================

import { Resend } from "resend";
import { env } from "../config/env.js";
import crypto from "node:crypto";

// Lazy init — only create client when needed
let resendClient: Resend | null = null;

function getResend(): Resend {
    if (!resendClient) {
        resendClient = new Resend(env.RESEND_API_KEY);
    }
    return resendClient;
}

// ============================================
// Core Send Function
// ============================================

export async function sendEmail(params: {
    to: string | string[];
    subject: string;
    html: string;
    replyTo?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const resend = getResend();

        const response = await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: Array.isArray(params.to) ? params.to : [params.to],
            subject: params.subject,
            html: params.html,
            replyTo: params.replyTo,
        });

        if (response.error) {
            console.error("📧 Email send failed:", response.error);
            return { success: false, error: response.error.message };
        }

        console.log(`📧 Email sent to ${params.to}: ${response.data?.id}`);
        return { success: true, id: response.data?.id };
    } catch (error: any) {
        console.error("📧 Email error:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// Convenience Wrappers
// ============================================

export async function sendWelcomeEmail(user: {
    email: string;
    name: string;
}) {
    // Keep the import path dynamic so TypeScript does not require a local declaration
    // for the runtime-resolved email template module.
    const templatesModule = "../emails/templates.js";
    const { welcomeEmail } = await import(templatesModule);
    return sendEmail({
        to: user.email,
        subject: "Welcome to SanFoody! 🍔",
        html: welcomeEmail({ name: user.name }),
    });
}

export async function sendOrderConfirmationEmail(params: {
    email: string;
    customerName: string;
    orderId: string;
    restaurantName: string;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    estimatedDelivery?: string;
}) {
    // Keep the import path dynamic so TypeScript does not require a local declaration
    // for the runtime-resolved email template module.
    const templatesModule = "../emails/templates.js";
    const { orderConfirmationEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `Order Confirmed — ${params.orderId} 🍽️`,
        html: orderConfirmationEmail(params),
    });
}

export async function sendNewOrderAlertEmail(params: {
    email: string;
    restaurantName: string;
    orderId: string;
    customerName: string;
    total: number;
    itemsCount: number;
    address: string;
}) {
    // Keep the import path dynamic so TypeScript does not require a local declaration
    // for the runtime-resolved email template module.
    const templatesModule = "../emails/templates.js";
    const { newOrderAlertEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `🔔 New Order — ${params.orderId}`,
        html: newOrderAlertEmail(params),
    });
}

export async function sendDeliveryAssignedEmail(params: {
    email: string;
    customerName: string;
    orderId: string;
    deliveryPartnerName: string;
    deliveryPartnerPhone?: string;
}) {
    const templatesModule = "../emails/templates.js";
    const { deliveryAssignedEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `🚴 Delivery partner assigned — ${params.orderId}`,
        html: deliveryAssignedEmail(params),
    });
}

export async function sendOrderDeliveredEmail(params: {
    email: string;
    customerName: string;
    orderId: string;
    restaurantName: string;
    total: number;
    ratingUrl: string;
}) {
    // Keep the import path dynamic so TypeScript does not require a local declaration
    // for the runtime-resolved email template module.
    const templatesModule = "../emails/templates.js";
    const { orderDeliveredEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `✅ Order Delivered — Rate your experience!`,
        html: orderDeliveredEmail(params),
    });
}

export async function sendPayoutApprovedEmail(params: {
    email: string;
    partnerName: string;
    amount: number;
    status: "processing" | "completed" | "failed";
    transactionId?: string;
    reason?: string;
}) {
    const templatesModule = "../emails/templates.js";
    const { payoutStatusEmail } = await import(templatesModule);
    const subjects = {
        processing: `💰 Withdrawal approved — ₹${params.amount}`,
        completed: `✅ Withdrawal completed — ₹${params.amount}`,
        failed: `❌ Withdrawal rejected — ₹${params.amount}`,
    };
    return sendEmail({
        to: params.email,
        subject: subjects[params.status],
        html: payoutStatusEmail(params),
    });
}

export async function sendGiftCardEmail(params: {
    email: string;
    recipientName: string;
    senderName: string;
    amount: number;
    code: string;
    message?: string;
}) {
    const templatesModule = "../emails/templates.js";
    const { giftCardEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `🎁 You received a ₹${params.amount} SanFoody Gift Card!`,
        html: giftCardEmail(params),
    });
}

export async function sendLoyaltyTierUpgradeEmail(params: {
    email: string;
    customerName: string;
    newTier: string;
    points: number;
}) {
    const templatesModule = "../emails/templates.js";
    const { loyaltyTierEmail } = await import(templatesModule);
    return sendEmail({
        to: params.email,
        subject: `🏆 You've reached ${params.newTier} tier!`,
        html: loyaltyTierEmail(params),
    });
}



// ============================================
// 9. Password Reset
// ============================================
export async function sendPasswordResetEmail(params: {
    email: string;
    name: string;
    resetToken: string;
}) {
    const { passwordResetEmail } = await import("../emails/templates.js");
    const resetLink = `${process.env.CORS_ORIGIN || "http://localhost:5173"}/reset-password/${params.resetToken}`;

    return sendEmail({
        to: params.email,
        subject: "Reset your SanFoody password",
        html: passwordResetEmail({ name: params.name, resetLink }),
    });
}
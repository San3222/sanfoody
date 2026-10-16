import { FastifyReply } from "fastify";
import { Payout } from "../models/Payout.model.js";
import { Wallet } from "../models/Wallet.model.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendPushNotification } from "./push.controller.js";
import { sendPayoutApprovedEmail } from "../utils/email.js";

// ============================================
// GET /admin/payouts — All payouts (filterable)
// ============================================
export const getAllPayouts = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { status } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (status && status !== "all") {
            query.status = status;
        }

        const [payouts, total] = await Promise.all([
            Payout.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("partnerId", "name email phone totalEarnings"),
            Payout.countDocuments(query),
        ]);

        // Stats
        const stats = await Payout.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    total: { $sum: "$amount" },
                },
            },
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    payouts,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    stats: stats.reduce(
                        (acc, s) => ({
                            ...acc,
                            [s._id]: { count: s.count, amount: s.total },
                        }),
                        {}
                    ),
                },
                "Payouts fetched successfully"
            )
        );
    }
);

// ============================================
// PATCH /admin/payouts/:id/approve
// Admin approves a payout → processing
// ============================================
export const approvePayout = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const payout = await Payout.findById(id);

        if (!payout) {
            throw new ApiError(404, "Payout not found");
        }

        if (payout.status !== "pending") {
            throw new ApiError(400, `Cannot approve payout in '${payout.status}' status`);
        }

        payout.status = "processing";
        payout.processedAt = new Date();
        await payout.save();

        // 🔥 Notify partner
        try {
            await sendPushNotification(
                payout.partnerId.toString(),
                "💰 Withdrawal Approved",
                `Your withdrawal of ₹${payout.amount} is being processed.`,
                `/delivery/earnings`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }



        // 🔥 Email notification
        try {
            const partner = await User.findById(payout.partnerId);
            if (partner) {
                sendPayoutApprovedEmail({
                    email: partner.email,
                    partnerName: partner.name,
                    amount: payout.amount,
                    status: "processing",
                }).catch((err) => console.error("Payout email failed:", err));
            }
        } catch (err) {
            console.error("Payout email failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, payout, "Payout approved for processing"));
    }
);

// ============================================
// PATCH /admin/payouts/:id/complete
// Admin marks payout as completed (money sent)
// ============================================
export const completePayout = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;
        const { transactionId } = req.body as any;

        const payout = await Payout.findById(id);

        if (!payout) {
            throw new ApiError(404, "Payout not found");
        }

        if (payout.status !== "processing") {
            throw new ApiError(400, `Cannot complete payout in '${payout.status}' status`);
        }

        payout.status = "completed";
        payout.completedAt = new Date();
        if (transactionId) {
            payout.transactionId = transactionId;
        }
        await payout.save();

        // 🔥 Notify partner
        try {
            await sendPushNotification(
                payout.partnerId.toString(),
                "✅ Withdrawal Completed",
                `₹${payout.amount} has been sent to your ${payout.method === "upi" ? "UPI" : "bank account"}.`,
                `/delivery/earnings`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }


        // 🔥 Email notification
        try {
            const partner = await User.findById(payout.partnerId);
            if (partner) {
                sendPayoutApprovedEmail({
                    email: partner.email,
                    partnerName: partner.name,
                    amount: payout.amount,
                    status: "completed",
                    transactionId: payout.transactionId,
                }).catch((err) => console.error("Payout email failed:", err));
            }
        } catch (err) {
            console.error("Payout email failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, payout, "Payout completed successfully"));
    }
);

// ============================================
// PATCH /admin/payouts/:id/reject
// Admin rejects → refund to wallet
// ============================================
export const rejectPayout = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;
        const { reason } = req.body as any;

        const payout = await Payout.findById(id);

        if (!payout) {
            throw new ApiError(404, "Payout not found");
        }

        if (!["pending", "processing"].includes(payout.status)) {
            throw new ApiError(400, `Cannot reject payout in '${payout.status}' status`);
        }

        // Refund amount to wallet
        const wallet = await Wallet.findOne({ user: payout.partnerId });
        if (wallet) {
            wallet.balance += payout.amount;
            await wallet.save();

            await WalletTransaction.create({
                user: payout.partnerId,
                type: "credit",
                amount: payout.amount,
                description: `Refund for rejected withdrawal #${payout._id.toString().slice(-6)}`,
                balanceAfter: wallet.balance,
            });
        }

        payout.status = "failed";
        payout.failureReason = reason || "Rejected by admin";
        payout.completedAt = new Date();
        await payout.save();

        // 🔥 Notify partner
        try {
            await sendPushNotification(
                payout.partnerId.toString(),
                "❌ Withdrawal Rejected",
                `Your withdrawal was rejected: ${payout.failureReason}. Amount refunded to wallet.`,
                `/delivery/earnings`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }



        // 🔥 Email notification
        try {
            const partner = await User.findById(payout.partnerId);
            if (partner) {
                sendPayoutApprovedEmail({
                    email: partner.email,
                    partnerName: partner.name,
                    amount: payout.amount,
                    status: "failed",
                    reason: payout.failureReason,
                }).catch((err) => console.error("Payout email failed:", err));
            }
        } catch (err) {
            console.error("Payout email failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, payout, "Payout rejected and amount refunded"));
    }
);

// ============================================
// GET /admin/payouts/stats — Payout analytics
// ============================================
export const getPayoutStats = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const stats = await Payout.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const totalPartners = await User.countDocuments({ role: "delivery" });

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    stats: stats.reduce(
                        (acc, s) => ({
                            ...acc,
                            [s._id]: { count: s.count, amount: s.total },
                        }),
                        {}
                    ),
                    totalPartners,
                },
                "Payout stats fetched successfully"
            )
        );
    }
);
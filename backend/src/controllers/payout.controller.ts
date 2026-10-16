import { FastifyReply } from "fastify";
import { Payout } from "../models/Payout.model.js";
import { Wallet } from "../models/Wallet.model.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

const MIN_WITHDRAWAL = 10;

// ============================================
// GET /delivery/payout/balance
// Get available + pending balance
// ============================================
export const getWalletBalance = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user._id;

        // Get or create wallet
        let wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await Wallet.create({ user: userId, balance: 0 });
        }

        // Pending withdrawals (not yet completed)
        const pendingPayouts = await Payout.aggregate([
            {
                $match: {
                    partnerId: userId,
                    status: { $in: ["pending", "processing"] },
                },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const pendingAmount = pendingPayouts[0]?.total || 0;

        // Lifetime stats
        const lifetimeStats = await Payout.aggregate([
            {
                $match: {
                    partnerId: userId,
                    status: "completed",
                },
            },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);

        const lifetimeWithdrawn = lifetimeStats[0]?.total || 0;
        const totalWithdrawals = lifetimeStats[0]?.count || 0;

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    balance: wallet.balance,
                    pending: pendingAmount,
                    lifetimeWithdrawn,
                    totalWithdrawals,
                    minWithdrawal: MIN_WITHDRAWAL,
                },
                "Wallet balance fetched successfully"
            )
        );
    }
);

// ============================================
// POST /delivery/payout/request
// Request a withdrawal
// ============================================
export const requestPayout = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { amount } = req.body as any;
        const userId = req.user._id;

        // Validation
        if (!amount || typeof amount !== "number" || amount < MIN_WITHDRAWAL) {
            throw new ApiError(400, `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
        }

        // Get wallet
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            throw new ApiError(404, "Wallet not found");
        }

        if (wallet.balance < amount) {
            throw new ApiError(
                400,
                `Insufficient balance. Available: ₹${wallet.balance}`
            );
        }

        // Check payout method exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        if (!user.payoutMethod || !user.payoutMethod.type) {
            throw new ApiError(
                400,
                "Please add a payout method (UPI or Bank) before requesting withdrawal"
            );
        }

        // Check no pending withdrawal exists
        const existingPending = await Payout.findOne({
            partnerId: userId,
            status: { $in: ["pending", "processing"] },
        });

        if (existingPending) {
            throw new ApiError(
                400,
                "You already have a pending withdrawal. Wait for it to complete."
            );
        }

        // Deduct from wallet immediately (reserve amount)
        wallet.balance -= amount;
        await wallet.save();

        // Log wallet debit
        await WalletTransaction.create({
            user: userId,
            type: "debit",
            amount,
            description: `Withdrawal request to ${user.payoutMethod.type.toUpperCase()}`,
            balanceAfter: wallet.balance,
        });

        // Snapshot payout method (in case user changes later)
        const payout = await Payout.create({
            partnerId: userId,
            amount,
            method: user.payoutMethod.type,
            status: "pending",
            payoutDetails: {
                upiId: user.payoutMethod.upiId,
                accountHolderName: user.payoutMethod.accountHolderName,
                accountNumber: user.payoutMethod.accountNumber,
                ifscCode: user.payoutMethod.ifscCode,
                bankName: user.payoutMethod.bankName,
            },
        });

        return reply
            .status(201)
            .send(
                new ApiResponse(
                    201,
                    payout,
                    `Withdrawal request of ₹${amount} submitted successfully`
                )
            );
    }
);

// ============================================
// GET /delivery/payout/history
// Partner's payout history
// ============================================
export const getPayoutHistory = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const [payouts, total] = await Promise.all([
            Payout.find({ partnerId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Payout.countDocuments({ partnerId: req.user._id }),
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    payouts,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
                "Payout history fetched successfully"
            )
        );
    }
);

// ============================================
// POST /delivery/payout/method
// Save/update payout method (UPI or Bank)
// ============================================
export const updatePayoutMethod = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { type, upiId, accountHolderName, accountNumber, ifscCode, bankName } =
            req.body as any;

        if (!type || !["upi", "bank"].includes(type)) {
            throw new ApiError(400, "Payout method type must be 'upi' or 'bank'");
        }

        // Validate fields based on type
        if (type === "upi") {
            if (!upiId || !/^[\w.\-]+@[\w]+$/.test(upiId)) {
                throw new ApiError(400, "Please provide a valid UPI ID (e.g., name@paytm)");
            }
        } else if (type === "bank") {
            if (!accountHolderName || !accountNumber || !ifscCode) {
                throw new ApiError(
                    400,
                    "Account holder name, account number, and IFSC code are required"
                );
            }
            if (accountNumber.length < 8) {
                throw new ApiError(400, "Invalid account number");
            }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase())) {
                throw new ApiError(400, "Invalid IFSC code format");
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    payoutMethod: {
                        type,
                        upiId: type === "upi" ? upiId : undefined,
                        accountHolderName: type === "bank" ? accountHolderName : undefined,
                        accountNumber: type === "bank" ? accountNumber : undefined,
                        ifscCode: type === "bank" ? ifscCode.toUpperCase() : undefined,
                        bankName: type === "bank" ? bankName : undefined,
                        verified: false, // Mark for admin verification
                        updatedAt: new Date(),
                    },
                },
            },
            { new: true }
        ).select("payoutMethod");

        return reply
            .status(200)
            .send(
                new ApiResponse(200, user, "Payout method saved successfully")
            );
    }
);

// ============================================
// GET /delivery/payout/method
// Get current payout method
// ============================================
export const getPayoutMethod = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const user = await User.findById(req.user._id).select("payoutMethod");

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    user?.payoutMethod || null,
                    "Payout method fetched successfully"
                )
            );
    }
);

// ============================================
// DELETE /delivery/payout/:id — Cancel pending payout
// ============================================
export const cancelPayout = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const payout = await Payout.findOne({
            _id: id,
            partnerId: req.user._id,
            status: "pending",
        });

        if (!payout) {
            throw new ApiError(404, "Pending payout not found");
        }

        // Refund to wallet
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (wallet) {
            wallet.balance += payout.amount;
            await wallet.save();

            await WalletTransaction.create({
                user: req.user._id,
                type: "credit",
                amount: payout.amount,
                description: `Refund for cancelled withdrawal #${payout._id.toString().slice(-6)}`,
                balanceAfter: wallet.balance,
            });
        }

        payout.status = "cancelled";
        await payout.save();

        return reply
            .status(200)
            .send(
                new ApiResponse(200, payout, "Withdrawal cancelled and refunded")
            );
    }
);
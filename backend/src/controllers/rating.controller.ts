import { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// POST /orders/:id/rate-delivery
// Customer rates the delivery partner
// ============================================
export const rateDeliveryPartner = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;
        const { rating, tipAmount, comment } = req.body as any;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }

        // Find order
        const order = await Order.findOne({ orderId: id });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        // Ownership check — only the customer can rate
        if (order.user.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can only rate your own orders");
        }

        if (order.status !== "delivered") {
            throw new ApiError(400, "You can only rate delivered orders");
        }

        if (!order.deliveryPartner) {
            throw new ApiError(400, "No delivery partner assigned to this order");
        }

        // Check if already rated
        if (order.deliveryPartnerRating) {
            throw new ApiError(400, "You have already rated this delivery");
        }

        // Save rating
        order.deliveryPartnerRating = rating;
        if (tipAmount && tipAmount > 0) {
            order.tipAmount = tipAmount;
        }
        await order.save();

        // 🔥 Add tip to delivery partner's wallet
        if (tipAmount && tipAmount > 0) {
            const { Wallet } = await import("../models/Wallet.model.js");
            const { WalletTransaction } = await import(
                "../models/WalletTransaction.model.js"
            );

            let wallet = await Wallet.findOne({ user: order.deliveryPartner });
            if (!wallet) {
                wallet = await Wallet.create({
                    user: order.deliveryPartner,
                    balance: 0,
                });
            }

            wallet.balance += tipAmount;
            await wallet.save();

            await WalletTransaction.create({
                user: order.deliveryPartner,
                type: "credit",
                amount: tipAmount,
                description: `Tip from customer for order ${order.orderId}`,
                balanceAfter: wallet.balance,
            });

            // Update partner's total earnings
            await User.findByIdAndUpdate(order.deliveryPartner, {
                $inc: { totalEarnings: tipAmount },
            });

            console.log(`💰 ₹${tipAmount} tip credited to partner ${order.deliveryPartner}`);
        }

        // 🔥 Recalculate partner's average rating
        const partnerId = order.deliveryPartner;

        const ratingStats = await Order.aggregate([
            {
                $match: {
                    deliveryPartner: new mongoose.Types.ObjectId(partnerId.toString()),
                    deliveryPartnerRating: { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$deliveryPartnerRating" },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        if (ratingStats.length > 0) {
            const avgRating = Math.round(ratingStats[0].avgRating * 10) / 10;
            await User.findByIdAndUpdate(partnerId, { rating: avgRating });
            console.log(`⭐ Partner ${partnerId} rating updated to ${avgRating}`);
        }

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    order,
                    ratingSubmitted: rating,
                    tipAmount: tipAmount || 0,
                },
                "Rating submitted successfully"
            )
        );
    }
);

// ============================================
// GET /orders/:id/can-rate
// Check if customer can rate this order
// ============================================
export const canRateOrder = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const order = await Order.findOne({ orderId: id });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return reply.status(200).send(
                new ApiResponse(200, { canRate: false, reason: "Not your order" }, "")
            );
        }

        if (order.status !== "delivered") {
            return reply.status(200).send(
                new ApiResponse(200, { canRate: false, reason: "Order not delivered" }, "")
            );
        }

        if (order.deliveryPartnerRating) {
            return reply.status(200).send(
                new ApiResponse(200, { canRate: false, reason: "Already rated" }, "")
            );
        }

        return reply.status(200).send(
            new ApiResponse(200, { canRate: true }, "You can rate this order")
        );
    }
);
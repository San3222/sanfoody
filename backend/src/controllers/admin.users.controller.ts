import { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { Order } from "../models/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /admin/users — List all users
// ============================================
export const getAllUsers = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { role, search, status } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (role && role !== "all") {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        if (status === "active") {
            query.isActive = true;
        } else if (status === "blocked") {
            query.isActive = false;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        // Stats
        const [totalCustomers, totalRestaurants, totalDelivery, totalAdmins] =
            await Promise.all([
                User.countDocuments({ role: "customer" }),
                User.countDocuments({ role: "restaurant" }),
                User.countDocuments({ role: "delivery" }),
                User.countDocuments({ role: "admin" }),
            ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    users,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    stats: {
                        customers: totalCustomers,
                        restaurants: totalRestaurants,
                        delivery: totalDelivery,
                        admins: totalAdmins,
                    },
                },
                "Users fetched successfully"
            )
        );
    }
);

// ============================================
// PATCH /admin/users/:id/toggle-status
// ============================================
export const toggleUserStatus = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const user = await User.findById(id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Prevent admin from blocking themselves
        if (user._id.toString() === req.user._id.toString()) {
            throw new ApiError(400, "You cannot block yourself");
        }

        user.isActive = !user.isActive;
        await user.save();

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                },
                `User ${user.isActive ? "activated" : "blocked"}`
            )
        );
    }
);

// ============================================
// GET /admin/users/:id — User details
// ============================================
export const getUserById = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const user = await User.findById(id).select("-password");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Recent orders if customer
        let recentOrders: any[] = [];
        if (user.role === "customer") {
            recentOrders = await Order.find({ user: user._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select("orderId total status createdAt");
        }

        return reply.status(200).send(
            new ApiResponse(200, { user, recentOrders }, "User details fetched")
        );
    }
);


// ============================================
// PATCH /admin/users/:id/verify
// Approve restaurant/delivery verification
// ============================================
export const verifyUser = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const user = await User.findById(id);
        if (!user) throw new ApiError(404, "User not found");

        if (user.role === "restaurant" && user.restaurantDetails) {
            user.restaurantDetails.verificationStatus = "verified";
            user.restaurantDetails.verifiedAt = new Date();
            // 🔥 Ye line add karein
            user.markModified('restaurantDetails');
        } else if (user.role === "delivery" && user.deliveryDetails) {
            user.deliveryDetails.verificationStatus = "verified";
            user.deliveryDetails.verifiedAt = new Date();
            // 🔥 Ye line add karein
            user.markModified('deliveryDetails');
        } else {
            throw new ApiError(400, "User is not a restaurant or delivery partner");
        }

        await user.save();

        // 🔥 Send approval email
        try {
            const { sendEmail } = await import("../utils/email.js");
            const isRestaurant = user.role === "restaurant";
            await sendEmail({
                to: user.email,
                subject: isRestaurant
                    ? "🎉 Your restaurant is verified!"
                    : "🎉 You're verified!",
                html: `
          <h2>Congratulations ${user.name}!</h2>
          <p>Your ${isRestaurant ? "restaurant" : "delivery partner"} account has been <strong>verified</strong> by SanFoody.</p>
          <p>You can now log in and start ${isRestaurant ? "receiving orders" : "delivering orders"}.</p>
          <a href="http://localhost:5173/login" style="display:inline-block;padding:12px 24px;background:#E63946;color:white;text-decoration:none;border-radius:24px;margin-top:16px;">Log in now</a>
        `,
            });
        } catch (err) {
            console.error("Verification email failed:", err);
        }

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    {
                        _id: user._id,
                        name: user.name,
                        role: user.role,
                        verificationStatus: "verified",
                    },
                    "User verified successfully"
                )
            );
    }
);

// ============================================
// PATCH /admin/users/:id/reject
// Reject verification with reason
// ============================================
export const rejectUser = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;
        const { reason } = req.body as any;

        const user = await User.findById(id);
        if (!user) throw new ApiError(404, "User not found");

        if (user.role === "restaurant" && user.restaurantDetails) {
            user.restaurantDetails.verificationStatus = "rejected";
        } else if (user.role === "delivery" && user.deliveryDetails) {
            user.deliveryDetails.verificationStatus = "rejected";
        } else {
            throw new ApiError(400, "User is not a restaurant or delivery partner");
        }

        await user.save();

        // 🔥 Send rejection email
        try {
            const { sendEmail } = await import("../utils/email.js");
            await sendEmail({
                to: user.email,
                subject: "Verification Update — SanFoody",
                html: `
          <h2>Hi ${user.name},</h2>
          <p>We're unable to verify your account at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          <p>Please contact support@sanfoody.com for more information.</p>
        `,
            });
        } catch (err) {
            console.error("Rejection email failed:", err);
        }

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    {
                        _id: user._id,
                        name: user.name,
                        role: user.role,
                        verificationStatus: "rejected",
                        reason,
                    },
                    "User rejected"
                )
            );
    }
);

// ============================================
// PATCH /admin/users/:id/toggle-status (UPDATED)
// Already exists — verify it exists
// ============================================
// This already exists as toggleUserStatus — good.
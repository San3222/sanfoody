import { FastifyReply } from "fastify";
import { Restaurant } from "../models/Restaurant.model.js";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /admin/restaurants — List all restaurants
// ============================================
export const getAllRestaurants = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { search, verified } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (verified === "true") {
            query.isVerified = true;
        } else if (verified === "false") {
            query.isVerified = false;
        }

        const [restaurants, total] = await Promise.all([
            Restaurant.find(query)
                .populate("owner", "name email phone")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Restaurant.countDocuments(query),
        ]);

        const [verifiedCount, pendingCount] = await Promise.all([
            Restaurant.countDocuments({ isVerified: true }),
            Restaurant.countDocuments({ isVerified: false }),
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    restaurants,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    stats: {
                        verified: verifiedCount,
                        pending: pendingCount,
                    },
                },
                "Restaurants fetched successfully"
            )
        );
    }
);

// ============================================
// PATCH /admin/restaurants/:id/verify
// ============================================
export const verifyRestaurant = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        );

        if (!restaurant) {
            throw new ApiError(404, "Restaurant not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, restaurant, "Restaurant verified successfully"));
    }
);

// ============================================
// PATCH /admin/restaurants/:id/unverify
// ============================================
export const unverifyRestaurant = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { isVerified: false },
            { new: true }
        );

        if (!restaurant) {
            throw new ApiError(404, "Restaurant not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, restaurant, "Restaurant unverified"));
    }
);

// ============================================
// PATCH /admin/restaurants/:id/toggle-open
// ============================================
export const toggleRestaurantOpen = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            throw new ApiError(404, "Restaurant not found");
        }

        restaurant.isOpen = !restaurant.isOpen;
        await restaurant.save();

        return reply.status(200).send(
            new ApiResponse(
                200,
                restaurant,
                `Restaurant ${restaurant.isOpen ? "opened" : "closed"}`
            )
        );
    }
);

// ============================================
// GET /admin/restaurants/:id — Details
// ============================================
export const getRestaurantDetails = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const restaurant = await Restaurant.findById(id).populate(
            "owner",
            "name email phone"
        );

        if (!restaurant) {
            throw new ApiError(404, "Restaurant not found");
        }

        // Recent orders count
        const orderStats = await Order.aggregate([
            { $match: { restaurant: restaurant._id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    revenue: { $sum: "$total" },
                },
            },
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                { restaurant, orderStats },
                "Restaurant details fetched"
            )
        );
    }
);
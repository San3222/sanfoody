// backend/src/controllers/admin.orders.controller.ts
import { FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /admin/orders — All platform orders
// ============================================
export const getAllOrders = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { status, search } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } },
            ];
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "name email phone")
                .populate("restaurant", "name image address city")     // 🔥 Added city
                .populate("deliveryPartner", "name phone email"),        // 🔥 Added email
            Order.countDocuments(query),
        ]);

        // Status breakdown
        const statusBreakdown = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    orders,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    statusBreakdown: statusBreakdown.reduce(
                        (acc, s) => ({ ...acc, [s._id]: s.count }),
                        {}
                    ),
                },
                "Orders fetched successfully"
            )
        );
    }
);

// ============================================
// GET /admin/orders/:orderId — Full order details
// ============================================
export const getOrderDetails = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { orderId } = req.params as any;

        const order = await Order.findOne({ orderId })
            .populate("user", "name email phone address")
            .populate("restaurant", "name image address city phone")
            .populate(
                "deliveryPartner",
                "name phone email rating totalDeliveries vehicleType vehicleNumber"
            );

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order details fetched"));
    }
);
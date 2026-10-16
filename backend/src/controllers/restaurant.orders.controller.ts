import { FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getRestaurantForOwner } from "../utils/getRestaurantForOwner.js";
import { sendPushNotification } from "./push.controller.js";
import { Restaurant } from "../models/Restaurant.model.js";

// ============================================
// GET /restaurant/orders — Restaurant's orders
// Query params: status (optional), page, limit
// ============================================
export const getRestaurantOrders = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);

        const { status } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = { restaurant: restaurant._id };

        // Filter by status if provided
        if (status && status !== "all") {
            query.status = status;
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("user", "name email phone")
                .populate("deliveryPartner", "name phone"),
            Order.countDocuments(query),
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    orders,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                },
                "Orders fetched successfully"
            )
        );
    }
);

// ============================================
// GET /restaurant/orders/:id — Single order
// ============================================
export const getRestaurantOrderById = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        })
            .populate("user", "name email phone")
            .populate("deliveryPartner", "name phone currentLocation");

        if (!order) {
            throw new ApiError(404, "Order not found for this restaurant");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order fetched successfully"));
    }
);

// ============================================
// PATCH /restaurant/orders/:id/accept
// ============================================
export const acceptOrder = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;
        const { estimatedPrepTime } = req.body as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.status !== "pending") {
            throw new ApiError(400, `Cannot accept order in '${order.status}' status`);
        }

        order.status = "confirmed";
        order.acceptedAt = new Date();
        if (estimatedPrepTime) {
            order.estimatedPrepTime = estimatedPrepTime;
        }
        await order.save();

        // 🔥 Socket.io — notify customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "confirmed",
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Push notification to customer
        try {
            await sendPushNotification(
                order.user.toString(),
                "Order Confirmed ✅",
                `Your order from ${restaurant.name} has been accepted. Preparing now.`,
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order accepted successfully"));
    }
);

// ============================================
// PATCH /restaurant/orders/:id/reject
// ============================================
export const rejectOrder = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;
        const { reason } = req.body as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.status !== "pending") {
            throw new ApiError(400, `Cannot reject order in '${order.status}' status`);
        }

        order.status = "cancelled";
        order.rejectedAt = new Date();
        order.rejectionReason = reason || "Rejected by restaurant";
        order.refundAmount = order.total;
        await order.save();

        // 🔥 Socket.io — notify customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "cancelled",
                rejectionReason: order.rejectionReason,
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Push notification
        try {
            await sendPushNotification(
                order.user.toString(),
                "Order Cancelled ❌",
                `Your order was cancelled by the restaurant. Reason: ${order.rejectionReason}. Refund initiated.`,
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order rejected"));
    }
);

// ============================================
// PATCH /restaurant/orders/:id/preparing
// ============================================
export const markPreparing = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        });

        if (!order) throw new ApiError(404, "Order not found");
        if (order.status !== "confirmed") {
            throw new ApiError(400, `Cannot mark preparing from '${order.status}'`);
        }

        order.status = "preparing";
        order.preparedAt = new Date();
        await order.save();

        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "preparing",
                updatedAt: new Date().toISOString(),
            });
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order marked preparing"));
    }
);

// ============================================
// PATCH /restaurant/orders/:id/ready
// ============================================
export const markReady = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        });

        if (!order) throw new ApiError(404, "Order not found");
        if (order.status !== "preparing") {
            throw new ApiError(400, `Cannot mark ready from '${order.status}'`);
        }

        order.status = "ready";
        order.readyAt = new Date();
        await order.save();

        const io = (req.server as any).io;
        if (io) {
            // Notify customer
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "ready",
                updatedAt: new Date().toISOString(),
            });

            // 🔥 Broadcast to delivery pool (order is unassigned)
            if (!order.deliveryPartner) {
                io.to("delivery_pool").emit("order-ready-for-pickup", {
                    orderId: order.orderId,
                    restaurantName: restaurant.name,
                    pickupAddress: restaurant.address,
                    deliveryAddress: order.address,
                });
                console.log(`🔔 [Socket] Broadcast to delivery_pool for order ${order.orderId}`);
            } else {
                // Order was already assigned (edge case)
                io.to(`user_${order.deliveryPartner}`).emit("order-ready-for-pickup", {
                    orderId: order.orderId,
                    restaurantName: restaurant.name,
                    pickupAddress: restaurant.address,
                    deliveryAddress: order.address,
                });
                console.log(`🔔 [Socket] Notified partner ${order.deliveryPartner}`);
            }
        }

        // Push notification to customer
        try {
            await sendPushNotification(
                order.user.toString(),
                "Order Ready 🍽️",
                "Your food is ready and waiting for pickup by our delivery partner.",
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order marked ready"));
    }
);


// ============================================
// PATCH /restaurant/orders/:id/deliver
// 🔥 TEST ONLY — Restaurant marks order as delivered
// (In production, only delivery partner should do this)
// ============================================
export const markDelivered = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            restaurant: restaurant._id,
        });

        if (!order) throw new ApiError(404, "Order not found");
        if (order.status !== "ready") {
            throw new ApiError(400, `Cannot mark delivered from '${order.status}'`);
        }

        order.status = "delivered";
        order.deliveredAt = new Date();

        // COD order → mark as paid
        if (order.paymentMethod === "cod") {
            order.isPaid = true;
            order.paymentStatus = "paid";
        }

        await order.save();

        // Update restaurant stats
        await Restaurant.findByIdAndUpdate(restaurant._id, {
            $inc: {
                totalOrders: 1,
                totalRevenue: order.total,
            },
        });

        // 🔥 Socket.io — notify customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "delivered",
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Push notification
        try {
            await sendPushNotification(
                order.user.toString(),
                "Order Delivered ✅",
                "Your order has been delivered. Enjoy your meal!",
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order marked as delivered"));
    }
);
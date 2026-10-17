import { FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendPushNotification } from "./push.controller.js";
import { Wallet } from "../models/Wallet.model.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import { earnPoints } from "./loyalty.controller.js";
import { sendDeliveryAssignedEmail, sendOrderDeliveredEmail } from "../utils/email.js";

// ============================================
// HELPER: Check if partner is verified
// ============================================
const checkPartnerVerified = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 🔥 Verification Check
    const isVerified = user.deliveryDetails?.verificationStatus === 'verified';

    if (!isVerified) {
        throw new ApiError(403, "Your account is pending admin approval. You cannot perform this action yet.");
    }
    return user;
};

// ============================================
// GET /delivery/orders/available
// Ready orders waiting for pickup (unassigned)
// ============================================
export const getAvailableOrders = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        // 🔥 Check Verification First
        await checkPartnerVerified(req.user._id);

        const orders = await Order.find({
            status: "ready",
            deliveryPartner: null,
        })
            .sort({ readyAt: 1, createdAt: 1 })
            .limit(50)
            .populate("restaurant", "name image address location")
            .populate("user", "name phone");

        // Compute estimated earnings per order (80% of delivery fee)
        const ordersWithEarnings = orders.map((order) => {
            const obj = order.toObject() as any;
            return {
                ...obj,
                estimatedEarnings: Math.round(order.deliveryFee * 0.8),
            };
        });

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    ordersWithEarnings,
                    "Available orders fetched successfully"
                )
            );
    }
);

// ============================================
// GET /delivery/orders/my-deliveries
// Partner's active + past deliveries
// ============================================
export const getMyDeliveries = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { status } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = { deliveryPartner: req.user._id };

        // Active vs completed filter
        if (status === "active") {
            query.status = { $in: ["ready", "out-for-delivery"] };
        } else if (status === "completed") {
            query.status = "delivered";
        }

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("restaurant", "name image address location")
                .populate("user", "name phone address"),
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
                "Deliveries fetched successfully"
            )
        );
    }
);

// ============================================
// GET /delivery/orders/:id — Single delivery
// ============================================
export const getDeliveryById = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            deliveryPartner: req.user._id,
        })
            .populate("restaurant", "name image address location phone")
            .populate("user", "name phone address");

        if (!order) {
            throw new ApiError(404, "Delivery not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Delivery fetched successfully"));
    }
);

// ============================================
// PATCH /delivery/orders/:id/accept
// Partner accepts an order from the pool
// ============================================
export const acceptDeliveryOrder = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        // 🔥 Check Verification First
        await checkPartnerVerified(req.user._id);

        const { id } = req.params as any;

        const order = await Order.findOne({ orderId: id });

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        if (order.status !== "ready") {
            throw new ApiError(400, `Order is not ready for pickup (${order.status})`);
        }

        if (order.deliveryPartner) {
            throw new ApiError(400, "Order already assigned to another partner");
        }

        // Assign to partner
        order.deliveryPartner = req.user._id;
        const earnings = Math.round(order.deliveryFee * 0.8);
        order.deliveryEarnings = earnings;
        await order.save();

        // Increase partner's load
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { currentLoad: 1 },
        });

        // 🔥 Socket.io — notify restaurant + customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: order.status,
                deliveryPartner: {
                    _id: req.user._id,
                    name: req.user.name,
                    phone: req.user.phone,
                },
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Email: Delivery Partner Assigned
        try {
            const customer = await User.findById(order.user);
            if (customer) {
                sendDeliveryAssignedEmail({
                    email: customer.email,
                    customerName: customer.name,
                    orderId: order.orderId,
                    deliveryPartnerName: req.user.name,
                    deliveryPartnerPhone: req.user.phone,
                }).catch((err) => console.error("Delivery assigned email failed:", err));
            }
        } catch (err) {
            console.error("Failed to fetch customer for email:", err);
        }

        // 🔥 Notify customer via push
        try {
            await sendPushNotification(
                order.user.toString(),
                "🚴 Delivery Partner Assigned",
                `${req.user.name} will pick up your order soon.`,
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    { order, earnings },
                    "Order accepted successfully"
                )
            );
    }
);

// ============================================
// PATCH /delivery/orders/:id/picked-up
// Partner picked up from restaurant
// ============================================
export const markPickedUp = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            deliveryPartner: req.user._id,
        });

        if (!order) {
            throw new ApiError(404, "Delivery not found");
        }

        if (order.status !== "ready") {
            throw new ApiError(400, `Cannot mark picked up from '${order.status}'`);
        }

        order.status = "out-for-delivery";
        order.pickedUpAt = new Date();
        order.deliveryStartedAt = new Date();
        await order.save();

        // 🔥 Socket.io — notify restaurant + customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "out-for-delivery",
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Push to customer
        try {
            await sendPushNotification(
                order.user.toString(),
                "🚴 Out for Delivery",
                "Your order is on the way!",
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, order, "Order marked as picked up"));
    }
);

// ============================================
// PATCH /delivery/orders/:id/delivered
// Partner completed the delivery
// ============================================
export const markDelivered = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const order = await Order.findOne({
            orderId: id,
            deliveryPartner: req.user._id,
        });

        if (!order) {
            throw new ApiError(404, "Delivery not found");
        }

        if (order.status !== "out-for-delivery") {
            throw new ApiError(400, `Cannot mark delivered from '${order.status}'`);
        }

        order.status = "delivered";
        order.deliveredAt = new Date();
        order.deliveryCompletedAt = new Date();

        // COD → mark paid
        if (order.paymentMethod === "cod") {
            order.isPaid = true;
            order.paymentStatus = "paid";
        }

        await order.save();

        // Update partner stats
        const deliveryEarnings = order.deliveryEarnings || Math.round(order.deliveryFee * 0.8);
        const tipAmount = order.tipAmount || 0;
        const totalEarnings = deliveryEarnings + tipAmount;

        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                currentLoad: -1,
                totalDeliveries: 1,
                totalEarnings: totalEarnings,
            },
        });

        // 🔥 Credit delivery partner's wallet
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = await Wallet.create({ user: req.user._id, balance: 0 });
        }

        wallet.balance += totalEarnings;
        await wallet.save();

        // 🔥 Log wallet transaction
        await WalletTransaction.create({
            user: req.user._id,
            type: "credit",
            amount: totalEarnings,
            description: `Delivery earnings for order ${order.orderId}${tipAmount > 0 ? ` (incl. ₹${tipAmount} tip)` : ""}`,
            balanceAfter: wallet.balance,
        });

        console.log(`💰 ₹${totalEarnings} credited to wallet (delivery: ₹${deliveryEarnings}, tip: ₹${tipAmount})`);

        // 🔥 Email: Order Delivered + Rating CTA
        try {
            const customer = await User.findById(order.user);
            const restaurant = await Restaurant.findById(order.restaurant);
            if (customer && restaurant) {
                sendOrderDeliveredEmail({
                    email: customer.email,
                    customerName: customer.name,
                    orderId: order.orderId,
                    restaurantName: restaurant.name,
                    total: order.total,
                    ratingUrl: `http://localhost:5173/order/${order.orderId}`,
                }).catch((err) => console.error("Order delivered email failed:", err));
            }
        } catch (err) {
            console.error("Failed to send delivered email:", err);
        }

        // 🔥 Award loyalty points to CUSTOMER
        try {
            const pointsEarned = await earnPoints(
                order.user.toString(),
                order.total,
                order.orderId
            );
            console.log(`⭐ ${pointsEarned} loyalty points awarded to customer ${order.user}`);
        } catch (err) {
            console.error("Loyalty points award failed:", err);
        }

        // 🔥 Socket.io — notify restaurant + customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`order_${order.orderId}`).emit("order-status-update", {
                orderId: order.orderId,
                status: "delivered",
                updatedAt: new Date().toISOString(),
            });
        }

        // 🔥 Push to customer
        try {
            await sendPushNotification(
                order.user.toString(),
                "✅ Order Delivered",
                "Your order has been delivered. Enjoy!",
                `/order/${order.orderId}`
            );
        } catch (err) {
            console.error("Push notification failed:", err);
        }

        return reply
            .status(200)
            .send(
                new ApiResponse(
                    200,
                    { order, earnings: totalEarnings },
                    "Order delivered successfully"
                )
            );
    }
);

// ============================================
// GET /delivery/stats — Partner dashboard stats
// ============================================
export const getDeliveryStats = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const userId = req.user._id;

        // Today's date range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const [
            activeDeliveries,
            todayCompleted,
            todayEarningsAgg,
            user,
        ] = await Promise.all([
            Order.countDocuments({
                deliveryPartner: userId,
                status: { $in: ["ready", "out-for-delivery"] },
            }),
            Order.countDocuments({
                deliveryPartner: userId,
                status: "delivered",
                deliveredAt: { $gte: todayStart, $lte: todayEnd },
            }),
            Order.aggregate([
                {
                    $match: {
                        deliveryPartner: userId,
                        status: "delivered",
                        deliveredAt: { $gte: todayStart, $lte: todayEnd },
                    },
                },
                { $group: { _id: null, total: { $sum: "$deliveryEarnings" } } },
            ]),
            User.findById(userId).select(
                "name email phone status totalDeliveries totalEarnings rating vehicleType vehicleNumber deliveryDetails isVerified"
            ),
        ]);

        const todayEarnings = todayEarningsAgg[0]?.total || 0;

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    partner: user,
                    today: {
                        completed: todayCompleted,
                        earnings: todayEarnings,
                    },
                    active: activeDeliveries,
                },
                "Delivery stats fetched successfully"
            )
        );
    }
);

// ============================================
// POST /delivery/status — Toggle online/offline
// ============================================
export const toggleOnlineStatus = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        // 🔥 SECURITY CHECK: Only verified partners can toggle status
        const userDoc = (await User.findById(req.user._id)) as any;

        const isVerified =
            userDoc?.deliveryDetails?.verificationStatus === "verified" ||
            userDoc?.isVerified === true;

        if (!isVerified) {
            throw new ApiError(
                403,
                "Your account is pending admin approval. You cannot go online."
            );
        }

        const { status } = req.body as any;

        if (!status || !["online", "offline", "busy"].includes(status)) {
            throw new ApiError(400, "Status must be online, offline, or busy");
        }

        // Don't allow going offline if active deliveries exist
        if (status === "offline") {
            const activeCount = await Order.countDocuments({
                deliveryPartner: req.user._id,
                status: { $in: ["ready", "out-for-delivery"] },
            });

            if (activeCount > 0) {
                throw new ApiError(
                    400,
                    `Cannot go offline — ${activeCount} active deliver${activeCount > 1 ? "ies" : "y"} pending`
                );
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { status },
            { new: true }
        ).select("name email status");

        return reply
            .status(200)
            .send(new ApiResponse(200, user, `Status updated to ${status}`));
    }
);
import { FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /admin/dashboard — Real dashboard stats
// ============================================
export const getDashboardStats = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        // Today's range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // This month's range
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalRestaurants,
            totalOrders,
            todayOrders,
            todayRevenueAgg,
            monthRevenueAgg,
            pendingOrders,
            activeRestaurants,
        ] = await Promise.all([
            User.countDocuments({ role: "customer" }),
            Restaurant.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({
                createdAt: { $gte: todayStart, $lte: todayEnd },
            }),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: todayStart, $lte: todayEnd },
                        status: { $ne: "cancelled" },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: monthStart },
                        status: { $ne: "cancelled" },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.countDocuments({ status: "pending" }),
            Restaurant.countDocuments({ isOpen: true }),
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    users: totalUsers,
                    restaurants: totalRestaurants,
                    orders: totalOrders,
                    today: {
                        orders: todayOrders,
                        revenue: todayRevenueAgg[0]?.total || 0,
                    },
                    thisMonth: {
                        revenue: monthRevenueAgg[0]?.total || 0,
                    },
                    pending: pendingOrders,
                    activeRestaurants,
                },
                "Dashboard stats fetched"
            )
        );
    }
);

// ============================================
// GET /admin/analytics — Platform-wide analytics
// ============================================
export const getPlatformAnalytics = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const days = parseInt((req.query as any).days) || 30;

        const since = new Date();
        since.setDate(since.getDate() - days + 1);
        since.setHours(0, 0, 0, 0);

        // Daily revenue trend
        const dailyTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: since },
                    status: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        // Top restaurants by revenue
        const topRestaurants = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: since },
                    status: "delivered",
                },
            },
            {
                $group: {
                    _id: "$restaurant",
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "_id",
                    foreignField: "_id",
                    as: "restaurant",
                },
            },
            { $unwind: "$restaurant" },
            {
                $project: {
                    _id: 1,
                    revenue: 1,
                    orders: 1,
                    name: "$restaurant.name",
                    image: "$restaurant.image",
                },
            },
        ]);

        // Order status breakdown
        const statusBreakdown = await Order.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // User growth
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: since } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    dailyTrend: dailyTrend.map((d) => ({
                        date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
                        revenue: d.revenue,
                        orders: d.orders,
                    })),
                    topRestaurants,
                    statusBreakdown: statusBreakdown.reduce(
                        (acc, s) => ({ ...acc, [s._id]: s.count }),
                        {}
                    ),
                    userGrowth: userGrowth.map((u) => ({
                        date: `${u._id.year}-${String(u._id.month).padStart(2, "0")}-${String(u._id.day).padStart(2, "0")}`,
                        count: u.count,
                    })),
                },
                "Analytics fetched"
            )
        );
    }
);
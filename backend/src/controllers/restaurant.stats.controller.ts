import { FastifyReply } from "fastify";
import mongoose from "mongoose";
import { Restaurant } from "../models/Restaurant.model.js";
import { Order } from "../models/Order.model.js";
import { MenuItem } from "../models/MenuItem.model.js";
import { Review } from "../models/Review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getRestaurantForOwner } from "../utils/getRestaurantForOwner.js";

// ============================================
// GET /restaurant/stats — Dashboard stats
// ============================================
export const getRestaurantStats = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);

    // Today's date range (00:00 to 23:59)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Parallel queries for speed
    const [
      todayOrders,
      todayRevenueAgg,
      menuItemsCount,
      pendingCount,
      activeCount,
      completedCount,
      reviewAgg,
    ] = await Promise.all([
      // Today's order count
      Order.countDocuments({
        restaurant: restaurant._id,
        createdAt: { $gte: todayStart, $lte: todayEnd },
      }),

      // Today's revenue (from non-cancelled orders)
      Order.aggregate([
        {
          $match: {
            restaurant: restaurant._id,
            createdAt: { $gte: todayStart, $lte: todayEnd },
            status: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Menu items count
      MenuItem.countDocuments({ restaurantId: restaurant._id }),

      // Pending orders
      Order.countDocuments({
        restaurant: restaurant._id,
        status: "pending",
      }),

      // Active orders (confirmed/preparing/ready/out-for-delivery)
      Order.countDocuments({
        restaurant: restaurant._id,
        status: { $in: ["confirmed", "preparing", "ready", "out-for-delivery"] },
      }),

      // Lifetime completed orders
      Order.countDocuments({
        restaurant: restaurant._id,
        status: "delivered",
      }),

      // Average rating + count
      Review.aggregate([
        { $match: { restaurantId: restaurant._id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    const reviewData = reviewAgg[0] || { avgRating: 0, count: 0 };

    return reply.status(200).send(
      new ApiResponse(
        200,
        {
          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            image: restaurant.image,
            isOpen: restaurant.isOpen,
            isAcceptingOrders: restaurant.availability?.isAcceptingOrders ?? true,
          },
          today: {
            orders: todayOrders,
            revenue: todayRevenue,
          },
          menu: {
            totalItems: menuItemsCount,
          },
          orders: {
            pending: pendingCount,
            active: activeCount,
            completed: completedCount,
          },
          reviews: {
            averageRating: Math.round((reviewData.avgRating || 0) * 10) / 10,
            totalReviews: reviewData.count || 0,
          },
        },
        "Restaurant stats fetched successfully"
      )
    );
  }
);

// ============================================
// GET /restaurant/profile — Restaurant info
// ============================================
export const getRestaurantProfile = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);

    return reply
      .status(200)
      .send(new ApiResponse(200, restaurant, "Restaurant profile fetched"));
  }
);

// ============================================
// GET /restaurant/analytics — Revenue chart data
// ============================================
export const getRestaurantAnalytics = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);

    // Last 7 days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTrend = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          createdAt: { $gte: sevenDaysAgo },
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

    // Top selling items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topItems = await Order.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
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
          topItems: topItems.map((i) => ({
            name: i._id,
            quantity: i.totalQuantity,
            revenue: i.totalRevenue,
          })),
        },
        "Analytics fetched successfully"
      )
    );
  }
);

// ============================================
// GET /restaurant/reviews — Recent reviews
// ============================================
export const getRestaurantReviews = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);

    const page = parseInt((req.query as any).page) || 1;
    const limit = parseInt((req.query as any).limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ restaurantId: restaurant._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar"),
      Review.countDocuments({ restaurantId: restaurant._id }),
    ]);

    return reply.status(200).send(
      new ApiResponse(
        200,
        {
          reviews,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
        "Reviews fetched successfully"
      )
    );
  }
);





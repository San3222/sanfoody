import { FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /delivery/earnings
// Earnings summary + payout history (daily)
// ============================================
export const getEarnings = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const userId = req.user._id;

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [user, dailyEarnings, lifetimeAgg] = await Promise.all([
      User.findById(userId).select("totalEarnings totalDeliveries"),

      // Daily earnings aggregation
      Order.aggregate([
        {
          $match: {
            deliveryPartner: userId,
            status: "delivered",
            deliveredAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$deliveredAt" },
              month: { $month: "$deliveredAt" },
              day: { $dayOfMonth: "$deliveredAt" },
            },
            deliveries: { $sum: 1 },
            earnings: { $sum: "$deliveryEarnings" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 30 },
      ]),

      // Lifetime totals
      Order.aggregate([
        {
          $match: {
            deliveryPartner: userId,
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$deliveryEarnings" },
            totalDeliveries: { $sum: 1 },
          },
        },
      ]),
    ]);

    const lifetime = lifetimeAgg[0] || { totalEarnings: 0, totalDeliveries: 0 };

    return reply.status(200).send(
      new ApiResponse(
        200,
        {
          summary: {
            totalEarnings: lifetime.totalEarnings,
            totalDeliveries: lifetime.totalDeliveries,
            avgPerDelivery:
              lifetime.totalDeliveries > 0
                ? Math.round(lifetime.totalEarnings / lifetime.totalDeliveries)
                : 0,
          },
          daily: dailyEarnings.map((d) => ({
            date: `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
            deliveries: d.deliveries,
            earnings: d.earnings,
          })),
        },
        "Earnings fetched successfully"
      )
    );
  }
);

// ============================================
// PATCH /delivery/location
// Already exists in delivery.controller.ts ✅
// ============================================
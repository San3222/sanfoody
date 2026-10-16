import { FastifyRequest, FastifyReply } from "fastify";
import { Coupon } from "../models/Coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get All Active Coupons
export const getCoupons = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const coupons = await Coupon.find({ isActive: true, validUntil: { $gt: new Date() } });

    return reply
      .status(200)
      .send(new ApiResponse(200, coupons, "Coupons fetched successfully"));
  }
);

// Apply Coupon
// Apply Coupon
export const applyCoupon = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { couponCode, orderTotal } = req.body as any;

    if (!couponCode) {
      throw new ApiError(400, "Coupon code is required");
    }

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true, validUntil: { $gt: new Date() } });

    if (!coupon) {
      throw new ApiError(404, "Invalid or expired coupon");
    }

    if (orderTotal < coupon.minOrder) {
      throw new ApiError(400, `Minimum order of ₹${coupon.minOrder} required`);
    }

    const discount = Math.min(
      (orderTotal * coupon.discountPercent) / 100,
      coupon.maxDiscount
    );

    return reply
      .status(200)
      .send(new ApiResponse(200, { couponCode, discount }, "Coupon applied successfully"));
  }
);
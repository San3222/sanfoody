import { FastifyRequest, FastifyReply } from "fastify";
import * as crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "../config/env.js";
import { Order } from "../models/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createRazorpayOrder = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { amount, currency = "INR", receipt } = req.body as any;

    if (!amount || amount <= 0) {
      throw new ApiError(400, "Invalid amount");
    }

    try {
      const options = {
        amount: amount * 100, // Razorpay amount in paise (₹1 = 100 paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);

      return reply
        .status(200)
        .send(new ApiResponse(200, order, "Razorpay order created successfully"));
    } catch (error) {
      throw new ApiError(500, "Failed to create Razorpay order");
    }
  }
);

// Verify Payment Signature
export const verifyPayment = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as any;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(400, "Missing payment verification data");
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        throw new ApiError(400, "Invalid payment signature");
      }

      return reply
        .status(200)
        .send(new ApiResponse(200, { verified: true }, "Payment verified successfully"));
    } catch (error) {
      throw new ApiError(400, "Invalid payment signature");
    }
  }
);
import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User.model.js";
import { Order } from "../models/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Update Delivery Partner Location
export const updateDeliveryLocation = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { orderId, latitude, longitude } = req.body as any;

    if (!orderId || latitude === undefined || longitude === undefined) {
      throw new ApiError(400, "Order ID, latitude and longitude are required");
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Delivery partner ki location update karo
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: { latitude, longitude },
      lastLocationUpdate: new Date(),
    });

    // 🔥 Socket.io se customer ko location bhejo
    const io = (req.server as any).io;
    if (io) {
      io.to(`order_${orderId}`).emit("delivery-location-update", {
        orderId,
        latitude,
        longitude,
        updatedAt: new Date().toISOString(),
      });
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, { latitude, longitude }, "Location updated successfully"));
  }
);

// Get Delivery Partner Location
export const getDeliveryLocation = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { orderId } = req.params as any;

    const order = await Order.findOne({ orderId }).populate(
      "deliveryPartner",
      "name phone currentLocation"
    );

    if (!order || !order.deliveryPartner) {
      throw new ApiError(404, "Delivery partner not assigned");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, order.deliveryPartner, "Location fetched successfully"));
  }
);
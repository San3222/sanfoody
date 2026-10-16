import { FastifyRequest, FastifyReply } from "fastify";
import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const getNotifications = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    return reply
      .status(200)
      .send(new ApiResponse(200, { notifications, unreadCount }, "Notifications fetched successfully"));
  }
);

export const markNotificationAsRead = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return reply.status(200).send(new ApiResponse(200, {}, "Notification marked as read"));
  }
);

export const markAllNotificationsAsRead = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    await Notification.updateMany({ userId: req.user._id }, { isRead: true });
    return reply.status(200).send(new ApiResponse(200, {}, "All notifications marked as read"));
  }
);
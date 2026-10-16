import { FastifyRequest, FastifyReply } from "fastify";
// @ts-expect-error Missing declaration file for the JavaScript package.
import webpush from "web-push";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { env } from "../config/env.js";

webpush.setVapidDetails(
    env.VAPID_EMAIL,          // ✅ No more casts
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
);

// Save Push Subscription
export const savePushSubscription = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { subscription } = req.body as any;

        if (!subscription) {
            throw new ApiError(400, "Subscription is required");
        }

        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: subscription,
        });

        return reply
            .status(200)
            .send(new ApiResponse(200, {}, "Push subscription saved"));
    }
);

// Send Push Notification
export const sendPushNotification = async (
    userId: string,
    title: string,
    body: string,
    url?: string
) => {
    const user = await User.findById(userId);

    const pushSubscription = (
        user as typeof user & { pushSubscription?: unknown }
    )?.pushSubscription;

    if (!pushSubscription) return;

    try {
        await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({ title, body, url })
        );
    } catch (error) {
        console.error("Push notification failed:", error);
    }
};
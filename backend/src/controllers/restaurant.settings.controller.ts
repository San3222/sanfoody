import { FastifyReply } from "fastify";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getRestaurantForOwner } from "../utils/getRestaurantForOwner.js"; 

// ============================================
// PATCH /restaurant/settings — Update profile/settings
// ============================================
export const updateRestaurantSettings = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);

        const allowedUpdates = [
            "name",
            "description",
            "image",
            "cuisine",
            "address",
            "deliveryTime",
            "priceRange",
            "isVeg",
            "deliveryFee",
            "minOrderValue",
            "availability",
            "prepTimeMinutes",
        ];

        const updates: any = {};
        for (const key of allowedUpdates) {
            if ((req.body as any)[key] !== undefined) {
                updates[key] = (req.body as any)[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            throw new ApiError(400, "No valid fields to update");
        }

        const updated = await Restaurant.findByIdAndUpdate(
            restaurant._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return reply
            .status(200)
            .send(new ApiResponse(200, updated, "Settings updated successfully"));
    }
);

// ============================================
// PATCH /restaurant/availability — Quick toggle
// ============================================
export const toggleAvailability = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const restaurant = await getRestaurantForOwner(req);
        const { isAcceptingOrders, isOpen } = req.body as any;

        const updates: any = {};

        if (typeof isAcceptingOrders === "boolean") {
            updates["availability.isAcceptingOrders"] = isAcceptingOrders;
        }

        if (typeof isOpen === "boolean") {
            updates.isOpen = isOpen;
        }

        if (Object.keys(updates).length === 0) {
            throw new ApiError(400, "Provide isAcceptingOrders or isOpen");
        }

        const updated = await Restaurant.findByIdAndUpdate(
            restaurant._id,
            { $set: updates },
            { new: true }
        );

        return reply
            .status(200)
            .send(new ApiResponse(200, updated, "Availability updated"));
    }
);
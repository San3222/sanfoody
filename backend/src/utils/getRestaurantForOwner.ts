import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// 🔥 SHARED HELPER — Get restaurant doc for logged-in owner
export async function getRestaurantForOwner(req: AuthRequest) {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    throw new ApiError(404, "No restaurant found for this owner. Please contact support.");
  }

  return restaurant;
}
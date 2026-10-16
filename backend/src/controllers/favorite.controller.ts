import { FastifyRequest, FastifyReply } from "fastify";
import { Favorite } from "../models/Favorite.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Get User Favorites
export const getFavorites = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const favorites = await Favorite.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    // Fetch actual data for each favorite
    const populatedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        if (fav.itemType === 'restaurant') {
          const restaurant = await Restaurant.findById(fav.itemId);
          return { ...fav.toObject(), data: restaurant };
        } else if (fav.itemType === 'food') {
          const food = await MenuItem.findById(fav.itemId);
          return { ...fav.toObject(), data: food };
        }
        return { ...fav.toObject(), data: null };
      })
    );

    return reply
      .status(200)
      .send(new ApiResponse(200, populatedFavorites, "Favorites fetched successfully"));
  }
);

// Toggle Favorite
export const toggleFavorite = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { itemType, itemId } = req.body as any;

    if (!itemType || !itemId) {
      throw new ApiError(400, "Item type and ID are required");
    }

    const existing = await Favorite.findOne({ userId: req.user._id, itemType, itemId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return reply
        .status(200)
        .send(new ApiResponse(200, { isFavorite: false }, "Removed from favorites"));
    }

    const newFavorite = await Favorite.create({
      userId: req.user._id,
      itemType,
      itemId,
    });

    return reply
      .status(201)
      .send(new ApiResponse(201, { isFavorite: true }, "Added to favorites"));
  }
);

// Check if Item is Favorite
export const isFavorite = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { itemType, itemId } = req.query as any;

    if (!itemType || !itemId) {
      throw new ApiError(400, "Item type and ID are required");
    }

    const favorite = await Favorite.findOne({ userId: req.user._id, itemType, itemId });

    return reply
      .status(200)
      .send(new ApiResponse(200, { isFavorite: !!favorite }, "Favorite status fetched"));
  }
);

// Remove Favorite
export const removeFavorite = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { itemType, itemId } = req.body as any;

    const favorite = await Favorite.findOneAndDelete({ userId: req.user._id, itemType, itemId });

    if (!favorite) {
      throw new ApiError(404, "Favorite not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "Favorite removed successfully"));
  }
);
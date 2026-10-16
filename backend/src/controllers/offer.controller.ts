import { FastifyRequest, FastifyReply } from "fastify";
import { Offer } from "../models/Offer.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get All Active Offers
export const getAllOffers = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const offers = await Offer.find({ isActive: true, validUntil: { $gt: new Date() } })
      .populate("restaurantId", "name image cuisine rating deliveryTime priceRange")
      .sort({ createdAt: -1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, offers, "Offers fetched successfully"));
  }
);

// Get Offer by ID
export const getOfferById = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const offer = await Offer.findById(id).populate(
      "restaurantId",
      "name image cuisine rating deliveryTime priceRange"
    );

    if (!offer) {
      throw new ApiError(404, "Offer not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, offer, "Offer fetched successfully"));
  }
);

// Get Offers by Restaurant
export const getOffersByRestaurant = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { restaurantId } = req.params as any;
    const offers = await Offer.find({
      restaurantId,
      isActive: true,
      validUntil: { $gt: new Date() },
    });

    return reply
      .status(200)
      .send(new ApiResponse(200, offers, "Offers fetched successfully"));
  }
);
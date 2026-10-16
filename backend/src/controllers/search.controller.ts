import { FastifyRequest, FastifyReply } from "fastify";
import { Restaurant } from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItem.model.js";
import { Offer } from "../models/Offer.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Full-Text Search
export const searchAll = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { q, type } = req.query as any;

    if (!q || q.trim() === '') {
      return reply.status(200).send(new ApiResponse(200, [], "No search query provided"));
    }

    const searchTerm = q.trim();

    // 🔥 Search Results
    const results: any = {
      restaurants: [],
      menuItems: [],
      offers: [],
    };

    // 1. Restaurants Search
    if (!type || type === 'restaurants') {
      const restaurants = await Restaurant.find({
        $text: { $search: searchTerm },
      })
        .limit(10)
        .select('name cuisine image rating deliveryTime priceRange');

      results.restaurants = restaurants;
    }

    // 2. Menu Items Search
    if (!type || type === 'menu') {
      const menuItems = await MenuItem.find({
        $text: { $search: searchTerm },
      })
        .limit(10)
        .populate('restaurantId', 'name image')
        .select('name description price image restaurantId');

      results.menuItems = menuItems;
    }

    // 3. Offers Search
    if (!type || type === 'offers') {
      const offers = await Offer.find({
        $text: { $search: searchTerm },
      })
        .limit(10)
        .populate('restaurantId', 'name image')
        .select('title description couponCode discountPercent restaurantId');

      results.offers = offers;
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, results, "Search results fetched successfully"));
  }
);
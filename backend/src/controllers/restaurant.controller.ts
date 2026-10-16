import { FastifyRequest, FastifyReply } from "fastify";
import { Restaurant } from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get All Restaurants
export const getAllRestaurants = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { cuisine, priceRange, rating, search, city } = req.query as any;

    const query: any = {};

    // 🔥 City filter — default to Mumbai if not specified
    if (city) {
      query.city = city;
    } else {
      query.city = "Mumbai";  // fallback
    }

    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    if (priceRange) {
      query.priceRange = priceRange;
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const restaurants = await Restaurant.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(50);

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          restaurants,
          `Restaurants in ${city || "Mumbai"} fetched successfully`
        )
      );
  }
);

// Get Restaurant by ID
export const getRestaurantById = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const restaurant = await Restaurant.findById(id).populate(
      "owner",
      "name email phone"
    );

    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, restaurant, "Restaurant fetched successfully"));
  }
);

// Get Restaurant Menu
export const getRestaurantMenu = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const menuItems = await MenuItem.find({
      restaurantId: id,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, menuItems, "Restaurant menu fetched successfully"));
  }
);

// Get Nearby Restaurants
export const getNearbyRestaurants = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { lat, lng } = req.query as any;

    if (!lat || !lng) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000, // 5 km
        },
      },
    });

    return reply
      .status(200)
      .send(new ApiResponse(200, restaurants, "Nearby restaurants fetched"));
  }
);



// ============================================
// GET /restaurants/cities — List available cities
// ============================================
export const getAvailableCities = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const cities = await Restaurant.aggregate([
      { $match: { isOpen: true } },
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const cityList = cities.map((c) => ({
      name: c._id,
      restaurantCount: c.count,
    }));

    return reply
      .status(200)
      .send(new ApiResponse(200, cityList, "Cities fetched successfully"));
  }
);
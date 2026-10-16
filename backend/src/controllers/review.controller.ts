import { FastifyRequest, FastifyReply } from "fastify";
import { Review } from "../models/Review.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Get All Reviews for a Restaurant
export const getRestaurantReviews = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { restaurantId } = req.params as any;
    
    // Pagination
    const page = parseInt((req.query as any).page) || 1;
    const limit = parseInt((req.query as any).limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ restaurantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar");

    const total = await Review.countDocuments({ restaurantId });

    return reply
      .status(200)
      .send(new ApiResponse(200, {
        reviews,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }, "Reviews fetched successfully"));
  }
);

// Get Review by ID
export const getReviewById = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const review = await Review.findById(id).populate("userId", "name avatar");

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, review, "Review fetched successfully"));
  }
);

// Create Review
export const createReview = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { restaurantId, orderId, rating, title, comment, images } = req.body as any;

    if (!restaurantId || !rating || !title || !comment) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      userId: req.user._id,
      restaurantId,
    });

    if (existingReview) {
      throw new ApiError(400, "You have already reviewed this restaurant");
    }

    const review = await Review.create({
      userId: req.user._id,
      restaurantId,
      orderId,
      rating,
      title,
      comment,
      images,
    });

    // Update restaurant rating
    const allReviews = await Review.find({ restaurantId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    return reply
      .status(201)
      .send(new ApiResponse(201, review, "Review created successfully"));
  }
);

// Update Review
export const updateReview = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const { rating, title, comment, images } = req.body as any;

    const review = await Review.findOne({ _id: id, userId: req.user._id });

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, title, comment, images },
      { new: true }
    );

    return reply
      .status(200)
      .send(new ApiResponse(200, updatedReview, "Review updated successfully"));
  }
);

// Delete Review
export const deleteReview = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const review = await Review.findOne({ _id: id, userId: req.user._id });

    if (!review) {
      throw new ApiError(404, "Review not found");
    }

    await Review.findByIdAndDelete(id);

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "Review deleted successfully"));
  }
);

// Get User's Reviews
export const getUserReviews = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("restaurantId", "name image");

    return reply
      .status(200)
      .send(new ApiResponse(200, reviews, "User reviews fetched successfully"));
  }
);
import { FastifyRequest, FastifyReply } from "fastify";
import { Category } from "../models/Category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get All Categories
export const getCategories = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, categories, "Categories fetched successfully"));
  }
);
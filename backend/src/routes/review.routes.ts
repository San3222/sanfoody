import { FastifyInstance } from "fastify";
import {
  getRestaurantReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function reviewRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/user", getUserReviews);
  fastify.get("/:id", getReviewById);
  fastify.get("/restaurant/:restaurantId", getRestaurantReviews);
  fastify.post("/", createReview);
  fastify.patch("/:id", updateReview);
  fastify.delete("/:id", deleteReview);
}
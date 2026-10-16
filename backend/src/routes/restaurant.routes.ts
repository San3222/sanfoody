import { FastifyInstance } from "fastify";
import {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantMenu,
  getNearbyRestaurants,
  getAvailableCities,
} from "../controllers/restaurant.controller.js";

export default async function restaurantRoutes(fastify: FastifyInstance) {
  // 🔥 ONLY public customer routes here
  fastify.get("/", getAllRestaurants);
  fastify.get("/cities", getAvailableCities);
  fastify.get("/nearby", getNearbyRestaurants);
  fastify.get("/:id", getRestaurantById);
  fastify.get("/:id/menu", getRestaurantMenu);
}
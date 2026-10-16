import { FastifyInstance } from "fastify";
import {
  getAllMenuItems,
  getMenuByRestaurant,
  searchMenuItems,
} from "../controllers/menu.controller.js";

export default async function menuRoutes(fastify: FastifyInstance) {
  // 🔥 Only public menu routes here
  fastify.get("/", getAllMenuItems);
  fastify.get("/search", searchMenuItems);
  fastify.get("/:restaurantId", getMenuByRestaurant);
}
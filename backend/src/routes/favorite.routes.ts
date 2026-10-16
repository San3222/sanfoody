import { FastifyInstance } from "fastify";
import {
  getFavorites,
  toggleFavorite,
  isFavorite,
  removeFavorite,
} from "../controllers/favorite.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function favoriteRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", getFavorites);
  fastify.get("/check", isFavorite);
  fastify.post("/toggle", toggleFavorite);
  fastify.delete("/", removeFavorite);
}
import { FastifyInstance } from "fastify";
import { getAllOffers, getOfferById, getOffersByRestaurant } from "../controllers/offer.controller.js";

export default async function offerRoutes(fastify: FastifyInstance) {
  fastify.get("/", getAllOffers);
  fastify.get("/:id", getOfferById);
  fastify.get("/restaurant/:restaurantId", getOffersByRestaurant);
}
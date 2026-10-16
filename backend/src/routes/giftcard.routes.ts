import { FastifyInstance } from "fastify";
import {
  purchaseGiftCard,
  getUserGiftCards,
  redeemGiftCard,
} from "../controllers/giftcard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function giftcardRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/purchase", purchaseGiftCard);
  fastify.get("/my-cards", getUserGiftCards);
  fastify.post("/redeem", redeemGiftCard);
}
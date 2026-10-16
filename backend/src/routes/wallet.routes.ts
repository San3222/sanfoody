import { FastifyInstance } from "fastify";
import { getWallet, addMoney } from "../controllers/wallet.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function walletRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", getWallet);
  fastify.post("/add-money", addMoney);
}
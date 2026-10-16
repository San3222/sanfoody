import { FastifyInstance } from "fastify";
import {
  generateReferralCode,
  getReferralStats,
  applyReferralCode,
} from "../controllers/referral.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function referralRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/generate", generateReferralCode);
  fastify.get("/stats", getReferralStats);
  fastify.post("/apply", applyReferralCode);
}
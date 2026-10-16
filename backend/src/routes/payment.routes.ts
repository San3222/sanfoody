import { FastifyInstance } from "fastify";
import { createRazorpayOrder, verifyPayment } from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function paymentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/create-order", createRazorpayOrder);
  fastify.post("/verify", verifyPayment);
}
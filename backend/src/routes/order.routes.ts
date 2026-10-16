import { FastifyInstance } from "fastify";
import { placeOrder, getUserOrders, getOrderById, cancelOrder, updateOrderStatus, getCancellationPolicy } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { rateDeliveryPartner, canRateOrder, } from "../controllers/rating.controller.js";

export default async function orderRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);  // 🔥 HAR ROUTE KE LIYE AUTH LAGAO

  fastify.post("/", placeOrder);
  fastify.get("/", getUserOrders);
  fastify.get("/:id", getOrderById);
  fastify.patch("/:id/cancel", cancelOrder);
  fastify.patch("/:id/status", updateOrderStatus);
  fastify.get("/cancellation-policy", getCancellationPolicy);

  // 🔥 NEW — Rating endpoints
  fastify.post("/:id/rate-delivery", rateDeliveryPartner);
  fastify.get("/:id/can-rate", canRateOrder);
}
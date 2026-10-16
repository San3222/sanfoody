import { FastifyInstance } from "fastify";
import { updateDeliveryLocation, getDeliveryLocation } from "../controllers/delivery.controller.js";
import {
  getAvailableOrders,
  getMyDeliveries,
  getDeliveryById,
  acceptDeliveryOrder,
  markPickedUp,
  markDelivered,
  getDeliveryStats,
  toggleOnlineStatus,
} from "../controllers/delivery.orders.controller.js";
import { getEarnings } from "../controllers/delivery.earnings.controller.js";
import {
  getWalletBalance,
  requestPayout,
  getPayoutHistory,
  updatePayoutMethod,
  getPayoutMethod,
  cancelPayout,
} from "../controllers/payout.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

export default async function deliveryRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  // ─── Location ─────────────────────────────
  fastify.post(
    "/location",
    { preHandler: [authorize("delivery")] },
    updateDeliveryLocation
  );
  fastify.get("/location/:orderId", getDeliveryLocation);

  // ─── Delivery Partner Routes ──────────────
  const partnerOnly = {
    preHandler: [authorize("delivery")],
  };

  // Dashboard
  fastify.get("/stats", partnerOnly, getDeliveryStats);

  // Orders
  fastify.get("/orders/available", partnerOnly, getAvailableOrders);
  fastify.get("/orders/my-deliveries", partnerOnly, getMyDeliveries);
  fastify.get("/orders/:id", partnerOnly, getDeliveryById);
  fastify.patch("/orders/:id/accept", partnerOnly, acceptDeliveryOrder);
  fastify.patch("/orders/:id/picked-up", partnerOnly, markPickedUp);
  fastify.patch("/orders/:id/delivered", partnerOnly, markDelivered);

  // Status
  fastify.post("/status", partnerOnly, toggleOnlineStatus);

  // Earnings
  fastify.get("/earnings", partnerOnly, getEarnings);

  // ─── 🔥 Payout / Withdrawal ────────────────
  fastify.get("/payout/balance", partnerOnly, getWalletBalance);
  fastify.post("/payout/request", partnerOnly, requestPayout);
  fastify.get("/payout/history", partnerOnly, getPayoutHistory);
  fastify.delete("/payout/:id", partnerOnly, cancelPayout);

  // ─── 🔥 Payout Method ──────────────────────
  fastify.get("/payout/method", partnerOnly, getPayoutMethod);
  fastify.post("/payout/method", partnerOnly, updatePayoutMethod);
}
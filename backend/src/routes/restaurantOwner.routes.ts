import { FastifyInstance } from "fastify";
import {
    getRestaurantStats,
    getRestaurantProfile,
    getRestaurantAnalytics,
    getRestaurantReviews,
} from "../controllers/restaurant.stats.controller.js";
import {
    getRestaurantOrders,
    getRestaurantOrderById,
    acceptOrder,
    rejectOrder,
    markPreparing,
    markReady,
    markDelivered, 
} from "../controllers/restaurant.orders.controller.js";
import {
    updateRestaurantSettings,
    toggleAvailability,
} from "../controllers/restaurant.settings.controller.js";
import {
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
} from "../controllers/menu.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

export default async function restaurantOwnerRoutes(fastify: FastifyInstance) {
    // 🔥 Route-level preHandler — hooks + routes ek saath
    const ownerOnly = {
        preHandler: [authenticate, authorize("restaurant")],
    };

    // ─── Dashboard / Stats ─────────────────────────
    fastify.get("/stats", ownerOnly, getRestaurantStats);
    fastify.get("/profile", ownerOnly, getRestaurantProfile);
    fastify.get("/analytics", ownerOnly, getRestaurantAnalytics);
    fastify.get("/reviews", ownerOnly, getRestaurantReviews);

    // ─── Orders Management ─────────────────────────
    fastify.get("/orders", ownerOnly, getRestaurantOrders);
    fastify.get("/orders/:id", ownerOnly, getRestaurantOrderById);
    fastify.patch("/orders/:id/accept", ownerOnly, acceptOrder);
    fastify.patch("/orders/:id/reject", ownerOnly, rejectOrder);
    fastify.patch("/orders/:id/preparing", ownerOnly, markPreparing);
    fastify.patch("/orders/:id/ready", ownerOnly, markReady);
    fastify.patch("/orders/:id/deliver", ownerOnly, markDelivered);

    // ─── Menu Management ───────────────────────────
    fastify.post("/menu", ownerOnly, createMenuItem);
    fastify.patch("/menu/:id", ownerOnly, updateMenuItem);
    fastify.delete("/menu/:id", ownerOnly, deleteMenuItem);
    fastify.patch("/menu/:id/toggle", ownerOnly, toggleMenuItemAvailability);

    // ─── Settings ──────────────────────────────────
    fastify.patch("/settings", ownerOnly, updateRestaurantSettings);
    fastify.patch("/availability", ownerOnly, toggleAvailability);
}
import { FastifyInstance } from "fastify";
import {
    getAllPayouts,
    approvePayout,
    completePayout,
    rejectPayout,
    getPayoutStats,
} from "../controllers/admin.payout.controller.js";
import {
    getAllUsers,
    toggleUserStatus,
    getUserById,
    verifyUser,
    rejectUser,
} from "../controllers/admin.users.controller.js";
import {
    getAllRestaurants,
    verifyRestaurant,
    unverifyRestaurant,
    toggleRestaurantOpen,
    getRestaurantDetails,
} from "../controllers/admin.restaurants.controller.js";
import {
    getAllOrders,
    getOrderDetails,
} from "../controllers/admin.orders.controller.js";
import {
    getDashboardStats,
    getPlatformAnalytics,
} from "../controllers/admin.analytics.controller.js";
import {
    getAllChats,
    getChatById,
    replyToChat,
    closeChat,
    reopenChat,
} from "../controllers/admin.chat.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

export default async function adminRoutes(fastify: FastifyInstance) {
    fastify.addHook("preHandler", authenticate);
    fastify.addHook("preHandler", authorize("admin"));

    // Dashboard
    fastify.get("/dashboard", getDashboardStats);
    fastify.get("/analytics", getPlatformAnalytics);

    // Users
    fastify.get("/users", getAllUsers);
    fastify.get("/users/:id", getUserById);
    fastify.patch("/users/:id/toggle-status", toggleUserStatus);
    fastify.patch("/users/:id/verify", verifyUser);        // 🔥 NEW
    fastify.patch("/users/:id/reject", rejectUser);        // 🔥 NEW

    // Restaurants
    fastify.get("/restaurants", getAllRestaurants);
    fastify.get("/restaurants/:id", getRestaurantDetails);
    fastify.patch("/restaurants/:id/verify", verifyRestaurant);
    fastify.patch("/restaurants/:id/unverify", unverifyRestaurant);
    fastify.patch("/restaurants/:id/toggle-open", toggleRestaurantOpen);

    // Orders
    fastify.get("/orders", getAllOrders);
    fastify.get("/orders/:orderId", getOrderDetails);   // 🔥 Param name changed

    // Payouts
    fastify.get("/payouts", getAllPayouts);
    fastify.get("/payouts/stats", getPayoutStats);
    fastify.patch("/payouts/:id/approve", approvePayout);
    fastify.patch("/payouts/:id/complete", completePayout);
    fastify.patch("/payouts/:id/reject", rejectPayout);

    // Chats
    fastify.get("/chats", getAllChats);
    fastify.get("/chats/:id", getChatById);
    fastify.post("/chats/:id/reply", replyToChat);
    fastify.patch("/chats/:id/close", closeChat);
    fastify.patch("/chats/:id/reopen", reopenChat);
}
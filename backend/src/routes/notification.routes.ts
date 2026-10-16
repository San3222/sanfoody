import { FastifyInstance } from "fastify";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", getNotifications);
  fastify.patch("/:id/read", markNotificationAsRead);
  fastify.patch("/read-all", markAllNotificationsAsRead);
}
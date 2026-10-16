import { FastifyInstance } from "fastify";
import {
  createChat,
  getUserChats,
  getChatById,
  sendMessage,
} from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function chatRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/", createChat);
  fastify.get("/", getUserChats);
  fastify.get("/:id", getChatById);
  fastify.post("/:id/messages", sendMessage);
}
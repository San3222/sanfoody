import { FastifyInstance } from "fastify";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,     // 🔥 NEW
  resetPassword,      // 🔥 NEW
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", registerUser);
  fastify.post("/login", loginUser);
  fastify.post("/logout", { preHandler: [authenticate] }, logoutUser);
  fastify.get("/me", { preHandler: [authenticate] }, getCurrentUser);

  // 🔥 Password reset
  fastify.post("/forgot-password", forgotPassword);
  fastify.post("/reset-password/:token", resetPassword);
}
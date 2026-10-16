import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";    // 🔥 NEW
import path from "node:path";                   // 🔥 NEW

import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  // app.register(helmet);
  // 🔥 Helmet with relaxed CSP for socket.io + CDN images
  app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],       // 🔥 Allow inline
        scriptSrcAttr: ["'unsafe-inline'"],                              // 🔥 Allow onclick
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http://localhost:5000", "http://localhost:5173"],
        fontSrc: ["'self'", "data:"],
      },
    },
  });

  // 🔥 CORS COnfiguration FIX
  app.register(cors, {
    origin: true, // Ya specific: env.CORS_ORIGIN
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // app.register(rateLimit, {
  //   max: 1000,
  //   timeWindow: "1 minute"
  // });
  app.register(rateLimit, {
    max: env.NODE_ENV === "production" ? 100 : 10000,  // 🔥 Dev mein 10000
    timeWindow: "1 minute",
  });

  app.register(cookie, {
    secret: env.JWT_ACCESS_SECRET,
  });

  // 🔥 Serve static files (for socket-test.html)
  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/public/",
  });

  app.setErrorHandler(errorHandler);

  app.get("/", async () => {
    return {
      success: true,
      name: "SanFoody API",
      message: "Welcome to SanFoody Backend",
      version: "1.0.0"
    };
  });

  app.get("/api/v1/health", async () => {
    return {
      success: true,
      message: "SanFoody API is healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    };
  });

  // Register API routes
  app.register(apiRoutes, { prefix: "/api/v1" });

  return app;
}
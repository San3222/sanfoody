import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "./models/User.model.js";
import { Restaurant } from "./models/Restaurant.model.js";

const startServer = async () => {
  const app = buildApp();
  const server = app.server;

  // Socket.io Setup
  const io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });


  try {
    await connectDatabase();

    // ============================================
    // 🔥 Socket.io Authentication Middleware
    // ============================================
    io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace("Bearer ", "");

        if (!token) {
          console.log("❌ [Socket] No token provided");
          return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
          return next(new Error("User not found"));
        }

        (socket as any).user = user;
        console.log(`✅ [Socket] Authenticated: ${user.email} (${user.role})`);
        next();
      } catch (err: any) {
        console.log("❌ [Socket] Auth failed:", err.message);
        next(new Error("Invalid token"));
      }
    });


    // ============================================
    // 🔥 Socket.io Connection Handler
    // ============================================
    io.on("connection", async (socket) => {
      const user = (socket as any).user;
      console.log(`🔌 [Socket] Connected: ${socket.id} | User: ${user?.email}`);

      // ─── Join user-specific room (always) ──────────
      if (user) {
        socket.join(`user_${user._id}`);
        console.log(`📥 [Socket] Joined user_${user._id}`);

        // ─── Restaurant owner: join restaurant room ──
        if (user.role === "restaurant") {
          const restaurant = await Restaurant.findOne({ owner: user._id });
          if (restaurant) {
            socket.join(`restaurant_${restaurant._id}`);
            console.log(`🏪 [Socket] Joined restaurant_${restaurant._id} (${restaurant.name})`);
          }
        }

        // ─── Delivery partner: join delivery pool ────
        if (user.role === "delivery") {
          socket.join("delivery_pool");
          console.log(`🚴 [Socket] Joined delivery_pool`);
        }
      }

      // ─── Manual room join (for order tracking) ─────
      socket.on("join-order-room", (orderId: string) => {
        socket.join(`order_${orderId}`);
        console.log(`📦 [Socket] Joined order_${orderId}`);
      });

      socket.on("leave-order-room", (orderId: string) => {
        socket.leave(`order_${orderId}`);
        console.log(`📤 [Socket] Left order_${orderId}`);
      });

      socket.on("disconnect", () => {
        console.log(`❌ [Socket] Disconnected: ${socket.id}`);
      });
    });

    // Make io accessible in request handlers
    app.decorate("io", io);

    // Listen on specified port and host
    await app.listen({
      port: env.PORT,
      host: "0.0.0.0"
    });

    console.log(
      `🍔 SanFoody API running on http://localhost:${env.PORT}`
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
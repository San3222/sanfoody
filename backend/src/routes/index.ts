import { FastifyInstance } from "fastify";
import authRoutes from "./auth.routes.js";
import restaurantRoutes from "./restaurant.routes.js";
import menuRoutes from "./menu.routes.js";
import orderRoutes from "./order.routes.js";
import categoryRoutes from "./category.routes.js";
import couponRoutes from "./coupon.routes.js";
import offerRoutes from "./offer.routes.js";
import paymentRoutes from "./payment.routes.js";
import walletRoutes from "./wallet.routes.js";
import searchRoutes from "./search.routes.js";
import addressRoutes from "./address.routes.js";
import reviewRoutes from "./review.routes.js";
import notificationRoutes from "./notification.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import referralRoutes from "./referral.routes.js";
import chatRoutes from "./chat.routes.js";
import restaurantOwnerRoutes from "./restaurantOwner.routes.js";
import adminRoutes from "./admin.routes.js";  
import loyaltyRoutes from "./loyalty.routes.js";
import giftcardRoutes from "./giftcard.routes.js";

export default async function apiRoutes(fastify: FastifyInstance) {
  await fastify.register(authRoutes, { prefix: "/auth" });
  await fastify.register(restaurantRoutes, { prefix: "/restaurants" });
  await fastify.register(restaurantOwnerRoutes, { prefix: "/restaurant" });
  await fastify.register(menuRoutes, { prefix: "/menu" });
  await fastify.register(orderRoutes, { prefix: "/orders" });
  await fastify.register(categoryRoutes, { prefix: "/categories" });
  await fastify.register(couponRoutes, { prefix: "/coupons" });
  await fastify.register(offerRoutes, { prefix: "/offers" });
  await fastify.register(paymentRoutes, { prefix: "/payments" });
  await fastify.register(walletRoutes, { prefix: "/wallet" });
  await fastify.register(searchRoutes, { prefix: "/search" });
  await fastify.register(addressRoutes, { prefix: "/addresses" });
  await fastify.register(reviewRoutes, { prefix: "/reviews" });
  await fastify.register(notificationRoutes, { prefix: "/notifications" });
  await fastify.register(favoriteRoutes, { prefix: "/favorites" });
  await fastify.register(deliveryRoutes, { prefix: "/delivery" });
  await fastify.register(referralRoutes, { prefix: "/referrals" });
  await fastify.register(chatRoutes, { prefix: "/chats" });
  await fastify.register(adminRoutes, { prefix: "/admin" }); 
  await fastify.register(loyaltyRoutes, { prefix: "/loyalty" });
  await fastify.register(giftcardRoutes, { prefix: "/giftcards" });

}
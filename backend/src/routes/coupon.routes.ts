import { FastifyInstance } from "fastify";
import { getCoupons, applyCoupon } from "../controllers/coupon.controller.js";

export default async function couponRoutes(fastify: FastifyInstance) {
  fastify.get("/", getCoupons);
  fastify.post("/apply", applyCoupon);
}
import { FastifyInstance } from "fastify";
import {
    getUserPoints,
    redeemPoints,
} from "../controllers/loyalty.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function loyaltyRoutes(fastify: FastifyInstance) {
    fastify.addHook("preHandler", authenticate);

    fastify.get("/", getUserPoints);
    fastify.post("/redeem", redeemPoints);
}
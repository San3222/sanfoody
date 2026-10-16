import { FastifyInstance } from "fastify";
import { getCategories } from "../controllers/category.controller.js";

export default async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get("/", getCategories);
}
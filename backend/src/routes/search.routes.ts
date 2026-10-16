import { FastifyInstance } from "fastify";
import { searchAll } from "../controllers/search.controller.js";

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get("/", searchAll);
}
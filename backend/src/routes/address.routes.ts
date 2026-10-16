import { FastifyInstance } from "fastify";
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

export default async function addressRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", getAddresses);
  fastify.get("/:id", getAddressById);
  fastify.post("/", createAddress);
  fastify.patch("/:id", updateAddress);
  fastify.patch("/:id/default", setDefaultAddress);
  fastify.delete("/:id", deleteAddress);
}
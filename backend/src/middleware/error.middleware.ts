import { FastifyRequest, FastifyReply } from "fastify";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (
  error: any,
  req: FastifyRequest,
  reply: FastifyReply
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let errors = error.errors || [];

  // Mongoose validation error
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(error.errors).map((e: any) => e.message);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    message = "Duplicate key error";
    errors = [Object.keys(error.keyValue).join(", ") + " already exists"];
  }

  reply.status(statusCode).send({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
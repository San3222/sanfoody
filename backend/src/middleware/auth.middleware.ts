import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export interface AuthRequest extends FastifyRequest {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  reply: FastifyReply
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, reply: FastifyReply) => {   // 🔥 ADD async
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    // Async function automatically returns a resolved Promise → Fastify proceeds
  };
};
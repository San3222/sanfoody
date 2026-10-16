import { FastifyRequest, FastifyReply } from "fastify";

type AsyncHandlerType = (
  req: FastifyRequest,
  reply: FastifyReply
) => Promise<any>;

// 🔥 Fastify 4+ natively handles async errors.
// Just return the function directly — no wrapper needed.
export const asyncHandler = (fn: AsyncHandlerType) => fn;
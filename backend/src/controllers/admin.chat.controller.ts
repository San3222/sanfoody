import { FastifyReply } from "fastify";
import { Chat } from "../models/Chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// ============================================
// GET /admin/chats — All customer tickets
// ============================================
export const getAllChats = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { status } = req.query as any;
        const page = parseInt((req.query as any).page) || 1;
        const limit = parseInt((req.query as any).limit) || 20;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (status && status !== "all") {
            query.status = status;
        }

        const [chats, total] = await Promise.all([
            Chat.find(query)
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("customerId", "name email phone"),
            Chat.countDocuments(query),
        ]);

        // Stats
        const [openCount, closedCount] = await Promise.all([
            Chat.countDocuments({ status: "open" }),
            Chat.countDocuments({ status: "closed" }),
        ]);

        return reply.status(200).send(
            new ApiResponse(
                200,
                {
                    chats,
                    total,
                    page,
                    totalPages: Math.ceil(total / limit),
                    stats: { open: openCount, closed: closedCount },
                },
                "Chats fetched successfully"
            )
        );
    }
);

// ============================================
// GET /admin/chats/:id — Single chat details
// ============================================
export const getChatById = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const chat = await Chat.findById(id).populate(
            "customerId",
            "name email phone"
        );

        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, chat, "Chat fetched successfully"));
    }
);

// ============================================
// POST /admin/chats/:id/reply — Admin replies
// ============================================
export const replyToChat = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;
        const { message } = req.body as any;

        if (!message || !message.trim()) {
            throw new ApiError(400, "Message is required");
        }

        const chat = await Chat.findById(id);

        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }

        chat.messages.push({
            senderId: req.user._id,
            senderRole: "support",
            message: message.trim(),
            createdAt: new Date(),
        });

        await chat.save();

        // 🔥 Socket — notify customer
        const io = (req.server as any).io;
        if (io) {
            io.to(`chat_${id}`).emit("new-message", {
                chatId: id,
                message: message.trim(),
                senderRole: "support",
                senderId: req.user._id,
                createdAt: new Date().toISOString(),
            });

            // Also notify customer in their user room
            io.to(`user_${chat.customerId}`).emit("chat-reply", {
                chatId: id,
                message: message.trim(),
            });
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, chat, "Reply sent successfully"));
    }
);

// ============================================
// PATCH /admin/chats/:id/close — Close ticket
// ============================================
export const closeChat = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const chat = await Chat.findByIdAndUpdate(
            id,
            { status: "closed" },
            { new: true }
        );

        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, chat, "Chat closed"));
    }
);

// ============================================
// PATCH /admin/chats/:id/reopen — Reopen ticket
// ============================================
export const reopenChat = asyncHandler(
    async (req: AuthRequest, reply: FastifyReply) => {
        const { id } = req.params as any;

        const chat = await Chat.findByIdAndUpdate(
            id,
            { status: "open" },
            { new: true }
        );

        if (!chat) {
            throw new ApiError(404, "Chat not found");
        }

        return reply
            .status(200)
            .send(new ApiResponse(200, chat, "Chat reopened"));
    }
);
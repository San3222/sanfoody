import { FastifyRequest, FastifyReply } from "fastify";
import { Chat } from "../models/Chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Create Chat / Ticket
export const createChat = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { subject, message } = req.body as any;

    if (!subject || !message) {
      throw new ApiError(400, "Subject and message are required");
    }

    const chat = await Chat.create({
      customerId: req.user._id,
      subject,
      status: 'open',
      messages: [
        {
          senderId: req.user._id,
          senderRole: 'customer',
          message,
        },
      ],
    });

    return reply
      .status(201)
      .send(new ApiResponse(201, chat, "Chat created successfully"));
  }
);

// Get User Chats
export const getUserChats = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const chats = await Chat.find({ customerId: req.user._id })
      .sort({ updatedAt: -1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, chats, "Chats fetched successfully"));
  }
);

// Get Chat by ID
export const getChatById = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const chat = await Chat.findOne({ _id: id, customerId: req.user._id });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, chat, "Chat fetched successfully"));
  }
);

// Send Message
export const sendMessage = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const { message } = req.body as any;

    if (!message) {
      throw new ApiError(400, "Message is required");
    }

    const chat = await Chat.findOne({ _id: id, customerId: req.user._id });

    if (!chat) {
      throw new ApiError(404, "Chat not found");
    }

    chat.messages.push({
      senderId: req.user._id,
      senderRole: 'customer',
      message,
      createdAt: new Date(),
    });

    await chat.save();

    // 🔥 Socket.io se support team ko message bhejo
    const io = (req.server as any).io;
    if (io) {
      io.to(`chat_${id}`).emit("new-message", {
        chatId: id,
        message,
        senderRole: 'customer',
        senderId: req.user._id,
        createdAt: new Date().toISOString(),
      });
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, chat, "Message sent successfully"));
  }
);
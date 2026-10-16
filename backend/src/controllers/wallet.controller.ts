import { FastifyReply } from "fastify";
import { Wallet } from "../models/Wallet.model.js";
import { WalletTransaction } from "../models/WalletTransaction.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Get wallet balance + transaction history
export const getWallet = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    let wallet = await Wallet.findOne({ user: req.user._id });

    // Naye user ke liye wallet auto-create karo (0 balance ke saath)
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    const transactions = await WalletTransaction.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          { balance: wallet.balance, transactions },
          "Wallet fetched successfully"
        )
      );
  }
);

// Add money to wallet
export const addMoney = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { amount } = req.body as any;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new ApiError(400, "Please enter a valid amount");
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = await WalletTransaction.create({
      user: req.user._id,
      type: "credit",
      amount,
      description: "Added money to wallet",
      balanceAfter: wallet.balance,
    });

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          { balance: wallet.balance, transaction },
          "Money added successfully"
        )
      );
  }
);
import { FastifyRequest, FastifyReply } from "fastify";
import { GiftCard } from "../models/GiftCard.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

function generateGiftCardCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'SF-'
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
    if ((i + 1) % 4 === 0 && i < 11) code += '-'
  }
  return code
}

// Purchase Gift Card
export const purchaseGiftCard = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { amount, recipientEmail, recipientName, message } = req.body as any

    if (!amount || amount < 100) {
      throw new ApiError(400, "Minimum amount is ₹100")
    }

    const code = generateGiftCardCode()
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year validity

    const giftCard = await GiftCard.create({
      code,
      amount,
      balance: amount,
      purchasedBy: req.user._id,
      recipientEmail,
      recipientName,
      message,
      status: 'active',
      expiresAt,
    })

    return reply
      .status(201)
      .send(new ApiResponse(201, giftCard, "Gift card purchased"));
  }
);

// Get User's Gift Cards
export const getUserGiftCards = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const giftCards = await GiftCard.find({
      $or: [
        { purchasedBy: req.user._id },
        { redeemedBy: req.user._id },
      ],
    }).sort({ createdAt: -1 })

    return reply
      .status(200)
      .send(new ApiResponse(200, giftCards, "Gift cards fetched"));
  }
);

// Redeem Gift Card
export const redeemGiftCard = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { code } = req.body as any

    if (!code) {
      throw new ApiError(400, "Gift card code is required")
    }

    const giftCard = await GiftCard.findOne({ code, status: 'active' })

    if (!giftCard) {
      throw new ApiError(404, "Invalid or expired gift card")
    }

    if (new Date() > giftCard.expiresAt) {
      giftCard.status = 'expired'
      await giftCard.save()
      throw new ApiError(400, "Gift card has expired")
    }

    if (giftCard.redeemedBy) {
      throw new ApiError(400, "Gift card already redeemed")
    }

    giftCard.redeemedBy = req.user._id
    giftCard.status = 'redeemed'
    await giftCard.save()

    // User wallet mein amount add karo
    // (wallet controller se integrate karo)

    return reply
      .status(200)
      .send(new ApiResponse(200, { amount: giftCard.balance }, "Gift card redeemed"));
  }
);
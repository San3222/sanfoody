import { FastifyRequest, FastifyReply } from "fastify";
import { LoyaltyPoint } from "../models/LoyaltyPoint.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Points: ₹100 spent = 10 points earned
const POINTS_PER_RUPEE = 0.1
// 100 points = ₹10 discount
const RUPEE_PER_POINT = 0.1

function calculateTier(totalEarned: number): string {
  if (totalEarned >= 10000) return 'platinum'
  if (totalEarned >= 5000) return 'gold'
  if (totalEarned >= 1000) return 'silver'
  return 'bronze'
}

// Get User Points
export const getUserPoints = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    let loyalty = await LoyaltyPoint.findOne({ userId: req.user._id })

    if (!loyalty) {
      loyalty = await LoyaltyPoint.create({ userId: req.user._id })
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, loyalty, "Loyalty points fetched"));
  }
);

// Earn Points (Order ke baad)
export const earnPoints = async (
  userId: string,
  orderTotal: number,
  orderId: string
) => {
  const pointsToEarn = Math.floor(orderTotal * POINTS_PER_RUPEE)

  let loyalty = await LoyaltyPoint.findOne({ userId })

  if (!loyalty) {
    loyalty = await LoyaltyPoint.create({ userId })
  }

  loyalty.points += pointsToEarn
  loyalty.totalEarned += pointsToEarn
  loyalty.tier = calculateTier(loyalty.totalEarned) as any
  loyalty.history.push({
    type: 'earned',
    points: pointsToEarn,
    description: `Earned from order #${orderId}`,
    orderId,
    createdAt: new Date(),
  })

  await loyalty.save()
  return pointsToEarn
};

// Redeem Points
export const redeemPoints = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { points } = req.body as any

    if (!points || points <= 0) {
      return reply
        .status(400)
        .send(new ApiResponse(400, {}, "Invalid points"));
    }

    const loyalty = await LoyaltyPoint.findOne({ userId: req.user._id })

    if (!loyalty || loyalty.points < points) {
      return reply
        .status(400)
        .send(new ApiResponse(400, {}, "Insufficient points"));
    }

    const discount = points * RUPEE_PER_POINT

    loyalty.points -= points
    loyalty.totalRedeemed += points
    loyalty.history.push({
      type: 'redeemed',
      points: -points,
      description: `Redeemed ${points} points for ₹${discount} discount`,
      createdAt: new Date(),
    })

    await loyalty.save()

    return reply
      .status(200)
      .send(new ApiResponse(200, { discount }, "Points redeemed successfully"));
  }
);
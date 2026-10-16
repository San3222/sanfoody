import { FastifyRequest, FastifyReply } from "fastify";
import { Referral } from "../models/Referral.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Generate Referral Code
export const generateReferralCode = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    
    const user = await User.findById(req.user._id);
    console.log('👤 User found:', user?.name, '| Existing code:', user?.referralCode);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.referralCode) {
      console.log('✅ Returning existing code:', user.referralCode);
      return reply
        .status(200)
        .send(new ApiResponse(200, { referralCode: user.referralCode }, "Referral code already exists"));
    }

    // Generate unique code
    const code = `${user.name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    console.log('🎲 Generated code:', code);

    user.referralCode = code;
    await user.save();
    console.log('💾 Code saved to DB');

    return reply
      .status(201)
      .send(new ApiResponse(201, { referralCode: code }, "Referral code generated successfully"));
  }
);



// Get Referral Stats
export const getReferralStats = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate("refereeId", "name email");

    const completedReferrals = referrals.filter((r) => r.status === 'completed');
    const pendingReferrals = referrals.filter((r) => r.status === 'pending');

    const totalEarnings = completedReferrals.reduce(
      (sum, r) => sum + r.rewardAmount,
      0
    );

    return reply
      .status(200)
      .send(new ApiResponse(200, {
        totalReferrals: referrals.length,
        completedReferrals: completedReferrals.length,
        pendingReferrals: pendingReferrals.length,
        totalEarnings,
        referrals: referrals.map((r) => ({
          id: r._id,
          friendName: (r.refereeId as any)?.name,
          status: r.status,
          rewardAmount: r.rewardAmount,
          date: r.createdAt,
        })),
      }, "Referral stats fetched successfully"));
  }
);

// Apply Referral Code
export const applyReferralCode = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { referralCode } = req.body as any;

    if (!referralCode) {
      throw new ApiError(400, "Referral code is required");
    }

    // Apna hi code use nahi kar sakte
    const currentUser = await User.findById(req.user._id);
    if (currentUser?.referralCode === referralCode) {
      throw new ApiError(400, "You cannot use your own referral code");
    }

    // Referrer dhundo
    const referrer = await User.findOne({ referralCode });

    if (!referrer) {
      throw new ApiError(404, "Invalid referral code");
    }

    // Already referred check karo
    const existingReferral = await Referral.findOne({
      referrerId: referrer._id,
      refereeId: req.user._id,
    });

    if (existingReferral) {
      throw new ApiError(400, "You have already used this referral code");
    }

    // Referral create karo
    const referral = await Referral.create({
      referrerId: referrer._id,
      refereeId: req.user._id,
      referralCode,
      rewardAmount: 100,
      status: 'pending',
    });

    // Referrer ko ₹100 reward do
    referrer.referralEarnings = (referrer.referralEarnings || 0) + 100;
    await referrer.save();

    // Referral status update karo
    referral.status = 'completed';
    referral.completedAt = new Date();
    await referral.save();

    return reply
      .status(201)
      .send(new ApiResponse(201, { referral, rewardAmount: 100 }, "Referral applied successfully"));
  }
);
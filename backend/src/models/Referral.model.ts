import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  refereeId: mongoose.Types.ObjectId;
  referralCode: string;
  status: 'pending' | 'completed';
  rewardAmount: number;
  createdAt: Date;
  completedAt?: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refereeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    rewardAmount: {
      type: Number,
      default: 100,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1 });
ReferralSchema.index({ referralCode: 1 });

export const Referral = mongoose.model<IReferral>("Referral", ReferralSchema);
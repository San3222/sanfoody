import mongoose, { Schema, Document } from "mongoose";

export interface IPayout extends Document {
  partnerId: mongoose.Types.ObjectId;
  amount: number;
  method: "upi" | "bank";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  
  // Payout method snapshot (at time of request)
  payoutDetails: {
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };

  // Processing
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  
  // External reference
  transactionId?: string;    // Razorpay payout ID / UTR number
  notes?: string;
}

const PayoutSchema = new Schema<IPayout>(
  {
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 10,             // Minimum ₹100 withdrawal
    },
    method: {
      type: String,
      enum: ["upi", "bank"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    payoutDetails: {
      upiId: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    completedAt: Date,
    failureReason: String,
    transactionId: String,
    notes: String,
  },
  { timestamps: true }
);

// Compound index for partner's payout history
PayoutSchema.index({ partnerId: 1, createdAt: -1 });

export const Payout = mongoose.model<IPayout>("Payout", PayoutSchema);
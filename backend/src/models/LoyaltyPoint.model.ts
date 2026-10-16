import mongoose, { Schema, Document } from "mongoose";

export interface ILoyaltyPoint extends Document {
    userId: mongoose.Types.ObjectId;
    points: number;
    totalEarned: number;
    totalRedeemed: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    history: {
        type: 'earned' | 'redeemed';
        points: number;
        description: string;
        orderId?: string;
        createdAt: Date;
    }[];
}

const LoyaltyPointSchema = new Schema<ILoyaltyPoint>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        points: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        totalRedeemed: { type: Number, default: 0 },
        tier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: 'bronze',
        },
        history: [
            {
                type: { type: String, enum: ['earned', 'redeemed'], required: true },
                points: { type: Number, required: true },
                description: { type: String, required: true },
                orderId: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

export const LoyaltyPoint = mongoose.model<ILoyaltyPoint>("LoyaltyPoint", LoyaltyPointSchema);
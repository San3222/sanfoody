import mongoose, { Schema, Document } from "mongoose";

export interface IGiftCard extends Document {
    code: string;
    amount: number;
    balance: number;
    purchasedBy?: mongoose.Types.ObjectId;
    redeemedBy?: mongoose.Types.ObjectId;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
    status: 'active' | 'redeemed' | 'expired';
    expiresAt: Date;
    createdAt: Date;
}

const GiftCardSchema = new Schema<IGiftCard>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
        },
        amount: { type: Number, required: true },
        balance: { type: Number, required: true },
        purchasedBy: { type: Schema.Types.ObjectId, ref: "User" },
        redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
        recipientEmail: String,
        recipientName: String,
        message: String,
        status: {
            type: String,
            enum: ['active', 'redeemed', 'expired'],
            default: 'active',
        },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

export const GiftCard = mongoose.model<IGiftCard>("GiftCard", GiftCardSchema);
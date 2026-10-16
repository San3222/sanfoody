import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    userId: mongoose.Types.ObjectId;
    restaurantId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500,
        },
        images: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Restaurant ke reviews fetch karne ke liye index
ReviewSchema.index({ restaurantId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
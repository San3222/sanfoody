import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  itemType: 'restaurant' | 'food' | 'collection';
  itemId: string;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      enum: ['restaurant', 'food', 'collection'],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// User ke favorites fetch karne ke liye index
FavoriteSchema.index({ userId: 1, itemType: 1 });

export const Favorite = mongoose.model<IFavorite>("Favorite", FavoriteSchema);
import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
     
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// lekin different restaurants same naam use kar sakte hain
MenuItemSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
MenuItemSchema.index({ name: 'text', description: 'text' }); // 🔥 add text index for search functionality

export const MenuItem = mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
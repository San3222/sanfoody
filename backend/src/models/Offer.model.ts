import mongoose, { Schema } from "mongoose";

export interface IOffer {
  restaurantId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  couponCode: string;
  validUntil: Date;
  isActive: boolean;
  isExclusive: boolean;
  isNew: boolean;
  image: string;
  discountTags: string[];
  occasionTags: string[];
}

const OfferSchema = new Schema<IOffer>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountPercent: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number,
      required: true,
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    discountTags: {
      type: [String],
      default: [],
    },
    occasionTags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

OfferSchema.index({ title: 'text', description: 'text', couponCode: 'text' }); // 🔥 add text index for search functionality

export const Offer = mongoose.model<IOffer>("Offer", OfferSchema);
import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  image: string;
  cuisine: string[];
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  priceRange: "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹";
  isVeg: boolean;
  hasOffer: boolean;
  isOpen: boolean;
  isVerified: boolean;
  deliveryFee: number;
  minOrderValue: number;

  // 🔥 NEW FIELDS
  availability: {
    isAcceptingOrders: boolean;
    openingTime: string;
    closingTime: string;
    weeklyOff: number[];
  };
  prepTimeMinutes: number;
  commissionRate: number;
  totalOrders: number;
  totalRevenue: number;
  city: string;
  state: string;

}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    cuisine: {
      type: [String],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: "25-30 min",
    },
    priceRange: {
      type: String,
      enum: ["₹", "₹₹", "₹₹₹", "₹₹₹₹"],
      default: "₹₹",
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    hasOffer: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    minOrderValue: {
      type: Number,
      default: 99,
    },

    city: {
      type: String,
      required: true,
      default: "Mumbai",
      index: true,
    },
    state: {
      type: String,
      required: true,
      default: "Maharashtra",
    },

    // 🔥 NEW FIELDS
    availability: {
      isAcceptingOrders: { type: Boolean, default: true },
      openingTime: { type: String, default: "09:00" },
      closingTime: { type: String, default: "23:00" },
      weeklyOff: { type: [Number], default: [] },
    },
    prepTimeMinutes: { type: Number, default: 20 },
    commissionRate: { type: Number, default: 15 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },


  },
  { timestamps: true }
);

RestaurantSchema.index({ location: "2dsphere" });
RestaurantSchema.index({ name: "text", cuisine: "text", description: "text" });
RestaurantSchema.index({ owner: 1 });  // 🔥 NEW — for restaurant dashboard queries
RestaurantSchema.index({ city: 1, isOpen: 1, rating: -1 });

export const Restaurant = mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
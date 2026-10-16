// src/models/User.model.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "customer" | "restaurant" | "delivery" | "admin";
  phone?: string;
  address?: string;
  referralCode?: string;
  referralEarnings: number;
  referredBy?: string;
  isActive: boolean;

  // 🔥 Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // ============================================
  // 🔥 Role-specific details
  // ============================================

  // Restaurant owner details
  restaurantDetails?: {
    businessName?: string;
    fssaiNumber?: string;
    gstNumber?: string;
    panNumber?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    address?: string;
    verificationStatus?: "pending" | "verified" | "rejected";
    verifiedAt?: Date;
  };

  // Delivery partner details (signup-time info)
  deliveryDetails?: {
    licenseNumber?: string;
    aadhaarNumber?: string;
    panNumber?: string;
    vehicleType?: "bike" | "scooter" | "cycle" | "car";
    vehicleNumber?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    emergencyContact?: string;
    verificationStatus?: "pending" | "verified" | "rejected";
    verifiedAt?: Date;
  };

  // ============================================
  // 🔥 Delivery partner runtime fields
  // ============================================

  status?: "online" | "offline" | "busy";
  currentLoad?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  lastLocationUpdate?: Date;
  totalDeliveries?: number;
  totalEarnings?: number;
  rating?: number;

  // Legacy top-level vehicle fields (kept for backwards compatibility)
  vehicleType?: "bike" | "scooter" | "cycle" | "car";
  vehicleNumber?: string;

  // ============================================
  // 🔥 Payout details
  // ============================================

  payoutMethod?: {
    type: "upi" | "bank";
    upiId?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    verified?: boolean;
    updatedAt?: Date;
  };

  comparePassword: (password: string) => boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "restaurant", "delivery", "admin"],
      default: "customer",
      index: true,
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referralEarnings: { type: Number, default: 0 },
    referredBy: { type: String },
    isActive: { type: Boolean, default: true },
    
    // 🔥 Password reset
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ============================================
    // 🔥 Role-specific details
    // ============================================

    // Restaurant owner details
    restaurantDetails: {
      businessName: String,
      fssaiNumber: String,
      gstNumber: String,
      panNumber: String,
      bankAccountNumber: String,
      bankIfscCode: String,
      address: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verifiedAt: Date,
    },

    // Delivery partner details (signup-time)
    deliveryDetails: {
      licenseNumber: String,
      aadhaarNumber: String,
      panNumber: String,
      vehicleType: {
        type: String,
        enum: ["bike", "scooter", "cycle", "car"],
      },
      vehicleNumber: String,
      bankAccountNumber: String,
      bankIfscCode: String,
      emergencyContact: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      verifiedAt: Date,
    },

    // ============================================
    // 🔥 Delivery partner runtime fields
    // ============================================

    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
    currentLoad: { type: Number, default: 0 },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    lastLocationUpdate: { type: Date },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },

    // Legacy top-level vehicle fields (kept for backwards compatibility)
    vehicleType: {
      type: String,
      enum: ["bike", "scooter", "cycle", "car"],
      default: "bike",
    },
    vehicleNumber: { type: String, default: "" },

    // ============================================
    // 🔥 Payout details
    // ============================================

    payoutMethod: {
      type: {
        type: String,
        enum: ["upi", "bank"],
      },
      upiId: String,
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      verified: { type: Boolean, default: false },
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

// ============================================
// Hooks
// ============================================

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

// ============================================
// Indexes
// ============================================

// Find available delivery partners
UserSchema.index({ role: 1, status: 1, isActive: 1 });
UserSchema.index({ role: 1, currentLoad: 1 });

// Find pending verifications (for admin)
UserSchema.index({ role: 1, "restaurantDetails.verificationStatus": 1 });
UserSchema.index({ role: 1, "deliveryDetails.verificationStatus": 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
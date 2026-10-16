import { FastifyRequest, FastifyReply } from "fastify";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { sendWelcomeEmail } from "../utils/email.js";
import crypto from "node:crypto";

const generateAccessToken = (userId: string) => {
  return jwt.sign({ _id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
// Register User — Role-based
// Register User — Role-based
export const registerUser = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const {
      name,
      email,
      password,
      role,
      phone,
      // Restaurant fields
      restaurantDetails,
      // Delivery fields
      deliveryDetails,
    } = req.body as any;

    if (!name || !email || !password) {
      throw new ApiError(400, "Name, email and password are required");
    }

    // Validate role
    const allowedRoles = ["customer", "restaurant", "delivery"];
    const userRole = role || "customer";
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(400, "Invalid role. Choose customer, restaurant, or delivery");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already exists with this email");
    }

    // 🔥 Role-specific validation
    if (userRole === "restaurant") {
      if (!restaurantDetails?.businessName) {
        throw new ApiError(400, "Business name is required for restaurant");
      }
      if (!restaurantDetails?.fssaiNumber) {
        throw new ApiError(400, "FSSAI number is required for restaurant");
      }
    }

    if (userRole === "delivery") {
      if (!deliveryDetails?.licenseNumber) {
        throw new ApiError(400, "Driving license is required for delivery partner");
      }
      if (!deliveryDetails?.vehicleType) {
        throw new ApiError(400, "Vehicle type is required for delivery partner");
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone: phone || "",

      // 🔥 Restaurant-specific data
      ...(userRole === "restaurant" && {
        restaurantDetails: {
          ...restaurantDetails,
          verificationStatus: "pending",
        },
      }),

      // 🔥 Delivery-specific data
      ...(userRole === "delivery" && {
        deliveryDetails: {
          ...deliveryDetails,
          verificationStatus: "pending",
        },
        // Also set top-level for delivery app compatibility
        vehicleType: deliveryDetails.vehicleType,
        vehicleNumber: deliveryDetails.vehicleNumber,
      }),
    });

    const createdUser = await User.findById(user._id).select("-password");

    // 🔥 Send welcome email
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
    }).catch((err) => console.error("Welcome email failed:", err));

    return reply
      .status(201)
      .send(
        new ApiResponse(
          201,
          createdUser,
          userRole === "customer"
            ? "Account created successfully"
            : "Account created. Our team will verify your details shortly."
        )
      );
  }
);



// Login User
export const loginUser = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as any;

    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id.toString());

    const loggedInUser = await User.findById(user._id).select("-password");

    // Fastify Cookie Set karo
    reply.setCookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          "User logged in successfully"
        )
      );
  }
);

// Logout User
export const logoutUser = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    reply.clearCookie("accessToken", { path: "/" });

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "User logged out successfully"));
  }
);

// Get Current User
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    return reply
      .status(200)
      .send(new ApiResponse(200, req.user, "User fetched successfully"));
  }
);






// ============================================
// POST /auth/forgot-password
// ============================================
export const forgotPassword = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { email } = req.body as any;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // 🔥 Security: Don't reveal if user exists — return success either way
    if (!user) {
      return reply
        .status(200)
        .send(
          new ApiResponse(
            200,
            {},
            "If an account exists, we've sent a reset link to that email."
          )
        );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    // Send email
    try {
      const { sendPasswordResetEmail } = await import("../utils/email.js");
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetToken,
      });
    } catch (err) {
      console.error("Password reset email failed:", err);
      // Don't fail the request — user can retry
    }

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          {},
          "If an account exists, we've sent a reset link to that email."
        )
      );
  }
);

// ============================================
// POST /auth/reset-password/:token
// ============================================
export const resetPassword = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { token } = req.params as any;
    const { password } = req.body as any;

    if (!token) {
      throw new ApiError(400, "Reset token is required");
    }

    if (!password || password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    // 🔥 Find user with valid token + not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return reply
      .status(200)
      .send(
        new ApiResponse(
          200,
          {},
          "Password reset successful. You can now log in."
        )
      );
  }
);
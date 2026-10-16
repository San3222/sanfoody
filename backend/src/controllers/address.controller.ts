import { FastifyRequest, FastifyReply } from "fastify";
import { Address } from "../models/Address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

// Get All Addresses
export const getAddresses = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const addresses = await Address.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, addresses, "Addresses fetched successfully"));
  }
);

// Get Address by ID
export const getAddressById = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, address, "Address fetched successfully"));
  }
);

// Create Address
export const createAddress = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { label, address, city, state, pincode, isDefault } = req.body as any;

    if (!address || !city || !state || !pincode) {
      throw new ApiError(400, "All fields are required");
    }

    // Agar first address hai, toh default banao
    const addressCount = await Address.countDocuments({ userId: req.user._id });
    const shouldBeDefault = isDefault || addressCount === 0;

    // Agar default bana rahe hain, toh baaki sab default hatao
    if (shouldBeDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId: req.user._id,
      label,
      address,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
    });

    return reply
      .status(201)
      .send(new ApiResponse(201, newAddress, "Address created successfully"));
  }
);

// Update Address
export const updateAddress = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const { label, address, city, state, pincode, isDefault } = req.body as any;

    const existingAddress = await Address.findOne({ _id: id, userId: req.user._id });

    if (!existingAddress) {
      throw new ApiError(404, "Address not found");
    }

    // Agar default bana rahe hain, toh baaki sab default hatao
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        label,
        address,
        city,
        state,
        pincode,
        isDefault: isDefault || false,
      },
      { new: true }
    );

    return reply
      .status(200)
      .send(new ApiResponse(200, updatedAddress, "Address updated successfully"));
  }
);

// Delete Address
export const deleteAddress = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    await Address.findByIdAndDelete(id);

    // Agar deleted address default tha, toh naya default set karo
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id }).sort({ createdAt: 1 });
      if (nextAddress) {
        await Address.findByIdAndUpdate(nextAddress._id, { isDefault: true });
      }
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "Address deleted successfully"));
  }
);

// Set Default Address
export const setDefaultAddress = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;

    const address = await Address.findOne({ _id: id, userId: req.user._id });

    if (!address) {
      throw new ApiError(404, "Address not found");
    }

    await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    await Address.findByIdAndUpdate(id, { isDefault: true });

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "Default address set successfully"));
  }
);
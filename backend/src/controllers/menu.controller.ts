import { FastifyRequest, FastifyReply } from "fastify";
import { MenuItem } from "../models/MenuItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { getRestaurantForOwner } from "../utils/getRestaurantForOwner.js"; 

// CUSTOMER==========================================================================================
// Get All Menu Items
export const getAllMenuItems = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { category, isVeg, search } = req.query as any;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (isVeg) {
      query.isVeg = isVeg === "true";
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const menuItems = await MenuItem.find(query).limit(100);

    return reply
      .status(200)
      .send(new ApiResponse(200, menuItems, "Menu items fetched successfully"));
  }
);

// Get Menu by Restaurant ID
export const getMenuByRestaurant = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { restaurantId } = req.params as any;
    const menuItems = await MenuItem.find({
      restaurantId,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    return reply
      .status(200)
      .send(new ApiResponse(200, menuItems, "Menu items fetched successfully"));
  }
);

// Search Menu Items
export const searchMenuItems = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { query } = req.query as any;

    if (!query) {
      throw new ApiError(400, "Search query is required");
    }

    const menuItems = await MenuItem.find({
      name: { $regex: query, $options: "i" },
    }).limit(20);

    return reply
      .status(200)
      .send(new ApiResponse(200, menuItems, "Menu items searched successfully"));
  }
);



//  RESTAURANT DASHBAORD =========================================================================================

// ============================================
// POST /menu — Create menu item (owner only)
// ============================================
export const createMenuItem = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);

    const { name, description, image, price, category, isVeg, isAvailable } =
      req.body as any;

    if (!name || !description || !image || !price || !category) {
      throw new ApiError(
        400,
        "name, description, image, price, category are required"
      );
    }

    const menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name,
      description,
      image,
      price,
      category,
      isVeg: isVeg ?? true,
      isAvailable: isAvailable ?? true,
    });

    return reply
      .status(201)
      .send(new ApiResponse(201, menuItem, "Menu item created"));
  }
);

// ============================================
// PATCH /menu/:id — Update menu item (owner only)
// ============================================
export const updateMenuItem = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);
    const { id } = req.params as any;

    const allowed = [
      "name",
      "description",
      "image",
      "price",
      "category",
      "isVeg",
      "isAvailable",
    ];

    const updates: any = {};
    for (const key of allowed) {
      if ((req.body as any)[key] !== undefined) {
        updates[key] = (req.body as any)[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "No valid fields to update");
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: restaurant._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      throw new ApiError(404, "Menu item not found for this restaurant");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, menuItem, "Menu item updated"));
  }
);

// ============================================
// DELETE /menu/:id — Delete menu item (owner only)
// ============================================
export const deleteMenuItem = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);
    const { id } = req.params as any;

    const deleted = await MenuItem.findOneAndDelete({
      _id: id,
      restaurantId: restaurant._id,
    });

    if (!deleted) {
      throw new ApiError(404, "Menu item not found for this restaurant");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, {}, "Menu item deleted"));
  }
);

// ============================================
// PATCH /menu/:id/toggle — Toggle availability
// ============================================
export const toggleMenuItemAvailability = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const restaurant = await getRestaurantForOwner(req);
    const { id } = req.params as any;

    const item = await MenuItem.findOne({
      _id: id,
      restaurantId: restaurant._id,
    });

    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    return reply
      .status(200)
      .send(new ApiResponse(200, item, `Item ${item.isAvailable ? "enabled" : "disabled"}`));
  }
);
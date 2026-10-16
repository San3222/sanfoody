import { FastifyRequest, FastifyReply } from "fastify";
import { Order } from "../models/Order.model.js";
import { Restaurant } from "../models/Restaurant.model.js";
import { MenuItem } from "../models/MenuItem.model.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";
import { sendPushNotification } from "./push.controller.js";
import { sendOrderConfirmationEmail, sendNewOrderAlertEmail } from "../utils/email.js";


// Place Order
export const placeOrder = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { restaurantId, items, address, paymentMethod, razorpayOrderId, razorpayPaymentId } = req.body as any;
    const { scheduledFor } = req.body as any

    if (!restaurantId || !items || items.length === 0 || !address) {
      throw new ApiError(400, "Invalid order data");
    }

    // ✅ Check karo ki restaurant ID valid ObjectId hai ya nahi
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      throw new ApiError(400, "Invalid restaurant ID");
    }

    // ✅ Check karo ki restaurant exist karta hai ya nahi
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      throw new ApiError(404, "Restaurant not found");
    }

    // ✅ Items ka validation
    const validItems = [];
    for (const item of items) {
      // Check karo ki menuItemId database mein exist karta hai ya nahi
      let menuItem = null;

      if (mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        menuItem = await MenuItem.findById(item.menuItemId);
      } else {
        // Agar string ID hai, toh name se dhoondho
        menuItem = await MenuItem.findOne({ name: item.name });
      }

      // Agar menu item nahi mila, toh dummy item create karo
      if (!menuItem) {
        // Temporary fix: Item ko waise hi accept karo
        validItems.push({
          menuItemId: item.menuItemId || new mongoose.Types.ObjectId(), // Dummy ObjectId
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        });
      } else {
        validItems.push({
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
        });
      }
    }

    const subtotal = validItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = restaurant.deliveryFee || 40;
    const gst = Math.round(subtotal * 0.05);           // 🔥 add karo — frontend jaisi hi formula
    const total = subtotal + deliveryFee + gst;          // 🔥 GST include karo

    const estimatedDelivery = new Date(
      Date.now() + 30 * 60 * 1000
    );

    // ✅ orderId generate karo
    const orderId = `SF-${Date.now().toString(36).toUpperCase()}`;
    const orderCreatedAt = new Date();

    // 🔥 Card/UPI paid via Razorpay hai to paid status turant set karo
    const isPaidNow = paymentMethod !== "cod" && !!razorpayPaymentId;

    const order = await Order.create({
      orderId,
      user: req.user._id,
      restaurant: restaurantId,
      items: validItems,
      subtotal,
      deliveryFee,
      gst,                                                  // 🔥 add
      total,
      address,
      paymentMethod,
      paymentStatus: isPaidNow ? "paid" : "pending",         // 🔥 add
      isPaid: isPaidNow,                                     // 🔥 add
      ...(razorpayOrderId && { razorpayOrderId }),           // 🔥 add
      ...(razorpayPaymentId && { razorpayPaymentId }),       // 🔥 add
      estimatedDelivery,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      isScheduled: !!scheduledFor,
    });



    // 🔥 Agar scheduled order hai, toh cron job se process karo
    if (scheduledFor) {
      // Notification bhejo
      await sendPushNotification(
        req.user._id,
        "Order Scheduled",
        `Your order will be delivered on ${new Date(scheduledFor).toLocaleString()}`
      )
    }

    // 🔥 Delivery Partner Assign Karo (Nearest Available)
    // const deliveryPartner = await User.findOne({
    //   role: 'delivery',
    //   isActive: true,
    //   status: 'online'
    // }).sort({ currentLoad: 1 }).limit(1);

    // if (deliveryPartner) {
    //   order.deliveryPartner = deliveryPartner._id;
    //   await order.save();
    // }

    // 🔥 Socket.io — Notify restaurant of new order
    const io = (req.server as any).io;
    if (io) {
      io.to(`restaurant_${restaurantId}`).emit("new-order", {
        orderId: order.orderId,
        customerName: req.user.name,
        customerPhone: req.user.phone || "",
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        address: order.address,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        isPaid: order.isPaid,
        createdAt: order.get("createdAt"),
        estimatedPrepTime: order.estimatedPrepTime,
      });
      console.log(`🔔 [Socket] Emitted new-order to restaurant_${restaurantId}`);
    }

    // 🔥 Push notification to restaurant owner
    try {
      await sendPushNotification(
        restaurant.owner.toString(),
        "🔔 New Order Received",
        `Order ${order.orderId} — ₹${order.total} from ${req.user.name}`,
        `/restaurant/orders`
      );
      console.log(`📱 [Push] Sent to owner ${restaurant.owner}`);
    } catch (err) {
      console.error("Push notification failed:", err);
    }

    // 🔥 Email: Order Confirmation to Customer
    sendOrderConfirmationEmail({
      email: req.user.email,
      customerName: req.user.name,
      orderId: order.orderId,
      restaurantName: restaurant.name,
      total: order.total,
      items: order.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      estimatedDelivery: "30-35 minutes",
    }).catch((err) => console.error("Order confirmation email failed:", err));

    // 🔥 Email: New Order Alert to Restaurant Owner
    try {
      const owner = await User.findById(restaurant.owner);
      if (owner) {
        sendNewOrderAlertEmail({
          email: owner.email,
          restaurantName: restaurant.name,
          orderId: order.orderId,
          customerName: req.user.name,
          total: order.total,
          itemsCount: order.items.length,
          address: order.address,
        }).catch((err) => console.error("Restaurant alert email failed:", err));
      }
    } catch (err) {
      console.error("Failed to fetch restaurant owner for email:", err);
    }


    return reply
      .status(201)
      .send(new ApiResponse(201, order, "Order placed successfully"));
  }
);


// Get User Orders
// Get User Orders with Pagination
export const getUserOrders = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const page = parseInt((req.query as any).page) || 1;
    const limit = parseInt((req.query as any).limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("restaurant", "name image");

    const total = await Order.countDocuments({ user: req.user._id });

    return reply
      .status(200)
      .send(new ApiResponse(200, {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }, "Orders fetched successfully"));
  }
);

// Get Order by ID
export const getOrderById = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const order = await Order.findOne({ orderId: id }).populate(
      "restaurant",
      "name image address"
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, order, "Order fetched successfully"));
  }
);


// Cancel Order
export const cancelOrder = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const order = await Order.findOne({ orderId: id });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You cannot cancel this order");
    }

    if (order.status !== "pending" && order.status !== "confirmed") {
      throw new ApiError(400, "Order cannot be cancelled at this stage");
    }

    // 🔥 Cancellation Policy Calculation
    const cancelTime = new Date();
    const orderTime = new Date((order as any).createdAt);
    const minutesElapsed = Math.floor((cancelTime.getTime() - orderTime.getTime()) / 60000);

    let cancellationFee = 0;
    let refundAmount = order.total;

    if (minutesElapsed <= 5) {
      // Free cancellation (5 minutes ke andar)
      cancellationFee = 0;
      refundAmount = order.total;
    } else if (minutesElapsed <= 15) {
      // 10% cancellation fee
      cancellationFee = Math.round(order.total * 0.1);
      refundAmount = order.total - cancellationFee;
    } else {
      // 25% cancellation fee (15 minutes ke baad)
      cancellationFee = Math.round(order.total * 0.25);
      refundAmount = order.total - cancellationFee;
    }

    order.status = "cancelled";
    order.cancellationFee = cancellationFee;
    order.refundAmount = refundAmount;
    await order.save();

    // 🔥 Customer ko cancellation notification bhejo
    const io = (req.server as any).io;
    if (io) {
      io.to(`order_${id}`).emit("order-status-update", {
        orderId: id,
        status: "cancelled",
        cancellationFee,
        refundAmount,
        updatedAt: new Date().toISOString(),
      });
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, order, "Order cancelled successfully"));
  }
);


// Update Order Status (Restaurant/Delivery Partner ke liye  ) Update Order Status (with ownership check)
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const { status } = req.body as any;

    if (!status) {
      throw new ApiError(400, "Status is required");
    }

    const order = await Order.findOne({ orderId: id });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // 🔥 Ownership check — customer, restaurant owner, or delivery partner
    const userId = req.user._id.toString();
    const isCustomer = order.user.toString() === userId;
    const isDeliveryPartner = order.deliveryPartner?.toString() === userId;

    let isRestaurantOwner = false;
    if (req.user.role === "restaurant") {
      const restaurant = await Restaurant.findOne({ owner: req.user._id });
      isRestaurantOwner = restaurant?._id.toString() === order.restaurant.toString();
    }

    const isAdmin = req.user.role === "admin";

    if (!isCustomer && !isDeliveryPartner && !isRestaurantOwner && !isAdmin) {
      throw new ApiError(403, "You don't have permission to update this order");
    }

    order.status = status;
    await order.save();

    // 🔥 Socket.io — notify customer
    const io = (req.server as any).io;
    if (io) {
      io.to(`order_${id}`).emit("order-status-update", {
        orderId: id,
        status: order.status,
        updatedAt: new Date().toISOString(),
      });
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, order, "Order status updated successfully"));
  }
);



// Assign Delivery Partner to Order
export const assignDeliveryPartner = asyncHandler(
  async (req: AuthRequest, reply: FastifyReply) => {
    const { id } = req.params as any;
    const { deliveryPartnerId } = req.body as any;

    if (!deliveryPartnerId) {
      throw new ApiError(400, "Delivery partner ID is required");
    }

    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { deliveryPartner: deliveryPartnerId },
      { new: true }
    );

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return reply
      .status(200)
      .send(new ApiResponse(200, order, "Delivery partner assigned successfully"));
  }
);


// Get Cancellation Policy
export const getCancellationPolicy = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const policy = {
      freeCancellationMinutes: 5,
      midCancellationFeePercent: 10,
      midCancellationMinutes: 15,
      lateCancellationFeePercent: 25,
    };

    return reply
      .status(200)
      .send(new ApiResponse(200, policy, "Cancellation policy fetched successfully"));
  }
);
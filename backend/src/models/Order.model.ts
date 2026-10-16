import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface IOrder extends Document {
    orderId: string;
    user: mongoose.Types.ObjectId;
    restaurant: mongoose.Types.ObjectId;
    deliveryPartner?: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    deliveryFee: number;
    gst: number;
    total: number;
    status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out-for-delivery"
    | "delivered"
    | "cancelled";
    paymentMethod: "card" | "upi" | "cod";
    paymentStatus: "pending" | "paid" | "failed";
    razorpayOrderId?: string;           // 🔥 add
    razorpayPaymentId?: string;
    address: string;
    estimatedDelivery: Date;
    isPaid: boolean;
    cancellationFee: number;
    refundAmount: number;
    scheduledFor?: Date;
    isScheduled: boolean;

    // 🔥 NEW FIELDS for restaurant workflow
    acceptedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    preparedAt?: Date;
    readyAt?: Date;
    deliveredAt?: Date;
    estimatedPrepTime: number;   // minutes

    // 🔥 NEW — Delivery workflow
    pickedUpAt?: Date;
    deliveryStartedAt?: Date;
    deliveryCompletedAt?: Date;
    deliveryEarnings?: number;    // Partner's cut
    deliveryPartnerRating?: number;

    // 🔥 NEW
    tipAmount?: number;

}

const OrderSchema = new Schema<IOrder>(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true,
        },
        deliveryPartner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        items: [
            {
                menuItemId: {
                    type: Schema.Types.ObjectId,
                    ref: "MenuItem",
                    required: true,
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, min: 1 },
                image: { type: String },
            },
        ],
        subtotal: {
            type: Number,
            required: true,
        },
        deliveryFee: {
            type: Number,
            required: true,
        },
        gst: {                          // 🔥 add
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "preparing",
                "ready",
                "out-for-delivery",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["card", "upi", "cod"],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        razorpayOrderId: {              // 🔥 add
            type: String,
        },
        razorpayPaymentId: {            // 🔥 add
            type: String,
        },
        address: {
            type: String,
            required: true,
        },
        estimatedDelivery: {
            type: Date,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        cancellationFee: {
            type: Number,
            default: 0,
        },
        refundAmount: {
            type: Number,
            default: 0,
        },
        scheduledFor: {
            type: Date,
            default: null,
        },
        isScheduled: {
            type: Boolean,
            default: false,
        },

        // 🔥 NEW FIELDS
        acceptedAt: { type: Date },
        rejectedAt: { type: Date },
        rejectionReason: { type: String },
        preparedAt: { type: Date },
        readyAt: { type: Date },
        deliveredAt: { type: Date },
        estimatedPrepTime: { type: Number, default: 20 },


        // 🔥 NEW — Delivery workflow
        pickedUpAt: { type: Date },
        deliveryStartedAt: { type: Date },
        deliveryCompletedAt: { type: Date },
        deliveryEarnings: { type: Number, default: 0 },
        deliveryPartnerRating: { type: Number, min: 0, max: 5 },

        // 🔥 NEW — Tip from customer
        tipAmount: { type: Number, default: 0 },

    },
    { timestamps: true }
);


// 🔥 Compound indexes for restaurant queries
OrderSchema.index({ restaurant: 1, createdAt: -1 });
OrderSchema.index({ restaurant: 1, status: 1 });

// 🔥 Index for delivery partner queries
OrderSchema.index({ deliveryPartner: 1, status: 1 });
OrderSchema.index({ status: 1, deliveryPartner: 1 }); // For available pool

// Generate unique order ID before saving
OrderSchema.pre("save", async function () {
    if (!this.orderId) {
        this.orderId = `SF-${Date.now().toString(36).toUpperCase()}`;
    }
});

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
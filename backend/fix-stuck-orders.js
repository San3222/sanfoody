import mongoose from "mongoose";
import "dotenv/config";
import { Order } from "./src/models/Order.model.ts";

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected");

  // Reset any "ready" orders that have delivery partner assigned (they shouldn't)
  const stuckReady = await Order.updateMany(
    { status: "ready", deliveryPartner: { $ne: null } },
    { $set: { deliveryPartner: null, deliveryEarnings: 0 } }
  );
  console.log(`✅ Reset ${stuckReady.modifiedCount} "ready" orders`);

  // Reset any pre-ready orders that were auto-assigned
  const stuckPre = await Order.updateMany(
    {
      status: { $in: ["pending", "confirmed", "preparing"] },
      deliveryPartner: { $ne: null },
    },
    { $set: { deliveryPartner: null, deliveryEarnings: 0 } }
  );
  console.log(`✅ Reset ${stuckPre.modifiedCount} pre-ready orders`);

  // Show final state
  const allOrders = await Order.find().select(
    "orderId status deliveryPartner"
  );
  console.log("\n📋 All Orders:");
  allOrders.forEach((o) => {
    console.log(
      `   ${o.orderId} | ${o.status} | Partner: ${o.deliveryPartner || "NONE"}`
    );
  });

  await mongoose.disconnect();
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
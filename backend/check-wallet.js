import mongoose from "mongoose";
import "dotenv/config";
import { User } from "./src/models/User.model.ts";
import { Wallet } from "./src/models/Wallet.model.ts";
import { WalletTransaction } from "./src/models/WalletTransaction.model.ts";

async function check() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const partner = await User.findOne({ email: "delivery@demo.com" });
  console.log("\n👤 Partner:", partner.name);
  console.log("   Total Earnings:", partner.totalEarnings);
  console.log("   Total Deliveries:", partner.totalDeliveries);

  const wallet = await Wallet.findOne({ user: partner._id });
  console.log("\n💰 Wallet Balance:", wallet?.balance || 0);

  const transactions = await WalletTransaction.find({ user: partner._id })
    .sort({ createdAt: -1 })
    .limit(10);
  console.log("\n📋 Recent Transactions:");
  transactions.forEach((t) => {
    console.log(`   ${t.type === "credit" ? "➕" : "➖"} ₹${t.amount} — ${t.description}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

check().catch(console.error);
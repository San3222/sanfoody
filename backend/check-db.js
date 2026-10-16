import mongoose from "mongoose";
import "dotenv/config";
import { User } from "./src/models/User.model.ts";
import { Restaurant } from "./src/models/Restaurant.model.ts";

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // 1. Check restaurant owners
  const owners = await User.find({ role: "restaurant" }).select("name email _id");
  console.log("\n📋 Restaurant Owners:", owners.length);
  owners.forEach((o) => console.log("  -", o.email, "| _id:", o._id.toString()));

  // 2. For each owner, check if they have a restaurant
  for (const owner of owners) {
    const restaurant = await Restaurant.findOne({ owner: owner._id });
    console.log(`\n🔍 Owner: ${owner.email}`);
    console.log(`   Restaurant:`, restaurant ? restaurant.name : "❌ NONE");
  }

  // 3. Total counts
  const totalUsers = await User.countDocuments();
  const totalRestaurants = await Restaurant.countDocuments();

  console.log("\n📊 Counts:");
  console.log("   Users:", totalUsers);
  console.log("   Restaurants:", totalRestaurants);

  await mongoose.disconnect();
  process.exit(0);
}

check().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
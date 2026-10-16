import mongoose from "mongoose";
import { env } from "./config/env.js";
import { Category } from "./models/Category.model.js";
import { Restaurant } from "./models/Restaurant.model.js";
import { MenuItem } from "./models/MenuItem.model.js";
import { User } from "./models/User.model.js";
import { Coupon } from "./models/Coupon.model.js";
import { Offer } from "./models/Offer.model.js";


const seedData = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("📦 Connected to MongoDB for seeding");

        // 1. Categories
        await Category.deleteMany({});
        const categories = [
            { name: "Pizza", emoji: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Burgers", emoji: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Noodles", emoji: "🍜", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Sushi", emoji: "🍣", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Mexican", emoji: "🌮", image: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Chicken", emoji: "🍗", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Healthy", emoji: "🥗", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Desserts", emoji: "🍰", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&h=300&q=80" },
            { name: "Drinks", emoji: "☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&h=300&q=80" },
        ];
        await Category.insertMany(categories);
        console.log("✅ Categories seeded");

        // ===================================================================================================================
        // 2. Restaurant Owner (Demo)
        // ===================================================================================================================
        await User.deleteMany({ role: "restaurant" });
        const owner1 = await User.create({
            name: "Rajesh Kumar",
            email: "owner@demo.com",
            password: "password123",
            role: "restaurant",
        });

        const owner2 = await User.create({
            name: "Priya Sharma",
            email: "priya@demo.com",
            password: "password123",
            role: "restaurant",
        });

        console.log("✅ Restaurant Owners seeded (2)");



        // ===================================================================================================================
        // 🔥 Add Delivery Partner
        // ===================================================================================================================
        await User.deleteMany({ role: "delivery" });
        const deliveryPartner = await User.create({
            name: "Suresh Kumar",
            email: "delivery@demo.com",
            password: "password123",
            role: "delivery",
            phone: "+91 98765 12345",
            status: "online",
            isActive: true,
            vehicleType: "bike",
            vehicleNumber: "MH-01-AB-1234",
            totalDeliveries: 0,
            totalEarnings: 0,
            rating: 5.0,
            currentLoad: 0,
        });
        console.log("✅ Delivery Partner seeded");


        // ===================================================================================================================
        // 🔥 Add Admin User
        // ===================================================================================================================
        const existingAdmin = await User.findOne({ email: "admin@demo.com" });
        if (!existingAdmin) {
            await User.create({
                name: "Admin User",
                email: "admin@demo.com",
                password: "password123",
                role: "admin",
            });
            console.log("✅ Admin user seeded");
        } else {
            console.log("ℹ️ Admin user already exists");
        }




        // 3. Restaurants
        // 3. Restaurants — Multi-city
        await Restaurant.deleteMany({});
        const restaurants = [
            // ============================================
            // MUMBAI
            // ============================================
            {
                owner: owner1._id,
                name: "The Bombay Bistro",
                description: "North Indian & Chinese cuisine in the heart of Wadala",
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["North Indian", "Chinese"],
                address: "Wadala, Mumbai",
                city: "Mumbai",
                state: "Maharashtra",
                location: { type: "Point", coordinates: [72.8777, 19.0178] },
                rating: 4.7,
                reviewCount: 1200,
                deliveryTime: "25-30 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 40,
                minOrderValue: 99,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "09:00",
                    closingTime: "23:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 20,
                commissionRate: 15,
            },
            {
                owner: owner2._id,
                name: "Sakura House",
                description: "Authentic Japanese sushi and ramen",
                image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["Japanese", "Sushi"],
                address: "Bandra, Mumbai",
                city: "Mumbai",
                state: "Maharashtra",
                location: { type: "Point", coordinates: [72.8211, 19.0596] },
                rating: 4.9,
                reviewCount: 940,
                deliveryTime: "30-35 min",
                priceRange: "₹₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 60,
                minOrderValue: 199,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "11:00",
                    closingTime: "23:30",
                    weeklyOff: [0],
                },
                prepTimeMinutes: 25,
                commissionRate: 18,
            },
            {
                owner: owner2._id,
                name: "Smoke & Grill Co.",
                description: "American burgers and BBQ",
                image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["American", "Burgers"],
                address: "Dadar, Mumbai",
                city: "Mumbai",
                state: "Maharashtra",
                location: { type: "Point", coordinates: [72.8377, 19.0178] },
                rating: 4.6,
                reviewCount: 680,
                deliveryTime: "20-25 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 50,
                minOrderValue: 149,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "10:00",
                    closingTime: "23:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 18,
                commissionRate: 15,
            },

            // ============================================
            // DELHI
            // ============================================
            {
                owner: owner1._id,
                name: "Delhi Darbar",
                description: "Authentic North Indian and Mughlai cuisine",
                image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["North Indian", "Mughlai"],
                address: "Connaught Place, New Delhi",
                city: "Delhi",
                state: "Delhi",
                location: { type: "Point", coordinates: [77.2167, 28.6139] },
                rating: 4.8,
                reviewCount: 2100,
                deliveryTime: "25-30 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 40,
                minOrderValue: 99,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "09:00",
                    closingTime: "23:30",
                    weeklyOff: [],
                },
                prepTimeMinutes: 20,
                commissionRate: 15,
            },
            {
                owner: owner2._id,
                name: "Chandni Chowk Chaat",
                description: "Delhi's iconic street food experience",
                image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["Street Food", "Snacks"],
                address: "Chandni Chowk, Old Delhi",
                city: "Delhi",
                state: "Delhi",
                location: { type: "Point", coordinates: [77.2302, 28.6562] },
                rating: 4.7,
                reviewCount: 1850,
                deliveryTime: "20-25 min",
                priceRange: "₹",
                isVeg: true,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 30,
                minOrderValue: 79,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "10:00",
                    closingTime: "22:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 15,
                commissionRate: 12,
            },
            {
                owner: owner1._id,
                name: "Punjabi Rasoi",
                description: "Hearty Punjabi meals, tandoor specials",
                image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d5?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["Punjabi", "North Indian"],
                address: "Karol Bagh, New Delhi",
                city: "Delhi",
                state: "Delhi",
                location: { type: "Point", coordinates: [77.1891, 28.6517] },
                rating: 4.6,
                reviewCount: 1400,
                deliveryTime: "30-35 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: false,
                isOpen: true,
                isVerified: true,
                deliveryFee: 45,
                minOrderValue: 149,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "11:00",
                    closingTime: "23:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 25,
                commissionRate: 15,
            },

            // ============================================
            // BANGALORE
            // ============================================
            {
                owner: owner2._id,
                name: "Bangalore Brew House",
                description: "Craft coffee and continental breakfast",
                image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["Continental", "Cafe"],
                address: "Indiranagar, Bangalore",
                city: "Bangalore",
                state: "Karnataka",
                location: { type: "Point", coordinates: [77.6408, 12.9784] },
                rating: 4.8,
                reviewCount: 1600,
                deliveryTime: "20-25 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 40,
                minOrderValue: 149,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "07:00",
                    closingTime: "23:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 15,
                commissionRate: 15,
            },
            {
                owner: owner1._id,
                name: "Dosa Plaza",
                description: "Authentic South Indian dosas and idlis",
                image: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["South Indian", "Breakfast"],
                address: "Koramangala, Bangalore",
                city: "Bangalore",
                state: "Karnataka",
                location: { type: "Point", coordinates: [77.6245, 12.9352] },
                rating: 4.7,
                reviewCount: 2200,
                deliveryTime: "15-20 min",
                priceRange: "₹",
                isVeg: true,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 30,
                minOrderValue: 79,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "06:30",
                    closingTime: "22:00",
                    weeklyOff: [],
                },
                prepTimeMinutes: 12,
                commissionRate: 12,
            },
            {
                owner: owner2._id,
                name: "Biryani Zone",
                description: "Hyderabadi-style biryani in the heart of Bangalore",
                image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&h=600&q=80",
                cuisine: ["Biryani", "Mughlai"],
                address: "HSR Layout, Bangalore",
                city: "Bangalore",
                state: "Karnataka",
                location: { type: "Point", coordinates: [77.6408, 12.9116] },
                rating: 4.6,
                reviewCount: 1750,
                deliveryTime: "30-35 min",
                priceRange: "₹₹",
                isVeg: false,
                hasOffer: true,
                isOpen: true,
                isVerified: true,
                deliveryFee: 50,
                minOrderValue: 199,
                availability: {
                    isAcceptingOrders: true,
                    openingTime: "11:00",
                    closingTime: "23:30",
                    weeklyOff: [],
                },
                prepTimeMinutes: 30,
                commissionRate: 18,
            },
        ];
        const insertedRestaurants = await Restaurant.insertMany(restaurants);
        console.log(`✅ Restaurants seeded (${insertedRestaurants.length}, multi-city)`);


        // 4. Menu Items
        // 4. Menu Items — Multi-city restaurants
        await MenuItem.deleteMany({});
        const menuItems = [];

        // Helper: find restaurant by name
        const getRestaurantId = (name: string) => {
            const r = insertedRestaurants.find((r) => r.name === name);
            return r!._id;
        };

        // Mumbai - Bombay Bistro menu
        const bistroId = getRestaurantId("The Bombay Bistro");
        menuItems.push(
            { restaurantId: bistroId, name: "Butter Chicken", description: "Creamy tomato gravy with tender chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&h=600&q=80", price: 399, category: "Main Course", isVeg: false, isAvailable: true, rating: 4.8 },
            { restaurantId: bistroId, name: "Garlic Naan", description: "Tandoor-baked bread with garlic butter", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&h=600&q=80", price: 89, category: "Bread", isVeg: true, isAvailable: true, rating: 4.6 },
            { restaurantId: bistroId, name: "Paneer Tikka", description: "Charred cottage cheese with spices", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d5?auto=format&fit=crop&w=600&h=600&q=80", price: 249, category: "Starters", isVeg: true, isAvailable: true, rating: 4.7 },
        );

        // Mumbai - Sakura House
        const sakuraId = getRestaurantId("Sakura House");
        menuItems.push(
            { restaurantId: sakuraId, name: "Salmon Sushi Platter", description: "Fresh sushi-grade salmon", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&h=600&q=80", price: 449, category: "Sushi", isVeg: false, isAvailable: true, rating: 4.9 },
            { restaurantId: sakuraId, name: "Dragon Roll", description: "Eel, avocado, unagi glaze", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&h=600&q=80", price: 499, category: "Sushi", isVeg: false, isAvailable: true, rating: 4.8 },
            { restaurantId: sakuraId, name: "Veg Tempura Roll", description: "Crispy tempura vegetables", image: "https://images.unsplash.com/photo-1617196034183-421b4917bb92?auto=format&fit=crop&w=600&h=600&q=80", price: 349, category: "Sushi", isVeg: true, isAvailable: true, rating: 4.5 },
        );

        // Mumbai - Smoke & Grill
        const grillId = getRestaurantId("Smoke & Grill Co.");
        menuItems.push(
            { restaurantId: grillId, name: "Double Smash Burger", description: "Charred beef patties, cheddar", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=600&q=80", price: 349, category: "Burgers", isVeg: false, isAvailable: true, rating: 4.7 },
            { restaurantId: grillId, name: "Classic Cheeseburger", description: "Single patty, house sauce", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&h=600&q=80", price: 269, category: "Burgers", isVeg: false, isAvailable: true, rating: 4.6 },
            { restaurantId: grillId, name: "Veg Supreme Burger", description: "Grilled veg patty, slaw", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&h=600&q=80", price: 239, category: "Burgers", isVeg: true, isAvailable: true, rating: 4.4 },
        );

        // Delhi - Delhi Darbar
        const darbarId = getRestaurantId("Delhi Darbar");
        menuItems.push(
            { restaurantId: darbarId, name: "Butter Chicken", description: "Signature Delhi-style butter chicken", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&h=600&q=80", price: 449, category: "Main Course", isVeg: false, isAvailable: true, rating: 4.9 },
            { restaurantId: darbarId, name: "Mutton Rogan Josh", description: "Kashmiri-style slow-cooked mutton", image: "https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&h=600&q=80", price: 549, category: "Main Course", isVeg: false, isAvailable: true, rating: 4.8 },
            { restaurantId: darbarId, name: "Paneer Butter Masala", description: "Creamy tomato paneer curry", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&h=600&q=80", price: 349, category: "Main Course", isVeg: true, isAvailable: true, rating: 4.7 },
        );

        // Delhi - Chandni Chowk Chaat
        const chaatId = getRestaurantId("Chandni Chowk Chaat");
        menuItems.push(
            { restaurantId: chaatId, name: "Pani Puri", description: "Crispy puris with tangy water", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&h=600&q=80", price: 79, category: "Chaat", isVeg: true, isAvailable: true, rating: 4.8 },
            { restaurantId: chaatId, name: "Aloo Tikki", description: "Crispy potato patties with chutney", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80", price: 99, category: "Chaat", isVeg: true, isAvailable: true, rating: 4.7 },
            { restaurantId: chaatId, name: "Dahi Bhalla", description: "Lentil dumplings in yogurt", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&h=600&q=80", price: 109, category: "Chaat", isVeg: true, isAvailable: true, rating: 4.6 },
        );

        // Delhi - Punjabi Rasoi
        const punjabiId = getRestaurantId("Punjabi Rasoi");
        menuItems.push(
            { restaurantId: punjabiId, name: "Amritsari Kulcha", description: "Stuffed kulcha with chole", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d5?auto=format&fit=crop&w=600&h=600&q=80", price: 199, category: "Main Course", isVeg: true, isAvailable: true, rating: 4.7 },
            { restaurantId: punjabiId, name: "Sarson da Saag", description: "Mustard greens with makki roti", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=600&q=80", price: 249, category: "Main Course", isVeg: true, isAvailable: true, rating: 4.6 },
            { restaurantId: punjabiId, name: "Chicken Tikka", description: "Tandoor-grilled spiced chicken", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&h=600&q=80", price: 299, category: "Starters", isVeg: false, isAvailable: true, rating: 4.8 },
        );

        // Bangalore - Bangalore Brew House
        const brewId = getRestaurantId("Bangalore Brew House");
        menuItems.push(
            { restaurantId: brewId, name: "Cappuccino", description: "Double shot, micro-foamed milk", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&h=600&q=80", price: 179, category: "Coffee", isVeg: true, isAvailable: true, rating: 4.7 },
            { restaurantId: brewId, name: "Avocado Toast", description: "Sourdough with smashed avocado", image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=600&h=600&q=80", price: 249, category: "Breakfast", isVeg: true, isAvailable: true, rating: 4.6 },
            { restaurantId: brewId, name: "Full English Breakfast", description: "Eggs, bacon, toast, beans", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&h=600&q=80", price: 349, category: "Breakfast", isVeg: false, isAvailable: true, rating: 4.8 },
        );

        // Bangalore - Dosa Plaza
        const dosaId = getRestaurantId("Dosa Plaza");
        menuItems.push(
            { restaurantId: dosaId, name: "Masala Dosa", description: "Crispy dosa with spiced potato", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&h=600&q=80", price: 129, category: "Dosa", isVeg: true, isAvailable: true, rating: 4.8 },
            { restaurantId: dosaId, name: "Rava Idli", description: "Steamed semolina cakes", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&h=600&q=80", price: 99, category: "Idli", isVeg: true, isAvailable: true, rating: 4.6 },
            { restaurantId: dosaId, name: "Filter Coffee", description: "Authentic South Indian filter coffee", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=600&q=80", price: 49, category: "Beverages", isVeg: true, isAvailable: true, rating: 4.9 },
        );

        // Bangalore - Biryani Zone
        const biryaniId = getRestaurantId("Biryani Zone");
        menuItems.push(
            { restaurantId: biryaniId, name: "Hyderabadi Chicken Biryani", description: "Dum-cooked with saffron rice", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&h=600&q=80", price: 399, category: "Biryani", isVeg: false, isAvailable: true, rating: 4.8 },
            { restaurantId: biryaniId, name: "Veg Dum Biryani", description: "Fragrant basmati with vegetables", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&h=600&q=80", price: 299, category: "Biryani", isVeg: true, isAvailable: true, rating: 4.6 },
            { restaurantId: biryaniId, name: "Mutton Biryani", description: "Tender mutton with spiced rice", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&h=600&q=80", price: 499, category: "Biryani", isVeg: false, isAvailable: true, rating: 4.9 },
        );

        await MenuItem.insertMany(menuItems);
        console.log(`✅ Menu Items seeded (${menuItems.length})`);



        // 5. Coupons

        await Coupon.deleteMany({});
        const coupons = [
            { code: "SANFOODY40", discountPercent: 40, maxDiscount: 150, minOrder: 499, validUntil: new Date("2026-12-31"), isActive: true },
            { code: "FLAT100", discountPercent: 0, maxDiscount: 100, minOrder: 299, validUntil: new Date("2026-12-31"), isActive: true },
            { code: "BOGO1", discountPercent: 50, maxDiscount: 250, minOrder: 399, validUntil: new Date("2026-12-31"), isActive: true },
            { code: "GREENFREE", discountPercent: 0, maxDiscount: 40, minOrder: 199, validUntil: new Date("2026-12-31"), isActive: true },
        ];
        await Coupon.insertMany(coupons);
        console.log("✅ Coupons seeded");




        // 6. Offers
        await Offer.deleteMany({});
        const offers = [
            {
                restaurantId: insertedRestaurants[0]!._id,
                title: "40% OFF",
                description: "Enjoy 40% off on your first order",
                discountPercent: 40,
                maxDiscount: 150,
                minOrder: 499,
                couponCode: "SANFOODY40",
                validUntil: new Date("2026-12-31"),
                isActive: true,
                isExclusive: false,
                isNew: true,
                image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&h=400&q=80",
                discountTags: ["flat-100"],
                occasionTags: ["family"],
            },
            {
                restaurantId: insertedRestaurants[1]!._id,
                title: "25% OFF",
                description: "Special discount on sushi platters",
                discountPercent: 25,
                maxDiscount: 300,
                minOrder: 999,
                couponCode: "SAKURA25",
                validUntil: new Date("2026-12-31"),
                isActive: true,
                isExclusive: true,
                isNew: false,
                image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=600&h=400&q=80",
                discountTags: ["flat-100"],
                occasionTags: ["date-night"],
            },
            {
                restaurantId: insertedRestaurants[2]!._id,
                title: "Buy 1 Get 1",
                description: "Buy one burger, get one free",
                discountPercent: 50,
                maxDiscount: 250,
                minOrder: 399,
                couponCode: "BOGO1",
                validUntil: new Date("2026-12-31"),
                isActive: true,
                isExclusive: false,
                isNew: false,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&h=400&q=80",
                discountTags: ["bogo"],
                occasionTags: ["weekend"],
            },
        ];

        await Offer.insertMany(offers);
        console.log("✅ Offers seeded");




        console.log("🎉 Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
// import { categories, type FoodCategory } from '@/data/categories'
// import { foods, type FoodItem } from '@/data/foods'
// import { restaurants, type Restaurant } from '@/data/restaurants'
// import { brands, flavors, getBrandsByCategory, getFlavorsByBrand, getBrandById, type Brand, type FlavorItem } from '@/data/menu'

// // ---------------------------------------------------------------------------
// // Mock network layer.
// //
// // Every function here returns a Promise, exactly like a real fetch() call
// // would. Right now they resolve from the static files in `src/data/` after a
// // small artificial delay (so loading states / skeletons are visible and
// // testable). When a real backend exists, replace each function body with an
// // actual `fetch('/api/...')` call — nothing outside this file needs to
// // change, because every page reads through React Query hooks that call
// // these functions, not the data files directly.
// // ---------------------------------------------------------------------------

// const NETWORK_DELAY_MS = 450

// function resolveAfterDelay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
//     return new Promise((resolve) => setTimeout(() => resolve(value), ms))
// }

// export async function fetchCategories(): Promise<FoodCategory[]> {
//     return resolveAfterDelay(categories)
// }

// export async function fetchFoods(): Promise<FoodItem[]> {
//     return resolveAfterDelay(foods)
// }

// export async function fetchRestaurants(): Promise<Restaurant[]> {
//     return resolveAfterDelay(restaurants)
// }

// export async function fetchBrandsByCategory(categoryId: string): Promise<Brand[]> {
//     return resolveAfterDelay(getBrandsByCategory(categoryId))
// }

// export async function fetchBrandById(brandId: string): Promise<Brand | undefined> {
//     return resolveAfterDelay(getBrandById(brandId))
// }

// export async function fetchFlavorsByBrand(brandId: string): Promise<FlavorItem[]> {
//     return resolveAfterDelay(getFlavorsByBrand(brandId))
// }

// export async function fetchAllBrands(): Promise<Brand[]> {
//     return resolveAfterDelay(brands)
// }

// export async function fetchAllFlavors(): Promise<FlavorItem[]> {
//     return resolveAfterDelay(flavors)
// }

// // ---------------------------------------------------------------------------
// // Mock mutations — checkout & auth. Same idea: swap the body for a real
// // POST later, callers (React Query `useMutation`) don't change.
// // ---------------------------------------------------------------------------

// export interface PlaceOrderInput {
//     items: { id: string; name: string; price: number; quantity: number }[]
//     address: string
//     paymentMethod: 'card' | 'upi' | 'cod'
//     total: number
// }

// export interface PlaceOrderResult {
//     orderId: string
//     estimatedMinutes: number
// }

// export async function placeOrder(_input: PlaceOrderInput): Promise<PlaceOrderResult> {
//     const orderId = `SF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
//     // Real version, later:
//     // const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify(input) })
//     // return res.json()
//     return resolveAfterDelay(
//         { orderId, estimatedMinutes: 25 + Math.floor(Math.random() * 15) },
//         700,
//     )
// }

// // 🔥 ROLE TYPE ADD KARO
// export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin'

// export interface MockUser {
//     avatar?: string  // 🔥 Optional bana diya
//     id: string
//     name: string
//     email: string
//     role?: UserRole
// }

// // 🔥 mockLogin mein role parameter add karo
// export async function mockLogin(
//     email: string,
//     _password: string,
//     role: UserRole = 'customer'  // 🔥 Default role customer
// ): Promise<MockUser> {
//     return resolveAfterDelay(
//         {
//             id: 'u_1',
//             name: email.split('@')[0] || 'Guest',
//             email,
//             role  // 🔥 Role pass karo
//         },
//         500
//     )
// }

// // 🔥 mockSignup mein bhi role add karo
// export async function mockSignup(
//     name: string,
//     email: string,
//     _password: string,
//     role: UserRole = 'customer'  // 🔥 Default role customer
// ): Promise<MockUser> {
//     return resolveAfterDelay(
//         {
//             id: 'u_1',
//             name,
//             email,
//             role  // 🔥 Role pass karo
//         },
//         500
//     )
// }




// export interface AdminAnalytics {
//   totalRevenue: number
//   totalOrders: number
//   totalUsers: number
//   totalRestaurants: number
//   revenueByMonth: { month: string; revenue: number }[]
//   topRestaurants: { name: string; orders: number; revenue: number }[]
// }

// export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
//   // Real backend ke liye:
//   // const res = await fetch('/api/admin/analytics')
//   // return res.json()

//   // Abhi mock data:
//   return resolveAfterDelay({
//     totalRevenue: 1245000,
//     totalOrders: 15230,
//     totalUsers: 10240,
//     totalRestaurants: 125,
//     revenueByMonth: [
//       { month: 'Jan', revenue: 85000 },
//       { month: 'Feb', revenue: 92000 },
//       // ... baaki months
//     ],
//     topRestaurants: [
//       { name: 'The Bombay Bistro', orders: 1520, revenue: 250000 },
//       // ... baaki
//     ],
//   }, 500)
// }







import type { FoodCategory } from '@/data/categories'
import type { FoodItem } from '@/data/foods'
import type { Restaurant } from '@/data/restaurants'
// 🔥 Order import hata diya

// const API_BASE_URL = "http://localhost:5000/api/v1";
const API_BASE_URL = "/api/v1"; // Proxy use karne ke liye

// Helper function for API calls
// async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
//   const token = localStorage.getItem("sanfoody:token");

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...(options?.headers || {}),
//     },
//     credentials: "include",
//     ...options,
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || "API request failed");
//   }

//   return data.data;
// }

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // 🔥 Token ko localStorage se read karo
  const token = localStorage.getItem("sanfoody:token");

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  // 🔥 sirf tab Content-Type set karo jab body actually present ho
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  // 🔥 429 Error Handling
  if (response.status === 429) {
    console.warn('Rate limit exceeded. Waiting 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Retry ek baar
    return apiFetch(endpoint, options);
  }


  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data.data;
}

// ============================================
// Auth APIs
// ============================================

// 🔥 YEH ADD KARO (UserRole Type)
export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin'

// 🔥 YEH ADD KARO (MockUser Type)
export interface MockUser {
  _id?: string
  id: string
  name: string
  email: string
  role?: UserRole
  avatar?: string
  phone?: string
  referralCode?: string
  referralEarnings?: number
  walletBalance?: number
}

export async function registerUser(payload: {
  name: string
  email: string
  password: string
  role?: string
  phone?: string
  restaurantDetails?: any
  deliveryDetails?: any
}) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function loginUser(email: string, password: string) {
  const data = await apiFetch<{ user: any; accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Save token to localStorage
  localStorage.setItem("sanfoody:token", data.accessToken);
  localStorage.setItem("sanfoody:user", JSON.stringify(data.user));

  return data;
}

export async function logoutUser() {
  const data = await apiFetch("/auth/logout", { method: "POST" });
  localStorage.removeItem("sanfoody:token");
  localStorage.removeItem("sanfoody:user");
  return data;
}

export async function getCurrentUser() {
  return apiFetch("/auth/me");
}

// ============================================
// Restaurant APIs
// ============================================

export async function fetchRestaurants(filters?: {
  cuisine?: string
  rating?: number
  search?: string
  city?: string
}): Promise<any[]> {
  const params = new URLSearchParams()
  if (filters?.city) params.append('city', filters.city)
  if (filters?.cuisine) params.append('cuisine', filters.cuisine)
  if (filters?.search) params.append('search', filters.search)

  const qs = params.toString()
  return apiFetch(`/restaurants${qs ? `?${qs}` : ''}`)
}

export async function fetchRestaurantById(id: string): Promise<Restaurant> {
  return apiFetch(`/restaurants/${id}`);
}

export async function fetchNearbyRestaurants(lat: number, lng: number) {
  return apiFetch(`/restaurants/nearby?lat=${lat}&lng=${lng}`);
}

export async function fetchRestaurantMenu(restaurantId: string): Promise<FoodItem[]> {
  return apiFetch(`/restaurants/${restaurantId}/menu`);
}

// ============================================
// Menu APIs
// ============================================

export async function fetchAllMenuItems(filters?: {
  category?: string;
  isVeg?: boolean;
  search?: string;
}): Promise<FoodItem[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.isVeg) params.append("isVeg", filters.isVeg.toString());
  if (filters?.search) params.append("search", filters.search);

  const queryString = params.toString();
  return apiFetch(`/menu${queryString ? `?${queryString}` : ""}`);
}

export async function fetchMenuByRestaurant(restaurantId: string): Promise<FoodItem[]> {
  return apiFetch(`/menu/${restaurantId}`);
}



// ============================================
// ORDER APIs
// ============================================

// Client.ts mein

export async function createOrder(orderData: {
  restaurantId: string;
  items: { menuItemId: string; name: string; price: number; quantity: number }[];
  address: string;
  paymentMethod: "card" | "upi" | "cod";
  razorpayOrderId?: string;      // 🔥 add
  razorpayPaymentId?: string;    // 🔥 add
}): Promise<{ orderId: string; estimatedDelivery: string; total: number }> {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

// ✅ Agar `restaurantId` nahi pata, toh cart se le lo
export async function placeOrderFromCart(
  restaurantId: string,
  items: { menuItemId: string; name: string; price: number; quantity: number }[],
  address: string,
  paymentMethod: "card" | "upi" | "cod"
) {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({ restaurantId, items, address, paymentMethod }),
  });
}

export async function fetchUserOrders(page = 1, limit = 10): Promise<any> {
  return apiFetch(`/orders?page=${page}&limit=${limit}`);
}

export async function fetchOrderById(id: string) {
  return apiFetch(`/orders/${id}`);
}


export async function cancelOrder(orderId: string) {
  return apiFetch(`/orders/${orderId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({}), // 🔥 empty object bhejo taaki Content-Type: application/json ke saath valid JSON body ho
  });
}
// ============================================
// Category APIs
// ============================================

export async function fetchCategories(): Promise<FoodCategory[]> {
  return apiFetch("/categories");
}

// ============================================
// Coupon APIs
// ============================================

export interface Coupon {
  _id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  validUntil: string;
  isActive: boolean;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  return apiFetch("/coupons");
}

export async function applyCoupon(couponCode: string, orderTotal: number) {
  return apiFetch("/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ couponCode, orderTotal }),
  });
}



// ============================================
// Offer APIs
// ============================================

export interface Offer {
  discountTags: never[];
  occasionTags: never[];
  _id: string;
  restaurantId: any;
  title: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  couponCode: string;
  validUntil: string;
  isActive: boolean;
  isExclusive: boolean;
  isNew: boolean;
  image: string;
}

export async function fetchAllOffers(): Promise<Offer[]> {
  return apiFetch("/offers");
}

export async function fetchOfferById(id: string): Promise<Offer> {
  return apiFetch(`/offers/${id}`);
}

export async function fetchOffersByRestaurant(restaurantId: string): Promise<Offer[]> {
  return apiFetch(`/offers/restaurant/${restaurantId}`);
}


// ============================================
// PAYMENT APIs
// ============================================

export async function createRazorpayOrder(amount: number) {
  return apiFetch("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiFetch("/payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// ============================================
// Wallet APIs
// ============================================

export interface WalletTransaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

export async function fetchWallet(): Promise<WalletData> {
  return apiFetch("/wallet");
}

export async function addMoneyToWallet(
  amount: number
): Promise<{ balance: number; transaction: WalletTransaction }> {
  return apiFetch("/wallet/add-money", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}


// ============================================
// SEARCH API
// ============================================

export interface SearchResults {
  restaurants: any[];
  menuItems: any[];
  offers: any[];
}

export async function searchAll(query: string, type?: string): Promise<SearchResults> {
  const params = new URLSearchParams();
  params.append('q', query);
  if (type) params.append('type', type);

  return apiFetch(`/search?${params.toString()}`);
}



// ============================================
// ADDRESS APIs
// ============================================

export interface Address {
  _id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export async function fetchAddresses(): Promise<Address[]> {
  return apiFetch("/addresses");
}

export async function createAddress(data: {
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}): Promise<Address> {
  return apiFetch("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(id: string, data: Partial<Address>): Promise<Address> {
  return apiFetch(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  return apiFetch(`/addresses/${id}`, { method: "DELETE" });
}

export async function setDefaultAddress(id: string): Promise<void> {
  return apiFetch(`/addresses/${id}/default`, { method: "PATCH" });
}


// ============================================
// REVIEW APIs
// ============================================

export interface Review {
  helpful: number;
  _id: string;
  userId: any;
  restaurantId: any;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface ReviewResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchRestaurantReviews(restaurantId: string, page = 1, limit = 10): Promise<ReviewResponse> {
  return apiFetch(`/reviews/restaurant/${restaurantId}?page=${page}&limit=${limit}`);
}

export async function createReview(data: {
  restaurantId: string;
  orderId?: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}): Promise<Review> {
  return apiFetch("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReview(id: string, data: Partial<Review>): Promise<Review> {
  return apiFetch(`/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string): Promise<void> {
  return apiFetch(`/reviews/${id}`, { method: "DELETE" });
}

export async function fetchUserReviews(): Promise<Review[]> {
  return apiFetch("/reviews/user");
}


// ============================================
// NOTIFICATION APIs
// ============================================

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'promotion' | 'system';
  isRead: boolean;
  actionUrl?: string;        // ✅ Just a URL string
  createdAt: string;
}

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  return apiFetch("/notifications");
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsAsRead(): Promise<void> {
  return apiFetch("/notifications/read-all", { method: "PATCH" });
}


// ============================================
// FAVORITE APIs
// ============================================

export async function fetchFavorites(): Promise<any[]> {
  return apiFetch("/favorites");
}

export async function toggleFavorite(itemType: string, itemId: string): Promise<{ isFavorite: boolean }> {
  return apiFetch("/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ itemType, itemId }),
  });
}

export async function checkIsFavorite(itemType: string, itemId: string): Promise<{ isFavorite: boolean }> {
  return apiFetch(`/favorites/check?itemType=${itemType}&itemId=${itemId}`);
}

export async function removeFavorite(itemType: string, itemId: string): Promise<void> {
  return apiFetch("/favorites", {
    method: "DELETE",
    body: JSON.stringify({ itemType, itemId }),
  });
}


// ============================================
// Cancellation Policy API
// ============================================

export interface CancellationPolicy {
  freeCancellationMinutes: number;
  midCancellationFeePercent: number;
  midCancellationMinutes: number;
  lateCancellationFeePercent: number;
}

export async function fetchCancellationPolicy(): Promise<CancellationPolicy> {
  return apiFetch("/orders/cancellation-policy");
}



// ============================================
// DELIVERY APIs
// ============================================

export async function updateDeliveryLocation(orderId: string, latitude: number, longitude: number) {
  return apiFetch("/delivery/location", {
    method: "POST",
    body: JSON.stringify({ orderId, latitude, longitude }),
  });
}

export async function getDeliveryLocation(orderId: string) {
  return apiFetch(`/delivery/location/${orderId}`);
}

// ============================================
// REFERRAL APIs
// ============================================

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  referrals: any[];
}

export async function generateReferralCode(): Promise<{ referralCode: string }> {
  return apiFetch("/referrals/generate", { method: "POST" });
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  return apiFetch("/referrals/stats");
}

export async function applyReferralCode(referralCode: string): Promise<any> {
  return apiFetch("/referrals/apply", {
    method: "POST",
    body: JSON.stringify({ referralCode }),
  });
}


// ============================================
// CHAT APIs
// ============================================

export interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: 'customer' | 'support';
  message: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  customerId: string;
  subject: string;
  status: 'open' | 'closed';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export async function createChat(subject: string, message: string): Promise<Chat> {
  return apiFetch("/chats", {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
}

export async function fetchUserChats(): Promise<Chat[]> {
  return apiFetch("/chats");
}

export async function fetchChatById(id: string): Promise<Chat> {
  return apiFetch(`/chats/${id}`);
}

export async function sendChatMessage(id: string, message: string): Promise<Chat> {
  return apiFetch(`/chats/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}


// import { useQuery } from '@tanstack/react-query'
// import {
//   fetchAdminAnalytics,
//   fetchAllFlavors,
//   fetchBrandById,
//   fetchBrandsByCategory,
//   fetchCategories,
//   fetchFlavorsByBrand,
//   fetchFoods,
//   fetchRestaurants,
// } from '@/api/Client'

// export function useCategories() {
//   return useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
// }

// export function useFoods() {
//   return useQuery({ queryKey: ['foods'], queryFn: fetchFoods })
// }

// export function useRestaurants() {
//   return useQuery({ queryKey: ['restaurants'], queryFn: fetchRestaurants })
// }

// export function useBrandsByCategory(categoryId: string | undefined) {
//   return useQuery({
//     queryKey: ['brands', 'byCategory', categoryId],
//     queryFn: () => fetchBrandsByCategory(categoryId as string),
//     enabled: !!categoryId,
//   })
// }

// export function useBrand(brandId: string | undefined) {
//   return useQuery({
//     queryKey: ['brand', brandId],
//     queryFn: () => fetchBrandById(brandId as string),
//     enabled: !!brandId,
//   })
// }

// export function useAllFlavors() {
//   return useQuery({ queryKey: ['flavors', 'all'], queryFn: fetchAllFlavors })
// }

// export function useFlavorsByBrand(brandId: string | undefined) {
//   return useQuery({
//     queryKey: ['flavors', 'byBrand', brandId],
//     queryFn: () => fetchFlavorsByBrand(brandId as string),
//     enabled: !!brandId,
//   })
// }


// export function useAdminAnalytics() {
//   return useQuery({ queryKey: ['admin-analytics'], queryFn: fetchAdminAnalytics })
// }



import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchRestaurants,
  fetchRestaurantById,
  fetchRestaurantMenu,
  fetchAllMenuItems,
  fetchMenuByRestaurant,
  fetchCategories,
  fetchUserOrders,
  fetchOrderById,
  createOrder,
  cancelOrder,
  fetchCoupons,
  type Coupon,
  createRazorpayOrder,
  verifyPayment,
  fetchAllOffers,
  fetchOfferById,
  fetchOffersByRestaurant, type Offer
} from '@/api/Client'
import { fetchWallet, addMoneyToWallet, type WalletData } from '@/api/Client'
import type { FoodCategory } from '@/data/categories'
import type { FoodItem } from '@/data/foods'
import type { Restaurant } from '@/data/restaurants'
import { searchAll, type SearchResults } from '@/api/Client'
import { fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, type Address, } from '@/api/Client'
import { fetchRestaurantReviews, createReview, updateReview, deleteReview, fetchUserReviews, type Review, type ReviewResponse, } from '@/api/Client'
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification, } from '@/api/Client'
import { fetchFavorites, toggleFavorite, checkIsFavorite, removeFavorite, } from '@/api/Client'
import { fetchCancellationPolicy, type CancellationPolicy, } from '@/api/Client'
import { updateDeliveryLocation, getDeliveryLocation, } from '@/api/Client'
import { generateReferralCode, fetchReferralStats, applyReferralCode, type ReferralStats, } from '@/api/Client'
import { createChat, fetchUserChats, fetchChatById, sendChatMessage, type Chat, } from '@/api/Client'

// ============================================
// Restaurant Hooks
// ============================================

export function useRestaurants(filters?: {
  cuisine?: string
  rating?: number
  search?: string
  city?: string
}) {
  return useQuery<Restaurant[]>({
    queryKey: ['restaurants', filters],
    queryFn: () => fetchRestaurants(filters),
  })
}

export function useRestaurant(id: string | undefined) {
  return useQuery<Restaurant>({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id as string),
    enabled: !!id && id !== 'undefined',  // 🔥 Fix
  })
}

export function useRestaurantMenu(restaurantId: string | undefined) {
  return useQuery<FoodItem[]>({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: () => fetchRestaurantMenu(restaurantId as string),
    enabled: !!restaurantId && restaurantId !== 'undefined',  // 🔥 Fix
  })
}

// ============================================
// Menu Hooks
// ============================================

export function useMenuItems(filters?: { category?: string; isVeg?: boolean; search?: string }) {
  return useQuery<FoodItem[]>({
    queryKey: ['menu-items', filters],
    queryFn: () => fetchAllMenuItems(filters),
  })
}

export function useMenuByRestaurant(restaurantId: string | undefined) {
  return useQuery<FoodItem[]>({
    queryKey: ['menu', restaurantId],
    queryFn: () => fetchMenuByRestaurant(restaurantId as string),
    enabled: !!restaurantId,
  })
}

// ============================================
// Category Hooks
// ============================================

export function useCategories() {
  return useQuery<FoodCategory[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })
}

// ============================================
// Order Hooks
// ============================================

export function useUserOrders(page = 1, limit = 10) {
  return useQuery<any>({
    queryKey: ['user-orders', page, limit],
    queryFn: () => fetchUserOrders(page, limit),
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<any>({  // 🔥 Order type ki jagah any use karo
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id as string),
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    },
  })
}

// ============================================
// Coupon Hooks
// ============================================

export function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: fetchCoupons,
  })
}


// 🔥 YE HOOKS ADD KARO (Missing Hooks)
export function useBrandsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: ['brands', 'byCategory', categoryId],
    queryFn: () => fetch(`/api/v1/restaurants?cuisine=${categoryId}`).then((res) => res.json()),
    enabled: !!categoryId,
  })
}

export function useBrand(brandId: string | undefined) {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: () => fetch(`/api/v1/restaurants/${brandId}`).then((res) => res.json()),
    enabled: !!brandId,
  })
}

export function useFlavorsByBrand(brandId: string | undefined) {
  return useQuery({
    queryKey: ['flavors', 'byBrand', brandId],
    queryFn: () => fetch(`/api/v1/restaurants/${brandId}/menu`).then((res) => res.json()),
    enabled: !!brandId,
  })
}

export function useAllFlavors() {
  return useQuery({
    queryKey: ['flavors', 'all'],
    queryFn: () => fetch('/api/v1/menu').then((res) => res.json()),
  })
}







// ============================================
// Offer Hooks
// ============================================

export function useOffers() {
  return useQuery<Offer[]>({
    queryKey: ['offers'],
    queryFn: fetchAllOffers,
  })
}

export function useOffer(id: string | undefined) {
  return useQuery<Offer>({
    queryKey: ['offer', id],
    queryFn: () => fetchOfferById(id as string),
    enabled: !!id,
  })
}

export function useOffersByRestaurant(restaurantId: string | undefined) {
  return useQuery<Offer[]>({
    queryKey: ['offers', 'restaurant', restaurantId],
    queryFn: () => fetchOffersByRestaurant(restaurantId as string),
    enabled: !!restaurantId,
  })
}

// ============================================
// Payment Hooks
// ============================================

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: createRazorpayOrder,
  })
}

export function useVerifyPayment() {
  return useMutation({
    mutationFn: verifyPayment,
  })
}


// ============================================
// Wallet Hooks
// ============================================

export function useWallet() {
  return useQuery<WalletData>({
    queryKey: ['wallet'],
    queryFn: fetchWallet,
  })
}

export function useAddMoney() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addMoneyToWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}

// ============================================
// Search Hook
// ============================================

export function useSearch(query: string, type?: string) {
  return useQuery<SearchResults>({
    queryKey: ['search', query, type],
    queryFn: () => searchAll(query, type),
    enabled: query.trim().length > 0,
  })
}



// ============================================
// Address Hooks
// ============================================

export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}


// ============================================
// Review Hooks
// ============================================

export function useRestaurantReviews(restaurantId: string | undefined, page = 1, limit = 10) {
  return useQuery<ReviewResponse>({
    queryKey: ['reviews', 'restaurant', restaurantId, page, limit],
    queryFn: () => fetchRestaurantReviews(restaurantId as string, page, limit),
    enabled: !!restaurantId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Review> }) =>
      updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useUserReviews() {
  return useQuery<Review[]>({
    queryKey: ['reviews', 'user'],
    queryFn: fetchUserReviews,
  })
}

// ============================================
// Notification Hooks
// ============================================

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; unreadCount: number }>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ============================================
// Favorite Hooks
// ============================================

export function useFavoritesList() {
  return useQuery<any[]>({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: string; itemId: string }) =>
      toggleFavorite(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}

export function useIsFavorite(itemType: string, itemId: string) {
  return useQuery({
    queryKey: ['favorite', itemType, itemId],
    queryFn: () => checkIsFavorite(itemType, itemId),
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemType, itemId }: { itemType: string; itemId: string }) =>
      removeFavorite(itemType, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}


// ============================================
// Cancellation Policy Hook
// ============================================

export function useCancellationPolicy() {
  return useQuery<CancellationPolicy>({
    queryKey: ['cancellation-policy'],
    queryFn: fetchCancellationPolicy,
  })
}


// ============================================
// Delivery Hooks
// ============================================

export function useUpdateDeliveryLocation() {
  return useMutation({
    mutationFn: ({ orderId, latitude, longitude }: { orderId: string; latitude: number; longitude: number }) =>
      updateDeliveryLocation(orderId, latitude, longitude),
  })
}

export function useDeliveryLocation(orderId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-location', orderId],
    queryFn: () => getDeliveryLocation(orderId as string),
    enabled: !!orderId,
    refetchInterval: 5000, // Every 5 seconds refetch
  })
}

// ============================================
// Referral Hooks
// ============================================

export function useGenerateReferralCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateReferralCode,
    onSuccess: () => {
      // 🔥 User data refetch karo
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
    },
  })
}


export function useReferralStats() {
  return useQuery<ReferralStats>({
    queryKey: ['referral-stats'],
    queryFn: fetchReferralStats,
  })
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyReferralCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] })
    },
  })
}

// ============================================
// Chat Hooks
// ============================================

export function useUserChats() {
  return useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: fetchUserChats,
  })
}

export function useChat(id: string | undefined) {
  return useQuery<Chat>({
    queryKey: ['chat', id],
    queryFn: () => fetchChatById(id as string),
    enabled: !!id,
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ subject, message }: { subject: string; message: string }) =>
      createChat(subject, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      sendChatMessage(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat'] })
    },
  })
}
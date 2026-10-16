// src/api/restaurantHooks.ts
// ============================================
// React Query Hooks — Restaurant Owner
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    // Dashboard
    fetchRestaurantStats,
    fetchRestaurantProfile,
    fetchRestaurantAnalytics,
    fetchRestaurantReviews,
    // Orders
    fetchRestaurantOrders,
    fetchRestaurantOrderById,
    acceptOrder,
    rejectOrder,
    markOrderPreparing,
    markOrderReady,
    markOrderDelivered, 
    // Menu
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    // Settings
    updateRestaurantSettings,
    toggleRestaurantAvailability,
    // Types
    type RestaurantStats,
    type RestaurantOrder,
    type RestaurantOrdersResponse,
    type AnalyticsData,
    type ReviewsResponse,
    type CreateMenuItemInput,
    type UpdateSettingsInput,
} from './restaurantClient'
import type { FoodItem } from '@/data/foods'
import type { Restaurant } from '@/data/restaurants'



// ============================================
// Dashboard / Stats Hooks
// ============================================

/**
 * Restaurant dashboard stats — auto-refetches every 30s.
 */
export function useRestaurantStats() {
    return useQuery<RestaurantStats>({
        queryKey: ['restaurant', 'stats'],
        queryFn: fetchRestaurantStats,
        refetchInterval: 30_000,        // 🔥 Auto-refresh every 30 seconds
        refetchOnWindowFocus: true,
    })
}

export function useRestaurantProfile() {
    return useQuery<Restaurant>({
        queryKey: ['restaurant', 'profile'],
        queryFn: fetchRestaurantProfile,
    })
}

export function useRestaurantAnalytics() {
    return useQuery<AnalyticsData>({
        queryKey: ['restaurant', 'analytics'],
        queryFn: fetchRestaurantAnalytics,
    })
}

export function useRestaurantReviews(page = 1, limit = 10) {
    return useQuery<ReviewsResponse>({
        queryKey: ['restaurant', 'reviews', page, limit],
        queryFn: () => fetchRestaurantReviews(page, limit),
    })
}

// ============================================
// Orders Hooks
// ============================================

/**
 * Restaurant's orders with optional status filter.
 * Auto-refetches every 20s as fallback (socket will handle realtime).
 */
export function useRestaurantOrders(status?: string, page = 1, limit = 20) {
    return useQuery<RestaurantOrdersResponse>({
        queryKey: ['restaurant', 'orders', status, page, limit],
        queryFn: () => fetchRestaurantOrders(status, page, limit),
        refetchInterval: 20_000,        // 🔥 Fallback refresh
    })
}

export function useRestaurantOrder(orderId: string | undefined) {
    return useQuery<RestaurantOrder>({
        queryKey: ['restaurant', 'order', orderId],
        queryFn: () => fetchRestaurantOrderById(orderId as string),
        enabled: !!orderId,
    })
}

/**
 * Accept order — invalidates stats + orders list.
 */
export function useAcceptOrder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ orderId, estimatedPrepTime }: { orderId: string; estimatedPrepTime?: number }) =>
            acceptOrder(orderId, estimatedPrepTime),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useRejectOrder() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
            rejectOrder(orderId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useMarkOrderPreparing() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (orderId: string) => markOrderPreparing(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useMarkOrderReady() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (orderId: string) => markOrderReady(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useMarkOrderDelivered() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => markOrderDelivered(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
    },
  })
}

// ============================================
// Menu Hooks
// ============================================

/**
 * Restaurant's menu — same endpoint as customer menu,
 * but this hook is named for owner-side clarity.
 */
export function useRestaurantMenuItems(restaurantId: string | undefined) {
    return useQuery<FoodItem[]>({
        queryKey: ['restaurant', 'menu', restaurantId],
        queryFn: async () => {
            const res = await fetch(`/api/v1/menu/${restaurantId}`)
            const data = await res.json()
            return data.data
        },
        enabled: !!restaurantId,
    })
}

export function useCreateMenuItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateMenuItemInput) => createMenuItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useUpdateMenuItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateMenuItemInput> }) =>
            updateMenuItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu'] })
        },
    })
}

export function useDeleteMenuItem() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteMenuItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useToggleMenuItemAvailability() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => toggleMenuItemAvailability(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'menu'] })
        },
    })
}

// ============================================
// Settings Hooks
// ============================================

export function useUpdateRestaurantSettings() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: UpdateSettingsInput) => updateRestaurantSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'profile'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}

export function useToggleRestaurantAvailability() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: { isAcceptingOrders?: boolean; isOpen?: boolean }) =>
            toggleRestaurantAvailability(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'profile'] })
            queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
        },
    })
}
// src/api/adminHooks.ts
// ============================================
// React Query Hooks — Admin Panel
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchDashboardStats,
    fetchPlatformAnalytics,
    fetchUsers,
    fetchUserById,
    toggleUserStatus,
    fetchRestaurants,
    verifyRestaurant,
    unverifyRestaurant,
    toggleRestaurantOpen,
    fetchOrders,
    fetchOrderDetails,
    fetchPayouts,
    approvePayout,
    completePayout,
    rejectPayout,
    type DashboardStats,
    type PlatformAnalytics,
    type UsersResponse,
    type RestaurantsResponse,
    type OrdersResponse,
    type PayoutsResponse,
    type AdminOrder,
    type AdminUser,
     verifyUser,
     rejectUser,
} from './adminClient'

// ============================================
// Dashboard
// ============================================

export function useDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ['admin', 'dashboard'],
        queryFn: fetchDashboardStats,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    })
}

export function usePlatformAnalytics(days = 30) {
    return useQuery<PlatformAnalytics>({
        queryKey: ['admin', 'analytics', days],
        queryFn: () => fetchPlatformAnalytics(days),
    })
}

// ============================================
// Users
// ============================================

export function useAdminUsers(role?: string, search?: string, page = 1, limit = 20) {
    return useQuery<UsersResponse>({
        queryKey: ['admin', 'users', role, search, page, limit],
        queryFn: () => fetchUsers(role, search, page, limit),
    })
}

export function useAdminUser(id: string | undefined) {
    return useQuery({
        queryKey: ['admin', 'user', id],
        queryFn: () => fetchUserById(id as string),
        enabled: !!id,
    })
}

export function useToggleUserStatus() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => toggleUserStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
        },
    })
}

// ============================================
// Restaurants
// ============================================

export function useAdminRestaurants(
    search?: string,
    verified?: 'true' | 'false',
    page = 1,
    limit = 20
) {
    return useQuery<RestaurantsResponse>({
        queryKey: ['admin', 'restaurants', search, verified, page, limit],
        queryFn: () => fetchRestaurants(search, verified, page, limit),
    })
}

export function useVerifyRestaurant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => verifyRestaurant(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
        },
    })
}

export function useUnverifyRestaurant() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => unverifyRestaurant(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
        },
    })
}

export function useToggleRestaurantOpen() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => toggleRestaurantOpen(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
        },
    })
}

// ============================================
// Orders
// ============================================

export function useAdminOrders(
    status?: string,
    search?: string,
    page = 1,
    limit = 20
) {
    return useQuery<OrdersResponse>({
        queryKey: ['admin', 'orders', status, search, page, limit],
        queryFn: () => fetchOrders(status, search, page, limit),
        refetchInterval: 20_000,
    })
}

export function useAdminOrder(orderId: string | undefined) {
    return useQuery<AdminOrder>({
        queryKey: ['admin', 'order', orderId],
        queryFn: () => fetchOrderDetails(orderId as string),
        enabled: !!orderId,
    })
}

// ============================================
// Payouts
// ============================================

export function useAdminPayouts(status?: string, page = 1, limit = 20) {
    return useQuery<PayoutsResponse>({
        queryKey: ['admin', 'payouts', status, page, limit],
        queryFn: () => fetchPayouts(status, page, limit),
        refetchInterval: 20_000,
    })
}

export function useApprovePayout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => approvePayout(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] })
        },
    })
}

export function useCompletePayout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, transactionId }: { id: string; transactionId?: string }) =>
            completePayout(id, transactionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] })
        },
    })
}

export function useRejectPayout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            rejectPayout(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] })
        },
    })
}


export function useVerifyUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => verifyUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
  })
}

export function useRejectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      rejectUser(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'restaurants'] })
    },
  })
}
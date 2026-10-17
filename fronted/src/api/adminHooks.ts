// src/api/adminHooks.ts
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
            queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-partners'] })
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

// ============================================
// Verification (Shared by Restaurant & Delivery)
// ============================================
// src/api/adminHooks.ts

export function useVerifyUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: string) => verifyUser(userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-partners'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
            
            // 🔥 IMPORTANT: Delivery partner ka stats bhi refresh karein
            queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] }) 
        },
    })
}

export function useRejectUser() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
            rejectUser(userId, reason), // Calls /admin/users/:id/reject
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-partners'] })
        },
    })
}

// ============================================
// Delivery Partners (Frontend Logic using Users API)
// ============================================
export function useAdminDeliveryPartners(search?: string, status?: string, page = 1, limit = 50) {
    return useQuery({
        queryKey: ['admin', 'delivery-partners', search, status, page, limit],
        queryFn: async () => {
            // Fetch users with role='delivery'
            const data = await fetchUsers('delivery', search, page, limit)

            // Filter based on tab (pending/online/inactive)
            let partners = data.users || []

            if (status === 'pending') {
                partners = partners.filter((u: any) => u.deliveryDetails?.verificationStatus === 'pending')
            } else if (status === 'online') {
                partners = partners.filter((u: any) => u.status === 'online' && u.deliveryDetails?.verificationStatus === 'verified')
            } else if (status === 'inactive') {
                const now = new Date().getTime()
                partners = partners.filter((u: any) => {
                    if (!(u as any).lastActive) return true
                    const diff = (now - new Date((u as any).lastActive).getTime()) / (1000 * 60 * 60)
                    return diff > 48 && u.status === 'offline'
                })
            }

            // Stats calculation
            const allPartners = data.users || []
            const stats = {
                total: data.stats?.delivery || allPartners.length,
                online: allPartners.filter((u: any) => u.status === 'online').length,
                pendingApproval: allPartners.filter((u: any) => u.deliveryDetails?.verificationStatus === 'pending').length,
                inactive: allPartners.filter((u: any) => {
                    if (!(u as any).lastActive) return false
                    const diff = (new Date().getTime() - new Date((u as any).lastActive).getTime()) / (1000 * 60 * 60)
                    return diff > 48 && u.status === 'offline'
                }).length,
            }

            return {
                partners,
                total: partners.length,
                page: data.page,
                totalPages: data.totalPages,
                stats
            }
        },
    })
}

// 🔥 Wrapper hooks for Delivery Page to use the same User Verification API
export function useVerifyDeliveryPartner() {
    return useVerifyUser()
}

export function useRejectDeliveryPartner() {
    const queryClient = useQueryClient()
    return useMutation({
        // Reuse useRejectUser logic
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            rejectUser(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'delivery-partners'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
        },
    })
}
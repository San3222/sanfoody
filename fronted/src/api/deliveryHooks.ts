// src/api/deliveryHooks.ts
// ============================================
// React Query Hooks — Delivery Partner
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchDeliveryStats,
  fetchAvailableOrders,
  fetchMyDeliveries,
  fetchDeliveryById,
  acceptDeliveryOrder,
  markOrderPickedUp,
  markOrderDelivered,
  toggleDeliveryStatus,
  fetchEarnings,
  updateProfile,     // <-- Naya function import kiya
  updateVehicle,     // <-- Naya function import kiya
  type DeliveryStats,
  type AvailableOrder,
  type DeliveriesResponse,
  type EarningsSummary,
  type DeliveryPartner,
} from './deliveryClient'
import type { RestaurantOrder } from './restaurantClient'

// ============================================
// Dashboard
// ============================================

export function useDeliveryStats() {
  return useQuery<DeliveryStats>({
    queryKey: ['delivery', 'stats'],
    queryFn: fetchDeliveryStats,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  })
}

// ============================================
// Available Orders Pool
// ============================================

export function useAvailableOrders() {
  return useQuery<AvailableOrder[]>({
    queryKey: ['delivery', 'available-orders'],
    queryFn: fetchAvailableOrders,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })
}

// ============================================
// My Deliveries
// ============================================

export function useMyDeliveries(
  status?: 'active' | 'completed',
  page = 1,
  limit = 20
) {
  return useQuery<DeliveriesResponse>({
    queryKey: ['delivery', 'my-deliveries', status, page, limit],
    queryFn: () => fetchMyDeliveries(status, page, limit),
    refetchInterval: 20_000,
  })
}

export function useDelivery(orderId: string | undefined) {
  return useQuery<RestaurantOrder>({
    queryKey: ['delivery', 'order', orderId],
    queryFn: () => fetchDeliveryById(orderId as string),
    enabled: !!orderId,
  })
}

// ============================================
// Mutations
// ============================================

export function useAcceptDeliveryOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => acceptDeliveryOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'available-orders'] })
      queryClient.invalidateQueries({ queryKey: ['delivery', 'my-deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
    },
  })
}

export function useMarkPickedUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => markOrderPickedUp(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'my-deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
    },
  })
}

export function useMarkDelivered() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => markOrderDelivered(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'my-deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
      queryClient.invalidateQueries({ queryKey: ['delivery', 'earnings'] })
    },
  })
}

export function useToggleDeliveryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: 'online' | 'offline' | 'busy') =>
      toggleDeliveryStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
    },
  })
}

// ============================================
// Earnings
// ============================================

export function useEarnings() {
  return useQuery<EarningsSummary>({
    queryKey: ['delivery', 'earnings'],
    queryFn: fetchEarnings,
  })
}

// ============================================
// Profile & Vehicle Updates (NEW)
// ============================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; phone: string; email: string }) => updateProfile(data),
    onSuccess: () => {
      // 'delivery', 'stats' key invalidate karein taaki dashboard par naya naam dikhe
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { vehicleNumber: string; vehicleModel: string; vehicleType: string }) => updateVehicle(data),
    onSuccess: () => {
      // 'delivery', 'stats' key invalidate karein taaki dashboard par nayi gaadi dikhe
      queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
    },
  })
}
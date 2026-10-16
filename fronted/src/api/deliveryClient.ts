// src/api/deliveryClient.ts
// ============================================
// Delivery Partner API Client
// ============================================

import type { RestaurantOrder } from './restaurantClient'

const API_BASE_URL = '/api/v1'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('sanfoody:token')

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  }

  if (options?.body) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  })

  if (response.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return apiFetch(endpoint, options)
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data.data
}

// ============================================
// Types
// ============================================

export interface DeliveryPartner {
  _id: string
  name: string
  email: string
  phone?: string
  status: 'online' | 'offline' | 'busy'
  totalDeliveries: number
  totalEarnings: number
  rating: number
  vehicleType?: 'bike' | 'scooter' | 'cycle' | 'car'
  vehicleNumber?: string
}

export interface DeliveryStats {
  partner: DeliveryPartner
  today: {
    completed: number
    earnings: number
  }
  active: number
}

export interface AvailableOrder extends RestaurantOrder {
  estimatedEarnings: number
}

export interface DeliveriesResponse {
  orders: RestaurantOrder[]
  total: number
  page: number
  totalPages: number
}

export interface EarningsSummary {
  summary: {
    totalEarnings: number
    totalDeliveries: number
    avgPerDelivery: number
  }
  daily: {
    date: string
    deliveries: number
    earnings: number
  }[]
}

// ============================================
// Dashboard
// ============================================

export async function fetchDeliveryStats(): Promise<DeliveryStats> {
  return apiFetch('/delivery/stats')
}

// ============================================
// Orders
// ============================================

export async function fetchAvailableOrders(): Promise<AvailableOrder[]> {
  return apiFetch('/delivery/orders/available')
}

export async function fetchMyDeliveries(
  status?: 'active' | 'completed',
  page = 1,
  limit = 20
): Promise<DeliveriesResponse> {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('page', String(page))
  params.append('limit', String(limit))
  return apiFetch(`/delivery/orders/my-deliveries?${params.toString()}`)
}

export async function fetchDeliveryById(
  orderId: string
): Promise<RestaurantOrder> {
  return apiFetch(`/delivery/orders/${orderId}`)
}

export async function acceptDeliveryOrder(
  orderId: string
): Promise<{ order: RestaurantOrder; earnings: number }> {
  return apiFetch(`/delivery/orders/${orderId}/accept`, {
    method: 'PATCH',
  })
}

export async function markOrderPickedUp(
  orderId: string
): Promise<RestaurantOrder> {
  return apiFetch(`/delivery/orders/${orderId}/picked-up`, {
    method: 'PATCH',
  })
}

export async function markOrderDelivered(
  orderId: string
): Promise<{ order: RestaurantOrder; earnings: number }> {
  return apiFetch(`/delivery/orders/${orderId}/delivered`, {
    method: 'PATCH',
  })
}

// ============================================
// Status
// ============================================

export async function toggleDeliveryStatus(
  status: 'online' | 'offline' | 'busy'
): Promise<DeliveryPartner> {
  return apiFetch('/delivery/status', {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

// ============================================
// Location (existing)
// ============================================

export async function updateDeliveryLocation(
  orderId: string,
  latitude: number,
  longitude: number
): Promise<{ latitude: number; longitude: number }> {
  return apiFetch('/delivery/location', {
    method: 'POST',
    body: JSON.stringify({ orderId, latitude, longitude }),
  })
}

export async function getDeliveryLocation(orderId: string): Promise<any> {
  return apiFetch(`/delivery/location/${orderId}`)
}

// ============================================
// Earnings
// ============================================

export async function fetchEarnings(): Promise<EarningsSummary> {
  return apiFetch('/delivery/earnings')
}
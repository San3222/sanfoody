// src/api/restaurantClient.ts
// ============================================
// Restaurant Owner API Client
// Separate from customer Client.ts to keep concerns clean
// ============================================

import type { FoodItem } from '@/data/foods'
import type { Restaurant } from '@/data/restaurants'

const API_BASE_URL = '/api/v1'

// 🔥 Reuse same auth pattern as customer Client.ts
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

    // 429 handling
    if (response.status === 429) {
        console.warn('Rate limit exceeded. Waiting 5 seconds...')
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

export interface RestaurantStats {
    restaurant: {
        _id: string
        name: string
        image: string
        isOpen: boolean
        isAcceptingOrders: boolean
    }
    today: {
        orders: number
        revenue: number
    }
    menu: {
        totalItems: number
    }
    orders: {
        pending: number
        active: number
        completed: number
    }
    reviews: {
        averageRating: number
        totalReviews: number
    }
}

export interface RestaurantOrder {
    _id: string
    orderId: string
    user: {
        _id: string
        name: string
        email: string
        phone?: string
    }
    restaurant: string
    deliveryPartner?: {
        _id: string
        name: string
        phone?: string
    }
    items: {
        menuItemId: string
        name: string
        price: number
        quantity: number
        image?: string
    }[]
    subtotal: number
    deliveryFee: number
    gst: number
    total: number
    status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled'
    paymentMethod: 'card' | 'upi' | 'cod'
    paymentStatus: 'pending' | 'paid' | 'failed'
    address: string
    isPaid: boolean
    acceptedAt?: string
    rejectedAt?: string
    rejectionReason?: string
    preparedAt?: string
    readyAt?: string
    estimatedPrepTime: number
    createdAt: string
}

export interface RestaurantOrdersResponse {
    orders: RestaurantOrder[]
    total: number
    page: number
    totalPages: number
}

export interface AnalyticsData {
    dailyTrend: {
        date: string
        revenue: number
        orders: number
    }[]
    topItems: {
        name: string
        quantity: number
        revenue: number
    }[]
}

export interface RestaurantReview {
    _id: string
    userId: {
        _id: string
        name: string
        avatar?: string
    }
    rating: number
    title: string
    comment: string
    createdAt: string
}

export interface ReviewsResponse {
    reviews: RestaurantReview[]
    total: number
    page: number
    totalPages: number
}

// ============================================
// Restaurant Dashboard APIs
// ============================================

export async function fetchRestaurantStats(): Promise<RestaurantStats> {
    return apiFetch('/restaurant/stats')
}

export async function fetchRestaurantProfile(): Promise<Restaurant> {
    return apiFetch('/restaurant/profile')
}

export async function fetchRestaurantAnalytics(): Promise<AnalyticsData> {
    return apiFetch('/restaurant/analytics')
}

export async function fetchRestaurantReviews(
    page = 1,
    limit = 10
): Promise<ReviewsResponse> {
    return apiFetch(`/restaurant/reviews?page=${page}&limit=${limit}`)
}

// ============================================
// Restaurant Orders APIs
// ============================================

export async function fetchRestaurantOrders(
    status?: string,
    page = 1,
    limit = 20
): Promise<RestaurantOrdersResponse> {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/restaurant/orders?${params.toString()}`)
}

export async function fetchRestaurantOrderById(
    orderId: string
): Promise<RestaurantOrder> {
    return apiFetch(`/restaurant/orders/${orderId}`)
}

export async function acceptOrder(
    orderId: string,
    estimatedPrepTime?: number
): Promise<RestaurantOrder> {
    return apiFetch(`/restaurant/orders/${orderId}/accept`, {
        method: 'PATCH',
        body: JSON.stringify({ estimatedPrepTime }),
    })
}

export async function rejectOrder(
    orderId: string,
    reason: string
): Promise<RestaurantOrder> {
    return apiFetch(`/restaurant/orders/${orderId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    })
}

export async function markOrderPreparing(
    orderId: string
): Promise<RestaurantOrder> {
    return apiFetch(`/restaurant/orders/${orderId}/preparing`, {
        method: 'PATCH',
    })
}

export async function markOrderReady(
    orderId: string
): Promise<RestaurantOrder> {
    return apiFetch(`/restaurant/orders/${orderId}/ready`, {
        method: 'PATCH',
    })
}

// ============================================
// Restaurant Menu APIs
// ============================================

export interface CreateMenuItemInput {
    name: string
    description: string
    image: string
    price: number
    category: string
    isVeg: boolean
    isAvailable?: boolean
}

export async function createMenuItem(
    data: CreateMenuItemInput
): Promise<FoodItem> {
    return apiFetch('/restaurant/menu', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export async function updateMenuItem(
    id: string,
    data: Partial<CreateMenuItemInput>
): Promise<FoodItem> {
    return apiFetch(`/restaurant/menu/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export async function deleteMenuItem(id: string): Promise<void> {
    return apiFetch(`/restaurant/menu/${id}`, {
        method: 'DELETE',
    })
}

export async function toggleMenuItemAvailability(
    id: string
): Promise<FoodItem> {
    return apiFetch(`/restaurant/menu/${id}/toggle`, {
        method: 'PATCH',
    })
}

// ============================================
// Restaurant Settings APIs
// ============================================

export interface UpdateSettingsInput {
    name?: string
    description?: string
    image?: string
    cuisine?: string[]
    address?: string
    deliveryTime?: string
    priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹'
    isVeg?: boolean
    deliveryFee?: number
    minOrderValue?: number
    prepTimeMinutes?: number
    availability?: {
        isAcceptingOrders?: boolean
        openingTime?: string
        closingTime?: string
        weeklyOff?: number[]
    }
}

export async function updateRestaurantSettings(
    data: UpdateSettingsInput
): Promise<Restaurant> {
    return apiFetch('/restaurant/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export async function toggleRestaurantAvailability(data: {
    isAcceptingOrders?: boolean
    isOpen?: boolean
}): Promise<Restaurant> {
    return apiFetch('/restaurant/availability', {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}


export async function markOrderDelivered(
  orderId: string
): Promise<RestaurantOrder> {
  return apiFetch(`/restaurant/orders/${orderId}/deliver`, {
    method: 'PATCH',
  })
}
// src/api/adminClient.ts
// ============================================
// Admin Panel API Client
// ============================================

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

export interface AdminUser {
    _id: string
    name: string
    email: string
    role: 'customer' | 'restaurant' | 'delivery' | 'admin'
    phone?: string
    isActive: boolean
    totalEarnings?: number
    totalDeliveries?: number
    status?: 'online' | 'offline' | 'busy'
    createdAt: string

    // 🔥 NEW
    restaurantDetails?: {
        businessName?: string
        fssaiNumber?: string
        gstNumber?: string
        panNumber?: string
        bankAccountNumber?: string
        bankIfscCode?: string
        address?: string
        verificationStatus?: 'pending' | 'verified' | 'rejected'
        verifiedAt?: string
    }
    deliveryDetails?: {
        licenseNumber?: string
        aadhaarNumber?: string
        panNumber?: string
        vehicleType?: 'bike' | 'scooter' | 'cycle' | 'car'
        vehicleNumber?: string
        bankAccountNumber?: string
        bankIfscCode?: string
        emergencyContact?: string
        verificationStatus?: 'pending' | 'verified' | 'rejected'
        verifiedAt?: string
    }
}

export interface UsersResponse {
    users: AdminUser[]
    total: number
    page: number
    totalPages: number
    stats: {
        customers: number
        restaurants: number
        delivery: number
        admins: number
    }
}

export interface AdminRestaurant {
    _id: string
    name: string
    description: string
    image: string
    cuisine: string[]
    address: string
    rating: number
    reviewCount: number
    isOpen: boolean
    isVerified: boolean
    owner: {
        _id: string
        name: string
        email: string
        phone?: string
    }
    createdAt: string
}

export interface RestaurantsResponse {
    restaurants: AdminRestaurant[]
    total: number
    page: number
    totalPages: number
    stats: {
        verified: number
        pending: number
    }
}

export interface AdminOrder {
    isPaid: any
    subtotal: ReactNode
    deliveryFee: ReactNode
    gst: number
    tipAmount: number
    razorpayPaymentId: import("react").JSX.Element
    acceptedAt: import("react").JSX.Element
    preparedAt: import("react").JSX.Element
    readyAt: import("react").JSX.Element
    pickedUpAt: import("react").JSX.Element
    deliveredAt: import("react").JSX.Element
    rejectedAt: import("react").JSX.Element
    rejectionReason: any
    razorpayOrderId: import("react").JSX.Element
    deliveryEarnings: undefined
    _id: string
    orderId: string
    user: { _id: string; name: string; email: string; phone?: string }
    restaurant: { _id: string; name: string; image: string }
    deliveryPartner?: { _id: string; name: string; phone?: string }
    items: { name: string; price: number; quantity: number }[]
    total: number
    status: string
    paymentMethod: string
    paymentStatus: string
    address: string
    createdAt: string
}

export interface OrdersResponse {
    orders: AdminOrder[]
    total: number
    page: number
    totalPages: number
    statusBreakdown: Record<string, number>
}

export interface DashboardStats {
    users: number
    restaurants: number
    orders: number
    today: {
        orders: number
        revenue: number
    }
    thisMonth: {
        revenue: number
    }
    pending: number
    activeRestaurants: number
}

export interface PlatformAnalytics {
    dailyTrend: { date: string; revenue: number; orders: number }[]
    topRestaurants: {
        _id: string
        name: string
        image: string
        revenue: number
        orders: number
    }[]
    statusBreakdown: Record<string, number>
    userGrowth: { date: string; count: number }[]
}

export interface AdminPayout {
    _id: string
    partnerId: {
        _id: string
        name: string
        email: string
        phone?: string
        totalEarnings?: number
    }
    amount: number
    method: 'upi' | 'bank'
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    payoutDetails: {
        upiId?: string
        accountHolderName?: string
        accountNumber?: string
        ifscCode?: string
        bankName?: string
    }
    createdAt: string
    completedAt?: string
}

export interface PayoutsResponse {
    payouts: AdminPayout[]
    total: number
    page: number
    totalPages: number
    stats: Record<string, { count: number; amount: number }>
}

// ============================================
// Dashboard
// ============================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
    return apiFetch('/admin/dashboard')
}

export async function fetchPlatformAnalytics(days = 30): Promise<PlatformAnalytics> {
    return apiFetch(`/admin/analytics?days=${days}`)
}

// ============================================
// Users
// ============================================

export async function fetchUsers(
    role?: string,
    search?: string,
    page = 1,
    limit = 20
): Promise<UsersResponse> {
    const params = new URLSearchParams()
    if (role && role !== 'all') params.append('role', role)
    if (search) params.append('search', search)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/admin/users?${params.toString()}`)
}

export async function fetchUserById(id: string): Promise<{
    user: AdminUser
    recentOrders: AdminOrder[]
}> {
    return apiFetch(`/admin/users/${id}`)
}

export async function toggleUserStatus(id: string): Promise<AdminUser> {
    return apiFetch(`/admin/users/${id}/toggle-status`, {
        method: 'PATCH',
    })
}

// ============================================
// Restaurants
// ============================================

export async function fetchRestaurants(
    search?: string,
    verified?: 'true' | 'false',
    page = 1,
    limit = 20
): Promise<RestaurantsResponse> {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (verified) params.append('verified', verified)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/admin/restaurants?${params.toString()}`)
}

export async function verifyRestaurant(id: string): Promise<AdminRestaurant> {
    return apiFetch(`/admin/restaurants/${id}/verify`, { method: 'PATCH' })
}

export async function unverifyRestaurant(id: string): Promise<AdminRestaurant> {
    return apiFetch(`/admin/restaurants/${id}/unverify`, { method: 'PATCH' })
}

export async function toggleRestaurantOpen(id: string): Promise<AdminRestaurant> {
    return apiFetch(`/admin/restaurants/${id}/toggle-open`, { method: 'PATCH' })
}

// ============================================
// Orders
// ============================================

export async function fetchOrders(
    status?: string,
    search?: string,
    page = 1,
    limit = 20
): Promise<OrdersResponse> {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    if (search) params.append('search', search)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/admin/orders?${params.toString()}`)
}

export async function fetchOrderDetails(orderId: string): Promise<AdminOrder> {
    return apiFetch(`/admin/orders/${orderId}`)
}

// ============================================
// Payouts
// ============================================

export async function fetchPayouts(
    status?: string,
    page = 1,
    limit = 20
): Promise<PayoutsResponse> {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.append('status', status)
    params.append('page', String(page))
    params.append('limit', String(limit))
    return apiFetch(`/admin/payouts?${params.toString()}`)
}

export async function approvePayout(id: string): Promise<AdminPayout> {
    return apiFetch(`/admin/payouts/${id}/approve`, { method: 'PATCH' })
}

export async function completePayout(
    id: string,
    transactionId?: string
): Promise<AdminPayout> {
    return apiFetch(`/admin/payouts/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ transactionId }),
    })
}

export async function rejectPayout(
    id: string,
    reason?: string
): Promise<AdminPayout> {
    return apiFetch(`/admin/payouts/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    })
}

// ============================================
// User Verification APIs
// ============================================

export async function verifyUser(userId: string) {
    return apiFetch(`/admin/users/${userId}/verify`, {
        method: "PATCH",
    });
}

export async function rejectUser(userId: string, reason?: string) {
    return apiFetch(`/admin/users/${userId}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
    });
}
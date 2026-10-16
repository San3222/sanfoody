// src/api/loyaltyClient.ts
const API_BASE_URL = '/api/v1'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('sanfoody:token')
    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options?.headers as Record<string, string>) || {}),
    }
    if (options?.body) headers['Content-Type'] = 'application/json'

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers, ...options })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'API request failed')
    }
    return data.data
}

// ============================================
// Types
// ============================================

export interface LoyaltyHistoryItem {
    _id: string
    type: 'earned' | 'redeemed'
    points: number
    description: string
    orderId?: string
    createdAt: string
}

export interface LoyaltyData {
    _id: string
    userId: string
    points: number
    totalEarned: number
    totalRedeemed: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    history: LoyaltyHistoryItem[]
}

export interface RedeemResponse {
    discount: number
}

// ============================================
// APIs
// ============================================

export async function fetchLoyaltyPoints(): Promise<LoyaltyData> {
    return apiFetch('/loyalty')
}

export async function redeemLoyaltyPoints(points: number): Promise<RedeemResponse> {
    return apiFetch('/loyalty/redeem', {
        method: 'POST',
        body: JSON.stringify({ points }),
    })
}
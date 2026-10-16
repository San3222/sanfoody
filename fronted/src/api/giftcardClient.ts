// src/api/giftcardClient.ts
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
  if (!response.ok) throw new Error(data.message || 'API request failed')
  return data.data
}

// ============================================
// Types
// ============================================

export interface GiftCard {
  _id: string
  code: string
  amount: number
  balance: number
  purchasedBy?: string
  redeemedBy?: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  status: 'active' | 'redeemed' | 'expired'
  expiresAt: string
  createdAt: string
}

export interface PurchaseGiftCardInput {
  amount: number
  recipientEmail: string
  recipientName: string
  message?: string
}

export interface RedeemGiftCardResponse {
  amount: number
}

// ============================================
// APIs
// ============================================

export async function purchaseGiftCard(
  data: PurchaseGiftCardInput
): Promise<GiftCard> {
  return apiFetch('/giftcards/purchase', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchUserGiftCards(): Promise<GiftCard[]> {
  return apiFetch('/giftcards/my-cards')
}

export async function redeemGiftCard(code: string): Promise<RedeemGiftCardResponse> {
  return apiFetch('/giftcards/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
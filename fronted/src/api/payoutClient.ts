// src/api/payoutClient.ts
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

export interface WalletBalance {
  balance: number
  pending: number
  lifetimeWithdrawn: number
  totalWithdrawals: number
  minWithdrawal: number
}

export interface PayoutMethod {
  type: 'upi' | 'bank'
  upiId?: string
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  bankName?: string
  verified?: boolean
  updatedAt?: string
}

export interface Payout {
  _id: string
  partnerId: string
  amount: number
  method: 'upi' | 'bank'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  payoutDetails: any
  requestedAt: string
  processedAt?: string
  completedAt?: string
  failureReason?: string
  transactionId?: string
  createdAt: string
}

export interface PayoutHistoryResponse {
  payouts: Payout[]
  total: number
  page: number
  totalPages: number
}

// ============================================
// APIs
// ============================================

export async function fetchWalletBalance(): Promise<WalletBalance> {
  return apiFetch('/delivery/payout/balance')
}

export async function requestWithdrawal(amount: number): Promise<Payout> {
  return apiFetch('/delivery/payout/request', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export async function fetchPayoutHistory(
  page = 1,
  limit = 20
): Promise<PayoutHistoryResponse> {
  return apiFetch(`/delivery/payout/history?page=${page}&limit=${limit}`)
}

export async function cancelPayout(id: string): Promise<Payout> {
  return apiFetch(`/delivery/payout/${id}`, {
    method: 'DELETE',
  })
}

export async function fetchPayoutMethod(): Promise<PayoutMethod | null> {
  return apiFetch('/delivery/payout/method')
}

export async function savePayoutMethod(data: {
  type: 'upi' | 'bank'
  upiId?: string
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  bankName?: string
}): Promise<{ payoutMethod: PayoutMethod }> {
  return apiFetch('/delivery/payout/method', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
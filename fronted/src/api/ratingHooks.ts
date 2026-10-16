// src/api/ratingHooks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
    if (!response.ok) throw new Error(data.message || 'API failed')
    return data.data
}

export async function rateDelivery(
    orderId: string,
    rating: number,
    tipAmount?: number,
    comment?: string
) {
    return apiFetch(`/orders/${orderId}/rate-delivery`, {
        method: 'POST',
        body: JSON.stringify({ rating, tipAmount, comment }),
    })
}

export function useRateDelivery() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            orderId,
            rating,
            tipAmount,
            comment,
        }: {
            orderId: string
            rating: number
            tipAmount?: number
            comment?: string
        }) => rateDelivery(orderId, rating, tipAmount, comment),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] })
        },
    })
}
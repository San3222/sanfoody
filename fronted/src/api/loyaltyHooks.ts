// src/api/loyaltyHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchLoyaltyPoints,
    redeemLoyaltyPoints,
    type LoyaltyData,
} from './loyaltyClient'

export function useLoyaltyPoints() {
    return useQuery<LoyaltyData>({
        queryKey: ['loyalty'],
        queryFn: fetchLoyaltyPoints,
        refetchInterval: 30_000,
    })
}

export function useRedeemPoints() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (points: number) => redeemLoyaltyPoints(points),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty'] })
        },
    })
}
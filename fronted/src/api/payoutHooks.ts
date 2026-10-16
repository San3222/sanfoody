// src/api/payoutHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchWalletBalance,
    requestWithdrawal,
    fetchPayoutHistory,
    cancelPayout,
    fetchPayoutMethod,
    savePayoutMethod,
    type WalletBalance,
    type Payout,
    type PayoutHistoryResponse,
    type PayoutMethod,
} from './payoutClient'

export function useWalletBalance() {
    return useQuery<WalletBalance>({
        queryKey: ['payout', 'balance'],
        queryFn: fetchWalletBalance,
        refetchInterval: 15_000,
    })
}

export function usePayoutHistory(page = 1, limit = 20) {
    return useQuery<PayoutHistoryResponse>({
        queryKey: ['payout', 'history', page, limit],
        queryFn: () => fetchPayoutHistory(page, limit),
    })
}

export function useRequestWithdrawal() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (amount: number) => requestWithdrawal(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payout'] })
            queryClient.invalidateQueries({ queryKey: ['delivery', 'earnings'] })
        },
    })
}

export function useCancelPayout() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => cancelPayout(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payout'] })
        },
    })
}

export function usePayoutMethod() {
    return useQuery<PayoutMethod | null>({
        queryKey: ['payout', 'method'],
        queryFn: fetchPayoutMethod,
    })
}

export function useSavePayoutMethod() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: savePayoutMethod,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payout', 'method'] })
        },
    })
}
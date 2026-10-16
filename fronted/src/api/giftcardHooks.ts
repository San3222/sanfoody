// src/api/giftcardHooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  purchaseGiftCard,
  fetchUserGiftCards,
  redeemGiftCard,
  type GiftCard,
  type PurchaseGiftCardInput,
} from './giftcardClient'

export function useUserGiftCards() {
  return useQuery<GiftCard[]>({
    queryKey: ['giftcards'],
    queryFn: fetchUserGiftCards,
  })
}

export function usePurchaseGiftCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PurchaseGiftCardInput) => purchaseGiftCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftcards'] })
    },
  })
}

export function useRedeemGiftCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => redeemGiftCard(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftcards'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    },
  })
}
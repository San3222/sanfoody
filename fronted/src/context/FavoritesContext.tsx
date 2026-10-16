import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useFavoritesList, useToggleFavorite } from '@/api/Hooks'

interface FavoritesContextValue {
  ids: Set<string>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  count: number
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data: favoritesData, isLoading } = useFavoritesList()
  const toggleFavoriteMutation = useToggleFavorite()
  
  const [ids, setIds] = useState<Set<string>>(new Set())

  // 🔥 Backend se favorites load karo
  useEffect(() => {
    if (favoritesData) {
      const favoriteIds = new Set<string>()
      favoritesData.forEach((fav: any) => {
        favoriteIds.add(`${fav.itemType}:${fav.itemId}`)
      })
      setIds(favoriteIds)
    }
  }, [favoritesData])

  // 🔥 Toggle favorite (Backend API call)
  const toggleFavorite = (id: string) => {
    // id format: "restaurant:123" ya "food:456"
    const [itemType, itemId] = id.split(':')
    
    toggleFavoriteMutation.mutate({ itemType, itemId }, {
      onSuccess: () => {
        setIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      },
      onError: (error) => {
        console.error('Toggle favorite failed:', error)
      }
    })
  }

  const isFavorite = (id: string) => ids.has(id)

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ids,
      isFavorite,
      toggleFavorite,
      count: ids.size,
    }),
    [ids, toggleFavorite, isFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavoritesContext must be used within a FavoritesProvider')
  return ctx
}
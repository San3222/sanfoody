import { createContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { FoodItem } from '@/data/foods'

export interface CartLine {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  restaurantId?: string 
}

interface CartContextValue {
  items: CartLine[]
  isOpen: boolean
  totalCount: number
  subtotal: number
  addItem: (food: FoodItem) => void
  removeItem: (id: string) => void
  incrementItem: (id: string) => void
  decrementItem: (id: string) => void
  open: () => void
  close: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = (food: FoodItem) => {
    setItems((prev) => {
      const existing = prev.find((line) => line.id === food.id)
      if (existing) {
        return prev.map((line) =>
          line.id === food.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [
        ...prev,
        {
          id: food.id,
          name: food.name,
          image: food.image,
          price: food.price,
          quantity: 1,
          restaurantId: food.restaurantId,
        },
      ]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((line) => line.id !== id))
  }

  const incrementItem = (id: string) => {
    setItems((prev) => prev.map((line) => (line.id === id ? { ...line, quantity: line.quantity + 1 } : line)))
  }

  const decrementItem = (id: string) => {
    setItems((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    )
  }

  const totalCount = useMemo(() => items.reduce((sum, line) => sum + line.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, line) => sum + line.quantity * line.price, 0), [items])

  const value: CartContextValue = {
    items,
    isOpen,
    totalCount,
    subtotal,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

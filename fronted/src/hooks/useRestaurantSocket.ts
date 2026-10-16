// src/hooks/useRestaurantSocket.ts
// ============================================
// Restaurant Owner — Real-time Socket Hook
// ============================================

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import { useToast } from '@/context/ToastContext'
import type { RestaurantOrder } from '@/api/restaurantClient'

// ============================================
// Config
// ============================================

const SOCKET_URL = 'http://localhost:5000'
const SOUND_URL = '/sounds/new-order.mp3'

// 🔥 Audio unlock state — module-level so it's shared across hook calls
let soundUnlocked = false


// ============================================
// Types
// ============================================

interface NewOrderPayload {
  orderId: string
  customerName: string
  customerPhone?: string
  items: RestaurantOrder['items']
  subtotal: number
  total: number
  address: string
  paymentMethod: string
  paymentStatus: string
  isPaid: boolean
  createdAt: string
  estimatedPrepTime: number
}



// At top of file
const DEBUG = import.meta.env.DEV  // Only log in dev
function log(...args: any[]) {
  if (DEBUG) console.log(...args)
}

function warn(...args: any[]) {
  if (DEBUG) console.warn(...args)
}


// ============================================
// Sound Helpers
// ============================================

/**
 * Unlock audio context on first user gesture.
 * Browsers block autoplay until user interacts.
 */
export function unlockAudio() {
  if (soundUnlocked) return

  try {
    const audio = new Audio(SOUND_URL)
    audio.volume = 0
    audio.play()
      .then(() => {
        soundUnlocked = true
        log('[Sound] 🔓 Audio unlocked')
      })
      .catch(() => {
        // Still blocked — will retry next time
      })
  } catch (err) {
    warn('[Sound] Unlock failed:', err)
  }
}

/**
 * Play notification sound for new orders.
 */
function playNotificationSound() {
  try {
    const audio = new Audio(SOUND_URL)
    audio.volume = 0.7
    const playPromise = audio.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          soundUnlocked = true
          log('[Sound] 🔔 Played successfully')
        })
        .catch((err) => {
          warn('[Sound] Autoplay blocked — click page once:', err.message)
        })
    }
  } catch (err) {
    console.error('[Sound] Play failed:', err)
  }
}

/**
 * Show browser notification (if permitted).
 */
function showBrowserNotification(payload: NewOrderPayload) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    new Notification('🔔 New Order — SanFoody', {
      body: `₹${payload.total} from ${payload.customerName}`,
      icon: '/images/logo/logo1.png',
      tag: payload.orderId,
      requireInteraction: true,
    })
  } catch (err) {
    console.error('[Notification] Error:', err)
  }
}

// ============================================
// Hook
// ============================================

export function useRestaurantSocket() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastNewOrder, setLastNewOrder] = useState<NewOrderPayload | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'restaurant') return

    const token = localStorage.getItem('sanfoody:token')
    if (!token) {
      warn('[Socket] No token found — skipping connection')
      return
    }

    log('[Socket] Connecting...')

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    // ─── Connection events ─────────────────────────
    socket.on('connect', () => {
      log('[Socket] ✅ Connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      log('[Socket] ❌ Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
      setIsConnected(false)
    })

    // ─── 🔥 NEW ORDER ──────────────────────────────
    socket.on('new-order', (payload: NewOrderPayload) => {
      log('[Socket] 🔔 NEW ORDER received:', payload)

      setLastNewOrder(payload)

      // 1️⃣ Play sound
      playNotificationSound()

      // 2️⃣ Show toast
      showToast(
        'success',
        `🔔 New order ₹${payload.total} from ${payload.customerName}`
      )

      // 3️⃣ Browser notification
      showBrowserNotification(payload)

      // 4️⃣ Refresh queries
      queryClient.invalidateQueries({ queryKey: ['restaurant', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['restaurant', 'stats'] })
    })

    // ─── Cleanup ────────────────────────────────────
    return () => {
      log('[Socket] Cleaning up...')
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [user, isAuthenticated, queryClient, showToast])

  return {
    isConnected,
    lastNewOrder,
  }
}
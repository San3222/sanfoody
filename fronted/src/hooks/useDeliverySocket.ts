// src/hooks/useDeliverySocket.ts
// ============================================
// Delivery Partner — Real-time Socket Hook
// ============================================

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/useAuth'
import { useToast } from '@/context/ToastContext'

const SOCKET_URL = 'http://localhost:5000'
const SOUND_URL = '/sounds/new-order.mp3'

// ============================================
// Payload Types
// ============================================

interface OrderReadyPayload {
    orderId: string
    restaurantName: string
    pickupAddress: string
    deliveryAddress: string
}

interface OrderStatusUpdate {
    orderId: string
    status: string
    updatedAt: string
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
// Hook
// ============================================

export function useDeliverySocket() {
    const { user, isAuthenticated } = useAuth()
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [lastReadyOrder, setLastReadyOrder] = useState<OrderReadyPayload | null>(null)

    useEffect(() => {
        // Only connect for authenticated delivery partners
        if (!isAuthenticated || user?.role !== 'delivery') return

        const token = localStorage.getItem('sanfoody:token')
        if (!token) {
            warn('[Socket] No token found — skipping connection')
            return
        }

        log('[Delivery Socket] Connecting...')

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
            log('[Delivery Socket] ✅ Connected:', socket.id)
            setIsConnected(true)
        })

        socket.on('disconnect', (reason) => {
            log('[Delivery Socket] ❌ Disconnected:', reason)
            setIsConnected(false)
        })

        socket.on('connect_error', (err) => {
            console.error('[Delivery Socket] Connection error:', err.message)
            setIsConnected(false)
        })

        // ─── 🔥 NEW AVAILABLE ORDER ─────────────────────
        socket.on('order-ready-for-pickup', (payload: OrderReadyPayload) => {
            log('[Delivery Socket] 🍽️ Order ready for pickup:', payload)

            setLastReadyOrder(payload)

            // 1️⃣ Sound alert
            playNotificationSound()

            // 2️⃣ Toast
            showToast(
                'success',
                `🍽️ New order from ${payload.restaurantName}`
            )

            // 3️⃣ Browser notification
            showBrowserNotification(payload)

            // 4️⃣ Refresh available orders pool
            queryClient.invalidateQueries({ queryKey: ['delivery', 'available-orders'] })
            queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
        })

        // ─── 🔥 Order assigned to me ────────────────────
        socket.on('order-assigned', (payload: OrderStatusUpdate) => {
            log('[Delivery Socket] 📦 Order assigned:', payload)
            showToast('success', `📦 Order ${payload.orderId} assigned to you`)
            queryClient.invalidateQueries({ queryKey: ['delivery', 'my-deliveries'] })
            queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
        })

        // ─── 🔥 Order status updates (relevant to me) ──
        socket.on('order-status-update', (payload: OrderStatusUpdate) => {
            log('[Delivery Socket] 🔄 Status update:', payload)
            queryClient.invalidateQueries({ queryKey: ['delivery', 'my-deliveries'] })
            queryClient.invalidateQueries({ queryKey: ['delivery', 'stats'] })
        })

        // ─── Cleanup ────────────────────────────────────
        return () => {
            log('[Delivery Socket] Cleaning up...')
            socket.disconnect()
            socketRef.current = null
            setIsConnected(false)
        }
    }, [user, isAuthenticated, queryClient, showToast])

    return {
        isConnected,
        lastReadyOrder,
    }
}

// ============================================
// Helpers
// ============================================

function playNotificationSound() {
    try {
        const audio = new Audio(SOUND_URL)
        audio.volume = 0.7
        const playPromise = audio.play()
        if (playPromise !== undefined) {
            playPromise
                .then(() => console.log('[Sound] 🔔 Played'))
                .catch((err) => console.warn('[Sound] Autoplay blocked:', err.message))
        }
    } catch (err) {
        console.error('[Sound] Error:', err)
    }
}

function showBrowserNotification(payload: OrderReadyPayload) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    try {
        new Notification('🍽️ New Pickup Order — SanFoody', {
            body: `${payload.restaurantName} → ${payload.deliveryAddress}`,
            icon: '/images/logo/logo1.png',
            tag: payload.orderId,
            requireInteraction: true,
        })
    } catch (err) {
        console.error('[Notification] Error:', err)
    }
}
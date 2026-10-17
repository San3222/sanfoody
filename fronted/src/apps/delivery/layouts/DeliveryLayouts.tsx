// src/apps/delivery/layouts/DeliveryLayout.tsx
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Bike,
  Package,
  DollarSign,
  LogOut,
  Wifi,
  WifiOff,
  Power,
  Settings,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useDeliverySocket } from '@/hooks/useDeliverySocket'
import { useDeliveryStats, useToggleDeliveryStatus } from '@/api/deliveryHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// 🔥 Audio unlock helper
let audioUnlocked = false
function unlockAudio() {
  if (audioUnlocked) return
  try {
    const audio = new Audio('/sounds/new-order.mp3')
    audio.volume = 0
    audio.play()
      .then(() => {
        audioUnlocked = true
        console.log('[Sound] 🔓 Audio unlocked')
      })
      .catch(() => { })
  } catch (err) { }
}

const navItems = [
  { to: '/delivery/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/delivery/available-orders', label: 'Available Orders', icon: Package },
  { to: '/delivery/my-deliveries', label: 'My Deliveries', icon: Bike },
  { to: '/delivery/earnings', label: 'Earnings', icon: DollarSign },
  { to: '/delivery/settings', label: 'Settings', icon: Settings },
]

export function DeliveryLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Socket — real-time pool
  const { isConnected, lastReadyOrder } = useDeliverySocket()

  // Stats — for status toggle + active count
  const { data: stats } = useDeliveryStats()
  const toggleStatus = useToggleDeliveryStatus()

  // 🔥 VERIFICATION CHECK
  const partner = stats?.partner
  const verificationStatus = (partner as any)?.verificationStatus ?? (partner as any)?.deliveryDetails?.verificationStatus
  const isVerified = verificationStatus === 'verified' || (partner as any)?.isVerified === true

  const partnerStatus = partner?.status ?? 'offline'
  const isOnline = partnerStatus === 'online' && isVerified
  const activeCount = stats?.active ?? 0

  // 🔥 Unlock audio on first interaction
  useEffect(() => {
    const handler = () => unlockAudio()
    document.addEventListener('click', handler, { once: true })
    document.addEventListener('keydown', handler, { once: true })
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleToggleOnline = () => {
    // Agar verified nahi hai toh kuch mat karo
    if (!isVerified) {
      showToast('error', 'Your account is pending approval. You cannot go online.')
      return
    }

    const newStatus = isOnline ? 'offline' : 'online'
    toggleStatus.mutate(newStatus, {
      onSuccess: () => {
        showToast(
          'success',
          newStatus === 'online' ? '🟢 You are online' : '🔴 You are offline'
        )
      },
      onError: (err: any) => {
        showToast('error', err.message || 'Failed to toggle status')
      },
    })
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-charcoal/10 bg-white shadow-soft">
        <div className="flex h-full flex-col p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Bike className="h-7 w-7 text-tomato" />
              <span className="font-display text-lg font-bold text-charcoal">Delivery</span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold',
                isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
              title={isConnected ? 'Live connection active' : 'Connection lost'}
            >
              {isConnected ? <><Wifi className="h-3 w-3" />LIVE</> : <><WifiOff className="h-3 w-3" />OFF</>}
            </div>
          </div>

          {/* 🔥 Online/Offline Toggle (With Verification Check) */}
          <button
            onClick={handleToggleOnline}
            disabled={toggleStatus.isPending || !isVerified}
            className={cn(
              'mb-4 flex items-center justify-between gap-2 rounded-2xl p-3 transition-all text-left',
              !isVerified
                ? 'bg-amber-50 border border-amber-200 cursor-not-allowed'
                : isOnline
                  ? 'bg-green-100 hover:bg-green-200'
                  : 'bg-charcoal/5 hover:bg-charcoal/10',
              toggleStatus.isPending && 'opacity-60'
            )}
          >
            <div className="flex items-center gap-2">
              {!isVerified ? (
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
              ) : (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {isOnline && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  )}
                  <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', isOnline ? 'bg-green-500' : 'bg-charcoal/40')} />
                </span>
              )}

              <div>
                <p className={cn("text-xs font-bold", !isVerified ? "text-amber-800" : "text-charcoal")}>
                  {!isVerified ? 'Approval Pending' : isOnline ? 'Online' : 'Offline'}
                </p>
                <p className={cn("text-[10px]", !isVerified ? "text-amber-600/80" : "text-warm-gray")}>
                  {!isVerified ? 'Cannot go online yet' : activeCount > 0 ? `${activeCount} active` : 'Ready to receive'}
                </p>
              </div>
            </div>
            
            <Power
              className={cn(
                'h-4 w-4 shrink-0',
                !isVerified ? 'text-amber-400' : isOnline ? 'text-green-700' : 'text-charcoal/50'
              )}
            />
          </button>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const showBadge = item.to.includes('available') && lastReadyOrder && isVerified
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-tomato text-cream'
                        : 'text-charcoal/70 hover:bg-beige hover:text-tomato'
                    )
                  }
                >
                  <item.icon className="h-4.5 w-4.5" />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1.5 text-[10px] font-bold text-cream">
                      !
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-charcoal/10 pt-4">
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-tomato text-sm font-semibold text-cream">
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {user?.name || 'Delivery'}
                </p>
                <p className="text-xs text-warm-gray">Partner</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-tomato transition-colors hover:bg-tomato/10"
            >
              <LogOut className="h-4.5 w-4.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
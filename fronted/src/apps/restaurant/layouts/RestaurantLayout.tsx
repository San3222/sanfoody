// src/apps/restaurant/layouts/RestaurantLayout.tsx
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Star,
  Bell,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useRestaurantSocket, unlockAudio } from '@/hooks/useRestaurantSocket'
import { useRestaurantStats } from '@/api/restaurantHooks'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/restaurant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/restaurant/orders', label: 'Orders', icon: Package, badgeKey: 'pending' },
  { to: '/restaurant/menu', label: 'Menu Manager', icon: UtensilsCrossed },
  { to: '/restaurant/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/restaurant/reviews', label: 'Reviews', icon: Star },
  { to: '/restaurant/settings', label: 'Settings', icon: Settings },
]

export function RestaurantLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // 🔥 Socket — real-time new orders
  const { isConnected, lastNewOrder } = useRestaurantSocket()

  // 🔥 Stats — for badge counts + restaurant name
  const { data: stats } = useRestaurantStats()

  const pendingCount = stats?.orders?.pending ?? 0
  const restaurantName = stats?.restaurant?.name ?? 'Partner'
  const restaurantImage = stats?.restaurant?.image

  const handleLogout = () => {
    logout()
    navigate('/')
  }


  // 🔥 Unlock audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      unlockAudio()
    }

    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])


  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-charcoal/10 bg-white shadow-soft">
        <div className="flex h-full flex-col p-4">
          {/* Logo + Connection Status */}
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Store className="h-7 w-7 text-tomato" />
              <span className="font-display text-lg font-bold text-charcoal">Partner</span>
            </div>

            {/* 🔥 Live/Offline indicator */}
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold',
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
              title={isConnected ? 'Live connection active' : 'Connection lost'}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  LIVE
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  OFF
                </>
              )}
            </div>
          </div>

          {/* Restaurant Name */}
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-beige/50 p-3">
            {restaurantImage ? (
              <img
                src={restaurantImage}
                alt={restaurantName}
                className="h-10 w-10 rounded-xl object-cover"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-tomato/10">
                <Store className="h-5 w-5 text-tomato" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-charcoal">{restaurantName}</p>
              <p className="text-xs text-warm-gray">
                {stats?.restaurant?.isAcceptingOrders ? '🟢 Accepting orders' : '🔴 Paused'}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const badgeCount =
                item.badgeKey === 'pending' ? pendingCount : 0

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

                  {/* 🔥 Badge for pending orders */}
                  {badgeCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1.5 text-[10px] font-bold text-cream">
                      {badgeCount}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Notification Bell Preview */}
          {lastNewOrder && (
            <div className="mb-3 rounded-2xl bg-linear-to-br from-tomato/10 to-orange/10 p-3">
              <div className="flex items-start gap-2">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-charcoal">Latest Order</p>
                  <p className="truncate text-[11px] text-warm-gray">
                    {lastNewOrder.customerName} · ₹{lastNewOrder.total}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Info & Logout */}
          <div className="border-t border-charcoal/10 pt-4">
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-tomato text-sm font-semibold text-cream">
                {user?.name?.charAt(0)?.toUpperCase() || 'R'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal">
                  {user?.name || 'Restaurant'}
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

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
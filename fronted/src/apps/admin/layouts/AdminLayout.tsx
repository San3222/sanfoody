import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, Users, BarChart3, Settings, LogOut, ShieldCheck, Package, Wallet, MessageCircle, } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/restaurants', label: 'Restaurant Approvals', icon: Store },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/orders', label: 'Orders', icon: Package },        // 🔥 NEW
  { to: '/admin/payouts', label: 'Payouts', icon: Wallet },
  { to: '/admin/chats', label: 'Chats', icon: MessageCircle },      // 🔥 NEW
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-charcoal/10 bg-charcoal text-cream shadow-soft">
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2 px-2">
            <ShieldCheck className="h-8 w-8 text-orange" />
            <span className="font-display text-xl font-bold">Admin</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-tomato text-cream'
                      : 'text-cream/70 hover:bg-cream/10 hover:text-cream',
                  )
                }
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-cream/10 pt-4">
            <div className="mb-2 flex items-center gap-3 px-2 py-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-orange text-sm font-semibold text-charcoal">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
                <p className="text-xs text-cream/60">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
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
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Search, MapPin, Heart, ShoppingCart, Menu, X, User, Package, Wallet, Bell, LocateFixed, Home, Briefcase, Map as MapIcon } from 'lucide-react'
import { navLinks } from '@/data/navigation'
import { cn } from '@/lib/utils'
import { useCart } from '@/context/useCart'
import { useAuth } from '@/context/useAuth'
import { useNotifications } from '@/api/Hooks'
import { useFavorites } from '@/context/useFavorites'
import { CitySelector } from '@/apps/customer/components/CitySelector'

export function Navbar({ onSearchClick }: { onSearchClick: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const { scrollY } = useScroll()
  const cart = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { count: favoritesCount } = useFavorites()
  const { data: notificationsData } = useNotifications()
  const unreadCount = notificationsData?.unreadCount || 0

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40)
  })

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'G'

  // 🔥 Location Modal Handlers
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          alert(`Current location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          setLocationModalOpen(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location. Please try again.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8',
          scrolled
            ? 'mt-2 rounded-2xl border border-charcoal/5 bg-cream/80 py-3 shadow-soft backdrop-blur-xl'
            : 'py-5',
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 ">
          <div>
            <img
              src="/images/logo/logo2.png"
              alt="SanFoody Logo"
              className="h-11 w-auto object-contain rounded-lg"
            />
          </div>
        </Link>

        {/* Center links — desktop */}
        <nav className="hidden items-center gap-1 border-charcoal/5 px-1.5 py-1.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:bg-white hover:text-tomato"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right icon cluster — desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          <IconButton label="Search" onClick={onSearchClick}>
            <Search className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>


          {/* 🔥 Location Icon Click Handler */}
          {/* <IconButton label="Delivery location" onClick={() => setLocationModalOpen(true)}>
            <MapPin className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton> */}
          <CitySelector />

          <IconButton label="Favorites" badge={favoritesCount} onClick={() => navigate('/favorites')}>
            <Heart className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>
          <IconButton label="Orders" onClick={() => navigate('/orders')}>
            <Package className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>
          <IconButton label="Wallet" onClick={() => navigate('/wallet')}>
            <Wallet className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>
          <IconButton label="Cart" badge={cart.totalCount} onClick={cart.open}>
            <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>
          <IconButton
            label="Notifications"
            badge={unreadCount}
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2} />
          </IconButton>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-charcoal text-sm font-semibold text-cream transition-colors hover:bg-tomato"
            aria-label="Your profile"
          >
            {userInitial}
          </button>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full text-charcoal lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden bg-cream/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 hover:bg-white hover:text-tomato"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-charcoal/10 pt-3">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 transition-colors hover:bg-white hover:text-tomato"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 transition-colors hover:bg-white hover:text-tomato"
                >
                  <Package className="h-5 w-5" />
                  Orders
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 transition-colors hover:bg-white hover:text-tomato"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-tomato px-2 py-0.5 text-xs font-bold text-cream">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wallet"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-charcoal/80 transition-colors hover:bg-white hover:text-tomato"
                >
                  <Wallet className="h-5 w-5" />
                  Wallet
                </Link>
              </div>

              <div className="mt-2 flex items-center gap-3 border-t border-charcoal/10 pt-4">
                <IconButton label="Search" onClick={onSearchClick}>
                  <Search className="h-4.5 w-4.5" />
                </IconButton>
                <IconButton label="Favorites" badge={favoritesCount} onClick={() => navigate('/favorites')}>
                  <Heart className="h-4.5 w-4.5" />
                </IconButton>
                <IconButton label="Cart" badge={cart.totalCount} onClick={cart.open}>
                  <ShoppingCart className="h-4.5 w-4.5" />
                </IconButton>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* 🔥 Location Modal */}
      <AnimatePresence>
        {locationModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocationModalOpen(false)}
              className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: -24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-20 z-70 mx-auto max-w-lg overflow-hidden rounded-3xl bg-cream shadow-warm"
            >
              <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
                <h2 className="font-display text-lg font-bold text-charcoal">Choose Location</h2>
                <button
                  onClick={() => setLocationModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-4 py-2.5">
                    <Search className="h-4 w-4 text-warm-gray" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      placeholder="Search location..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                    />
                  </div>
                </div>

                {/* Current Location */}
                <button
                  onClick={handleGetCurrentLocation}
                  className="flex w-full items-center gap-3 rounded-xl border border-charcoal/10 p-4 text-left transition-colors hover:border-tomato/40"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-tomato/10">
                    <LocateFixed className="h-5 w-5 text-tomato" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Use Current Location</p>
                    <p className="text-xs text-warm-gray">Detect your location automatically</p>
                  </div>
                </button>

                {/* Saved Addresses */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">Saved Addresses</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setLocationModalOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl border border-charcoal/10 p-4 text-left transition-colors hover:border-tomato/40"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100">
                        <Home className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Home</p>
                        <p className="text-xs text-warm-gray">123 Main Street, Mumbai</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setLocationModalOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl border border-charcoal/10 p-4 text-left transition-colors hover:border-tomato/40"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-purple-100">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Work</p>
                        <p className="text-xs text-warm-gray">456 Office Road, Mumbai</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function IconButton({
  children,
  label,
  badge,
  onClick,
}: {
  children: React.ReactNode
  label: string
  badge?: number
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative grid h-9 w-9 place-items-center rounded-full text-charcoal/70 transition-colors hover:bg-white hover:text-tomato"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-tomato px-1 text-[10px] font-bold leading-none text-cream">
          {badge}
        </span>
      ) : null}
    </button>
  )
}
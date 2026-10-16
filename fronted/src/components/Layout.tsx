import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/apps/customer/components/Navbar'
import { Footer } from '@/apps/customer/components/Footer'
import { SearchModal } from '@/apps/customer/components/SearchModal'
import { CartDrawer } from '@/apps/customer/components/CartDrawer'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { AuthProvider } from '@/context/AuthContext'
import { GSAPScrollAnimations } from '@/apps/customer/components/GSAPScrollAnimations'
import { useTheme } from '@/context/ThemeContext'

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { theme } = useTheme()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [location.pathname, location.hash])

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <div className={`min-h-screen bg-cream transition-colors duration-300 ${theme}`}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream"
            >
              Skip to content
            </a>

            <Navbar onSearchClick={() => setSearchOpen(true)} />
            <main id="main-content">
              <GSAPScrollAnimations>
                <Outlet />
              </GSAPScrollAnimations>
            </main>
            <Footer />

            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDrawer />
          </div>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}
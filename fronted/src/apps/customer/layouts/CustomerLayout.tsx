// import { useEffect, useState } from 'react'
// import { Outlet, useLocation } from 'react-router-dom'
// import { Navbar } from '@/apps/customer/components/Navbar'
// import { Footer } from '@/apps/customer/components/Footer'
// import { SearchModal } from '@/apps/customer/components/SearchModal'
// import { CartDrawer } from '@/apps/customer/components/CartDrawer'
// import { CartProvider } from '@/context/CartContext'
// import { FavoritesProvider } from '@/context/FavoritesContext'
// import { GSAPScrollAnimations } from '@/apps/customer/components/GSAPScrollAnimations'
// import { useTheme } from '@/context/ThemeContext'
// import { ChatWidget } from '@/apps/customer/components/ChatWidget'

// export function CustomerLayout() {
//   const [searchOpen, setSearchOpen] = useState(false)
//   const location = useLocation()
//   const { theme } = useTheme()

//   useEffect(() => {
//     if (location.hash) {
//       const el = document.querySelector(location.hash)
//       if (el) {
//         el.scrollIntoView({ behavior: 'smooth' })
//         return
//       }
//     }
//     window.scrollTo({ top: 0 })
//   }, [location.pathname, location.hash])

//   return (
//     <FavoritesProvider>
//       <CartProvider>
//         <div className={`min-h-screen bg-cream transition-colors duration-300 ${theme}`}>
//           <a
//             href="#main-content"
//             className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream"
//           >
//             Skip to content
//           </a>

//           <Navbar onSearchClick={() => setSearchOpen(true)} />
//           <main id="main-content">
//             <GSAPScrollAnimations>
//               <Outlet />
//             </GSAPScrollAnimations>
//           </main>
//           <Footer />

//           <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
//           <CartDrawer />

//           <ChatWidget />  {/* 🔥 NEW */}

//         </div>
//       </CartProvider>
//     </FavoritesProvider>
//   )
// }



// src/apps/customer/layouts/CustomerLayout.tsx
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/apps/customer/components/Navbar'
import { Footer } from '@/apps/customer/components/Footer'
import { SearchModal } from '@/apps/customer/components/SearchModal'
import { CartDrawer } from '@/apps/customer/components/CartDrawer'
import { ChatWidget } from '@/apps/customer/components/ChatWidget'
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { GSAPScrollAnimations } from '@/apps/customer/components/GSAPScrollAnimations'
import { useTheme } from '@/context/ThemeContext'

export function CustomerLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { theme } = useTheme()

  // 🔥 Hide navbar/footer on auth pages
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/signup/partner/') ||
    location.pathname.startsWith('/partner/')   // 🔥 NEW — Partner landing pages

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
    <FavoritesProvider>
      <CartProvider>
        <div className={`min-h-screen bg-cream transition-colors duration-300 ${theme}`}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-charcoal focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream"
          >
            Skip to content
          </a>

          {/* 🔥 Navbar only on non-auth pages */}
          {!isAuthPage && <Navbar onSearchClick={() => setSearchOpen(true)} />}

          <main id="main-content">
            {isAuthPage ? (
              // 🔥 No GSAP wrapper on auth pages (full-screen layout)
              <Outlet />
            ) : (
              <GSAPScrollAnimations>
                <Outlet />
              </GSAPScrollAnimations>
            )}
          </main>

          {/* 🔥 Footer only on non-auth pages */}
          {!isAuthPage && <Footer />}

          {!isAuthPage && (
            <>
              <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
              <CartDrawer />
              <ChatWidget />
            </>
          )}
        </div>
      </CartProvider>
    </FavoritesProvider>
  )
}
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CustomerLayout } from '@/apps/customer/layouts/CustomerLayout'
import { RequireAuth } from '@/components/shared/RequireAuth'
import { Home } from '@/apps/customer/pages/Home'
import { PageSkeleton } from '@/components/shared/Skeleton'

// Route-level code splitting
const CategoryPage = lazy(() => import('@/apps/customer/pages/CategoryPage').then((m) => ({ default: m.CategoryPage })))
const BrandPage = lazy(() => import('@/apps/customer/pages/BrandPage').then((m) => ({ default: m.BrandPage })))
const Explore = lazy(() => import('@/apps/customer/pages/Explore').then((m) => ({ default: m.Explore })))
const RestaurantsPage = lazy(() => import('@/apps/customer/pages/RestaurantsPage').then((m) => ({ default: m.RestaurantsPage })))
const RestaurantDetail = lazy(() =>
  import('@/apps/customer/pages/RestaurantDetail').then((m) => ({ default: m.RestaurantDetail })),
)
const Collections = lazy(() => import('@/apps/customer/pages/Collections').then((m) => ({ default: m.Collections })))
const CollectionDetail = lazy(() =>
  import('@/apps/customer/pages/CollectionDetail').then((m) => ({ default: m.CollectionDetail })),
)
const Offers = lazy(() => import('@/apps/customer/pages/Offers').then((m) => ({ default: m.Offers })))
const OfferDetail = lazy(() => import('@/apps/customer/pages/OfferDetail').then((m) => ({ default: m.OfferDetail })))
const Favorites = lazy(() => import('@/apps/customer/pages/Favorites').then((m) => ({ default: m.Favorites })))
const Checkout = lazy(() => import('@/apps/customer/pages/Checkout').then((m) => ({ default: m.Checkout })))
const OrderTracking = lazy(() => import('@/apps/customer/pages/OrderTracking').then((m) => ({ default: m.OrderTracking })))
const Login = lazy(() => import('@/apps/customer/pages/Login').then((m) => ({ default: m.Login })))
const Signup = lazy(() => import('@/apps/customer/pages/Signup').then((m) => ({ default: m.Signup })))

// New Account pages
const Profile = lazy(() => import('@/apps/customer/pages/Profile').then((m) => ({ default: m.Profile })))
const Orders = lazy(() => import('@/apps/customer/pages/Orders').then((m) => ({ default: m.Orders })))
const Wallet = lazy(() => import('@/apps/customer/pages/Wallet').then((m) => ({ default: m.Wallet })))

// Add these imports
const Reviews = lazy(() => import('@/apps/customer/pages/Reviews').then((m) => ({ default: m.Reviews })))
const Notifications = lazy(() => import('@/apps/customer/pages/Notifications').then((m) => ({ default: m.Notifications })))
const Referral = lazy(() => import('@/apps/customer/pages/Referral').then((m) => ({ default: m.Referral })))
const About = lazy(() => import('@/apps/customer/pages/About').then((m) => ({ default: m.About })))

const NotFound = lazy(() => import('@/apps/customer/pages/NotFound').then((m) => ({ default: m.NotFound })))
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { BankOfferDetail } from '@/apps/customer/pages/BankOfferDetail'

const Loyalty = lazy(() => import('@/apps/customer/pages/Loyalty').then((m) => ({ default: m.Loyalty })))
const GiftCards = lazy(() => import('@/apps/customer/pages/GiftCards').then((m) => ({ default: m.GiftCards })))

const ForgotPassword = lazy(() => import('@/apps/customer/pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('@/apps/customer/pages/ResetPassword').then((m) => ({ default: m.ResetPassword })))

const PartnerRestaurant = lazy(() => import('@/apps/customer/pages/PartnerRestaurant').then((m) => ({ default: m.PartnerRestaurant, })))
const PartnerDelivery = lazy(() => import('@/apps/customer/pages/PartnerDelivery').then((m) => ({ default: m.PartnerDelivery, })))

export function CustomerApp() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/explore"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Explore />
              </Suspense>
            }
          />
          <Route
            path="/restaurants"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <RestaurantsPage />
              </Suspense>
            }
          />
          <Route
            path="/restaurants/:restaurantId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <RestaurantDetail />
              </Suspense>
            }
          />
          <Route
            path="/collections"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Collections />
              </Suspense>
            }
          />
          <Route
            path="/collections/:collectionId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <CollectionDetail />
              </Suspense>
            }
          />
          <Route
            path="/offers"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Offers />
              </Suspense>
            }
          />
          <Route
            path="/offers/:offerId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <OfferDetail />
              </Suspense>
            }
          />
          <Route path="/offers/bank/:offerId" element={<BankOfferDetail />} />
          <Route
            path="/explore/:categoryId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <CategoryPage />
              </Suspense>
            }
          />
          <Route
            path="/explore/:categoryId/:brandId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <BrandPage />
              </Suspense>
            }
          />
          <Route
            path="/favorites"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Favorites />
              </Suspense>
            }
          />
          <Route
            path="/loyalty"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Loyalty />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/gift-cards"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <GiftCards />
              </Suspense>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Checkout />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/order/:orderId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <OrderTracking />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Login />
              </Suspense>
            }
          />
          {/* 🔥 Customer Signup (default) */}
          <Route
            path="/signup"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Signup />
              </Suspense>
            }
          />

          {/* 🔥 Restaurant Partner Signup */}
          <Route
            path="/signup/partner/restaurant"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Signup />
              </Suspense>
            }
          />

          {/* 🔥 Partner Landing Pages */}
          <Route
            path="/partner/restaurant"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PartnerRestaurant />
              </Suspense>
            }
          />
          <Route
            path="/partner/delivery"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <PartnerDelivery />
              </Suspense>
            }
          />

          {/* 🔥 Delivery Partner Signup */}
          <Route
            path="/signup/partner/delivery"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Signup />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ResetPassword />
              </Suspense>
            }
          />
          {/* New Account Routes */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Profile />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Orders />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/wallet"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Wallet />
                </Suspense>
              </RequireAuth>
            }
          />

          <Route
            path="/reviews"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Reviews />
              </Suspense>
            }
          />
          <Route
            path="/reviews/:restaurantId"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Reviews />
              </Suspense>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Notifications />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/referrals"
            element={
              <RequireAuth>
                <Suspense fallback={<PageSkeleton />}>
                  <Referral />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <About />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}


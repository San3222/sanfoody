// src/apps/restaurant/App.tsx
import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RestaurantLayout } from '@/apps/restaurant/layouts/RestaurantLayout'
import { PageSkeleton } from '@/components/shared/Skeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

// Route-level code splitting
const Dashboard = lazy(() =>
  import('@/apps/restaurant/pages/Dashboard').then((m) => ({ default: m.RestaurantDashboard }))
)
const Orders = lazy(() =>
  import('@/apps/restaurant/pages/Orders').then((m) => ({ default: m.RestaurantOrders }))
)
const MenuManager = lazy(() =>
  import('@/apps/restaurant/pages/MenuManager').then((m) => ({ default: m.RestaurantMenuManager }))
)
const Analytics = lazy(() =>
  import('./pages/Analytics').then((m) => ({ default: m.RestaurantAnalytics }))
)
const Reviews = lazy(() =>
  import('./pages/Reviews').then((m) => ({ default: m.RestaurantReviews }))
)
const Settings = lazy(() =>
  import('@/apps/restaurant/pages/Settings').then((m) => ({ default: m.RestaurantSettings }))
)

const NotFound = lazy(() =>
  import('@/apps/customer/pages/NotFound').then((m) => ({ default: m.NotFound }))
)

export function RestaurantApp() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<RestaurantLayout />}>
          {/* 🔥 Default redirect to dashboard */}
          <Route
            index
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="orders"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Orders />
              </Suspense>
            }
          />

          <Route
            path="menu"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <MenuManager />
              </Suspense>
            }
          />

          <Route
            path="analytics"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Analytics />
              </Suspense>
            }
          />

          <Route
            path="reviews"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Reviews />
              </Suspense>
            }
          />

          <Route
            path="settings"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Settings />
              </Suspense>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
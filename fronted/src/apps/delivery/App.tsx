

import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { DeliveryLayout  } from '@/apps/delivery/layouts/DeliveryLayouts'
import { RequireAuth } from '@/components/shared/RequireAuth'
import { PageSkeleton } from '@/components/shared/Skeleton'

// Route-level code splitting
const DeliveryDashbaord = lazy(() => import('@/apps/delivery/pages/Dashboard').then((m) => ({ default: m.DeliveryDashboard  })))
const AvailableOrders = lazy(() => import('@/apps/delivery/pages/AvailableOrders').then((m) => ({ default: m.AvailableOrders  })))
const MyDeliveries  = lazy(() => import('@/apps/delivery/pages/MyDeliveries').then((m) => ({ default: m.MyDeliveries  })))
const Earnings  = lazy(() => import('@/apps/delivery/pages/Earnings').then((m) => ({ default: m.DeliveryEarnings  })))



const NotFound = lazy(() => import('@/apps/customer/pages/NotFound').then((m) => ({ default: m.NotFound })))
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export function DeliveryApp() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<DeliveryLayout  />}>
          <Route
            path="/available-orders"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <AvailableOrders />
              </Suspense>
            }
          />
          <Route
            path="/my-deliveries"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <MyDeliveries />
              </Suspense>
            }
          />
           <Route
            path="dashboard"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <DeliveryDashbaord />
              </Suspense>
            }
          />
          <Route
            path="/earnings"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Earnings />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}


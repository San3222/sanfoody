import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/apps/admin/layouts/AdminLayout'
import { PageSkeleton } from '@/components/shared/Skeleton'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const AdminDashboard = lazy(() =>
    import('@/apps/admin/pages/Dashboard').then((m) => ({ default: m.AdminDashboard }))
)
const AdminOrders = lazy(() =>
    import('@/apps/admin/pages/Orders').then((m) => ({ default: m.AdminOrders }))
)
const AdminRestaurantApprovals = lazy(() =>
    import('@/apps/admin/pages/RestaurantApprovals').then((m) => ({
        default: m.AdminRestaurantApprovals,
    }))
)
const AdminUsers = lazy(() =>
    import('@/apps/admin/pages/Users').then((m) => ({ default: m.AdminUsers }))
)
const AdminAnalytics = lazy(() =>
    import('@/apps/admin/pages/Analytics').then((m) => ({ default: m.Analytics }))
)
const AdminSettings = lazy(() =>
    import('@/apps/admin/pages/Settings').then((m) => ({ default: m.AdminSettings }))
)
const AdminPayouts = lazy(() =>
    import('@/apps/admin/pages/Payouts').then((m) => ({ default: m.AdminPayouts }))
)

const NotFound = lazy(() =>
    import('@/apps/customer/pages/NotFound').then((m) => ({ default: m.NotFound }))
)

const AdminChats = lazy(() =>
    import('@/apps/admin/pages/Chats').then((m) => ({ default: m.AdminChats }))
)

const UserDetail = lazy(() =>
    import('@/apps/admin/pages/UserDetail').then((m) => ({ default: m.UserDetail }))
)

const OrderDetail = lazy(() =>
    import('@/apps/admin/pages/OrderDetail').then((m) => ({ default: m.OrderDetail }))
)

const DeliveryPartners = lazy(() =>
    import('@/apps/admin/pages/DeliveryPartners').then((m) => ({ default: m.AdminDeliveryPartners }))
)

export function AdminApp() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route element={<AdminLayout />}>
                    <Route
                        index
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminDashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="dashboard"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminDashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="restaurants"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminRestaurantApprovals />
                            </Suspense>
                        }
                    />
                    <Route
                        path="delivery-partners"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <DeliveryPartners />
                            </Suspense>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminUsers />
                            </Suspense>
                        }
                    />
                    <Route
                        path="users/:userId"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <UserDetail />
                            </Suspense>
                        }
                    />
                    <Route
                        path="analytics"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminAnalytics />
                            </Suspense>
                        }
                    />
                    <Route
                        path="orders"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminOrders />
                            </Suspense>
                        }
                    />
                    <Route
                        path="orders/:orderId"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <OrderDetail />
                            </Suspense>
                        }
                    />
                    <Route
                        path="payouts"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminPayouts />
                            </Suspense>
                        }
                    />
                    <Route
                        path="chats"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminChats />
                            </Suspense>
                        }
                    />
                    <Route
                        path="settings"
                        element={
                            <Suspense fallback={<PageSkeleton />}>
                                <AdminSettings />
                            </Suspense>
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </ErrorBoundary>
    )
}
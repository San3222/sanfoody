// src/apps/restaurant/pages/Dashboard.tsx
import { Link } from 'react-router-dom'
import {
    Package,
    UtensilsCrossed,
    IndianRupee,
    Star,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import {
    useRestaurantStats,
    useRestaurantOrders,
    useToggleRestaurantAvailability,
} from '@/api/restaurantHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function RestaurantDashboard() {
    const { data: stats, isLoading: statsLoading } = useRestaurantStats()
    const { data: ordersData, isLoading: ordersLoading } = useRestaurantOrders('all', 1, 5)
    const toggleAvailability = useToggleRestaurantAvailability()
    const { showToast } = useToast()

    const isAccepting = stats?.restaurant?.isAcceptingOrders ?? true
    const recentOrders = ordersData?.orders ?? []

    const handleToggleAvailability = () => {
        toggleAvailability.mutate(
            { isAcceptingOrders: !isAccepting },
            {
                onSuccess: () => {
                    showToast(
                        'success',
                        isAccepting ? 'Orders paused' : 'Now accepting orders!'
                    )
                },
                onError: (err: any) => {
                    showToast('error', err.message || 'Failed to update')
                },
            }
        )
    }

    // Stats data for cards
    const statCards = [
        {
            label: "Today's Orders",
            value: stats?.today?.orders ?? 0,
            icon: Package,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: "Today's Revenue",
            value: `₹${stats?.today?.revenue ?? 0}`,
            icon: IndianRupee,
            color: 'bg-green-100 text-green-600',
        },
        {
            label: 'Menu Items',
            value: stats?.menu?.totalItems ?? 0,
            icon: UtensilsCrossed,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            label: 'Avg Rating',
            value: stats?.reviews?.averageRating?.toFixed(1) ?? '0.0',
            icon: Star,
            color: 'bg-gold/10 text-gold',
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Dashboard</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Welcome back, {stats?.restaurant?.name ?? 'Partner'}
                    </p>
                </div>

                {/* Availability Toggle */}
                <button
                    onClick={handleToggleAvailability}
                    disabled={toggleAvailability.isPending}
                    className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60',
                        isAccepting
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                    )}
                >
                    <span className="relative flex h-2 w-2">
                        {isAccepting && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                        )}
                        <span
                            className={cn(
                                'relative inline-flex h-2 w-2 rounded-full',
                                isAccepting ? 'bg-green-500' : 'bg-red-500'
                            )}
                        />
                    </span>
                    {toggleAvailability.isPending
                        ? 'Updating...'
                        : isAccepting
                            ? 'Accepting Orders'
                            : 'Paused'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="p-5">
                        <div className="flex items-start justify-between">
                            <div className={cn('rounded-xl p-2', stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-3 font-display text-2xl font-bold text-charcoal">
                            {statsLoading ? '—' : stat.value}
                        </p>
                        <p className="text-sm text-warm-gray">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* Order Status Breakdown */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="flex items-center gap-4 p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-100">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.pending ?? 0}
                        </p>
                        <p className="text-sm text-warm-gray">Pending</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100">
                        <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.active ?? 0}
                        </p>
                        <p className="text-sm text-warm-gray">Active</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.completed ?? 0}
                        </p>
                        <p className="text-sm text-warm-gray">Completed</p>
                    </div>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-charcoal">Recent Orders</h2>
                    <Link
                        to="/restaurant/orders"
                        className="flex items-center gap-1 text-sm font-semibold text-tomato hover:underline"
                    >
                        View all
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <Card className="overflow-hidden p-0">
                    {ordersLoading ? (
                        <div className="space-y-3 p-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No orders yet</p>
                            <p className="text-xs text-warm-gray">
                                Orders will appear here as customers order
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-charcoal/5">
                            {recentOrders.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-beige/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-xs font-bold text-charcoal">
                                                {order.orderId}
                                            </p>
                                            <Badge
                                                variant={
                                                    order.status === 'pending'
                                                        ? 'warning'
                                                        : order.status === 'delivered'
                                                            ? 'success'
                                                            : order.status === 'cancelled'
                                                                ? 'danger'
                                                                : 'info'
                                                }
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 truncate text-sm text-warm-gray">
                                            {order.user?.name} · {order.items.length} item
                                            {order.items.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-bold text-charcoal">₹{order.total}</p>
                                        <p className="text-xs text-warm-gray">
                                            {new Date(order.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link to="/restaurant/menu">
                    <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
                        <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tomato/10">
                                <UtensilsCrossed className="h-6 w-6 text-tomato" />
                            </div>
                            <div>
                                <p className="font-semibold text-charcoal">Manage Menu</p>
                                <p className="text-sm text-warm-gray">
                                    {stats?.menu?.totalItems ?? 0} items live
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-1" />
                    </Card>
                </Link>

                <Link to="/restaurant/analytics">
                    <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
                        <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-charcoal">View Analytics</p>
                                <p className="text-sm text-warm-gray">
                                    {stats?.today?.orders ?? 0} orders today
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-1" />
                    </Card>
                </Link>
            </div>
        </div>
    )
}
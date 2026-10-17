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
    Power,
    Activity
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
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
        <div className="pb-12">
            {/* ============================================
                Header & Availability Toggle
                ============================================ */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Dashboard</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Welcome back, <span className="font-semibold text-charcoal">{stats?.restaurant?.name ?? 'Partner'}</span>
                    </p>
                </div>

                {/* 🔥 Premium Toggle Switch */}
                <button
                    onClick={handleToggleAvailability}
                    disabled={toggleAvailability.isPending}
                    className={cn(
                        'group flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all shadow-sm',
                        isAccepting
                            ? 'border-green-200 bg-green-50 hover:bg-green-100'
                            : 'border-red-200 bg-red-50 hover:bg-red-100',
                        toggleAvailability.isPending && 'opacity-60 cursor-not-allowed'
                    )}
                >
                    <div className={cn(
                        "grid h-8 w-8 place-items-center rounded-full transition-colors",
                        isAccepting ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    )}>
                        <Power className="h-4 w-4" />
                    </div>
                    <div className="text-left pr-2">
                        <p className={cn("text-sm font-bold", isAccepting ? "text-green-700" : "text-red-700")}>
                            {toggleAvailability.isPending ? 'Updating...' : isAccepting ? 'Accepting Orders' : 'Store Paused'}
                        </p>
                        <p className="text-[10px] font-medium opacity-70">
                            {isAccepting ? 'Click to pause' : 'Click to open'}
                        </p>
                    </div>

                    {/* Custom Switch knob */}
                    <div className={cn(
                        "relative h-6 w-11 rounded-full transition-colors",
                        isAccepting ? "bg-green-500" : "bg-charcoal/20"
                    )}>
                        <span className={cn(
                            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300",
                            isAccepting ? "left-[22px]" : "left-0.5"
                        )} />
                    </div>
                </button>
            </div>

            {/* ============================================
                Stats Grid
                ============================================ */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <Card key={i} className="p-5 transition-all hover:shadow-warm group border-charcoal/5">
                        <div className="flex items-start justify-between">
                            <div className={cn('rounded-xl p-2.5 transition-transform group-hover:scale-110', stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-4 font-display text-3xl font-bold text-charcoal tracking-tight">
                            {statsLoading ? '—' : stat.value}
                        </p>
                        <p className="mt-1 text-sm font-medium text-warm-gray">{stat.label}</p>
                    </Card>
                ))}
            </div>

            {/* ============================================
                Order Status Strip
                ============================================ */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="flex items-center justify-between p-5 border-l-4 border-l-yellow-400">
                    <div>
                        <p className="text-sm font-semibold text-warm-gray mb-1">Pending Orders</p>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.pending ?? 0}
                        </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-yellow-50">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                </Card>

                <Card className="flex items-center justify-between p-5 border-l-4 border-l-blue-400">
                    <div>
                        <p className="text-sm font-semibold text-warm-gray mb-1">Active Orders</p>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.active ?? 0}
                        </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-50">
                        <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                </Card>

                <Card className="flex items-center justify-between p-5 border-l-4 border-l-green-400">
                    <div>
                        <p className="text-sm font-semibold text-warm-gray mb-1">Completed</p>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {stats?.orders?.completed ?? 0}
                        </p>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-green-50">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                </Card>
            </div>

            {/* ============================================
                Recent Orders
                ============================================ */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
                        <Activity className="h-5 w-5 text-tomato" />
                        Recent Orders
                    </h2>
                    <Link
                        to="/restaurant/orders"
                        className="group flex items-center gap-1 text-sm font-semibold text-tomato hover:text-orange transition-colors"
                    >
                        View all orders
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <Card className="overflow-hidden p-0 border-charcoal/5">
                    {ordersLoading ? (
                        <div className="space-y-3 p-5">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="grid h-16 w-16 place-items-center rounded-full bg-beige mb-3">
                                <Package className="h-8 w-8 text-charcoal/20" />
                            </div>
                            <p className="font-display font-bold text-charcoal text-lg">No orders yet</p>
                            <p className="text-sm text-warm-gray mt-1 max-w-xs">
                                When customers place an order, it will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-charcoal/5">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order._id}
                                    to="/restaurant/orders"
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-beige/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-sm font-bold text-charcoal">
                                                #{order.orderId}
                                            </p>
                                            <Badge
                                                variant={
                                                    order.status === 'pending' ? 'warning'
                                                        : order.status === 'delivered' ? 'success'
                                                            : order.status === 'cancelled' ? 'danger'
                                                                : 'info'
                                                }
                                                className="capitalize"
                                            >
                                                {order.status.replace(/-/g, ' ')}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-warm-gray">
                                            <span className="font-medium text-charcoal">{order.user?.name || 'Guest'}</span> · {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <p className="font-display font-bold text-charcoal">₹{order.total}</p>
                                        <p className="text-xs text-warm-gray">
                                            {new Date(order.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* ============================================
                Quick Actions
                ============================================ */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link to="/restaurant/menu">
                    <Card className="group flex items-center justify-between p-6 transition-all hover:shadow-warm border-charcoal/5">
                        <div className="flex items-center gap-5">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-tomato/10 transition-transform group-hover:scale-110">
                                <UtensilsCrossed className="h-7 w-7 text-tomato" />
                            </div>
                            <div>
                                <p className="font-display text-base font-bold text-charcoal">Manage Menu</p>
                                <p className="text-sm text-warm-gray mt-0.5">
                                    You have {stats?.menu?.totalItems ?? 0} items live
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-charcoal/20 transition-all group-hover:translate-x-1 group-hover:text-tomato" />
                    </Card>
                </Link>

                <Link to="/restaurant/analytics">
                    <Card className="group flex items-center justify-between p-6 transition-all hover:shadow-warm border-charcoal/5">
                        <div className="flex items-center gap-5">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-100 transition-transform group-hover:scale-110">
                                <TrendingUp className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-display text-base font-bold text-charcoal">View Analytics</p>
                                <p className="text-sm text-warm-gray mt-0.5">
                                    {stats?.today?.orders ?? 0} orders today
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-charcoal/20 transition-all group-hover:translate-x-1 group-hover:text-blue-600" />
                    </Card>
                </Link>
            </div>
        </div>
    )
}
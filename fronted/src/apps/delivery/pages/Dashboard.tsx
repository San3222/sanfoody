// src/apps/delivery/pages/Dashboard.tsx
import { Link } from 'react-router-dom'
import {
    Package,
    CheckCircle2,
    IndianRupee,
    Star,
    ArrowRight,
    MapPin,
    Clock,
    TrendingUp,
    Bike,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useDeliveryStats, useAvailableOrders } from '@/api/deliveryHooks'
import { cn } from '@/lib/utils'

export function DeliveryDashboard() {
    const { data: stats, isLoading: statsLoading } = useDeliveryStats()
    const { data: availableOrders, isLoading: ordersLoading } = useAvailableOrders()

    const partner = stats?.partner
    const todayStats = stats?.today
    const activeCount = stats?.active ?? 0
    const availablePreview = (availableOrders ?? []).slice(0, 3)

    const isOnline = partner?.status === 'online'

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Dashboard</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Welcome back, {partner?.name ?? 'Partner'}
                    </p>
                </div>

                <Badge variant={isOnline ? 'success' : 'neutral'}>
                    <span className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                'h-2 w-2 rounded-full',
                                isOnline ? 'animate-pulse bg-green-500' : 'bg-charcoal/40'
                            )}
                        />
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={CheckCircle2}
                    label="Today's Deliveries"
                    value={String(todayStats?.completed ?? 0)}
                    color="bg-blue-100 text-blue-600"
                    isLoading={statsLoading}
                />
                <StatCard
                    icon={IndianRupee}
                    label="Today's Earnings"
                    value={`₹${todayStats?.earnings ?? 0}`}
                    color="bg-green-100 text-green-600"
                    isLoading={statsLoading}
                />
                <StatCard
                    icon={Package}
                    label="Active Deliveries"
                    value={String(activeCount)}
                    color="bg-orange-100 text-orange-600"
                    isLoading={statsLoading}
                />
                <StatCard
                    icon={Star}
                    label="Rating"
                    value={`${partner?.rating?.toFixed(1) ?? '5.0'}`}
                    color="bg-gold/10 text-gold"
                    isLoading={statsLoading}
                />
            </div>

            {/* Lifetime Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="flex items-center gap-4 p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tomato/10">
                        <TrendingUp className="h-6 w-6 text-tomato" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            {partner?.totalDeliveries ?? 0}
                        </p>
                        <p className="text-sm text-warm-gray">Lifetime Deliveries</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
                        <IndianRupee className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-bold text-charcoal">
                            ₹{(partner?.totalEarnings ?? 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-warm-gray">Lifetime Earnings</p>
                    </div>
                </Card>
            </div>

            {/* Vehicle Info */}
            {partner?.vehicleType && (
                <Card className="mt-6 flex items-center gap-3 p-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-beige">
                        <MapPin className="h-5 w-5 text-tomato" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-charcoal">
                            {partner.vehicleType.charAt(0).toUpperCase() + partner.vehicleType.slice(1)}
                        </p>
                        <p className="text-xs text-warm-gray">{partner.vehicleNumber || 'No number'}</p>
                    </div>
                </Card>
            )}

            {/* Available Orders Preview */}
            <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="font-display text-lg font-bold text-charcoal">
                            Orders Waiting for Pickup
                        </h2>
                        <p className="text-sm text-warm-gray">
                            {availableOrders?.length ?? 0} order
                            {(availableOrders?.length ?? 0) !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    <Link
                        to="/delivery/available-orders"
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
                    ) : availablePreview.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No orders available right now</p>
                            <p className="text-xs text-warm-gray">
                                {isOnline
                                    ? 'New orders will appear here automatically'
                                    : 'Go online to receive orders'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-charcoal/5">
                            {availablePreview.map((order) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-beige/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-xs font-bold text-charcoal">
                                            {order.orderId}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm text-charcoal">
                                            {order.restaurant && (order.restaurant as any).name}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-warm-gray">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{order.address}</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-bold text-green-600">
                                            ₹{order.estimatedEarnings}
                                        </p>
                                        <p className="flex items-center justify-end gap-1 text-xs text-warm-gray">
                                            <Clock className="h-3 w-3" />
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
                <Link to="/delivery/available-orders">
                    <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
                        <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tomato/10">
                                <Package className="h-6 w-6 text-tomato" />
                            </div>
                            <div>
                                <p className="font-semibold text-charcoal">Browse Orders</p>
                                <p className="text-sm text-warm-gray">
                                    {availableOrders?.length ?? 0} available now
                                </p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-1" />
                    </Card>
                </Link>

                <Link to="/delivery/my-deliveries">
                    <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
                        <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100">
                                <Bike className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-charcoal">My Deliveries</p>
                                <p className="text-sm text-warm-gray">
                                    {activeCount} active · {partner?.totalDeliveries ?? 0} total
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

// ============================================
// Sub-components
// ============================================

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    isLoading,
}: {
    icon: React.ElementType
    label: string
    value: string
    color: string
    isLoading: boolean
}) {
    return (
        <Card className="p-5">
            <div className={cn('inline-flex rounded-xl p-2', color)}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-charcoal">
                {isLoading ? '—' : value}
            </p>
            <p className="text-sm text-warm-gray">{label}</p>
        </Card>
    )
}
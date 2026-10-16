// src/apps/admin/pages/Analytics.tsx
import { useState } from 'react'
import {
    TrendingUp,
    IndianRupee,
    ShoppingBag,
    Award,
    BarChart3,
    Users,
    RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { usePlatformAnalytics, useDashboardStats } from '@/api/adminHooks'
import { cn } from '@/lib/utils'

export function Analytics() {
    const [days, setDays] = useState<7 | 30 | 90>(30)
    const { data, isLoading, refetch, isRefetching } = usePlatformAnalytics(days)
    const { data: stats } = useDashboardStats()

    const dailyTrend = data?.dailyTrend ?? []
    const topRestaurants = data?.topRestaurants ?? []
    const userGrowth = data?.userGrowth ?? []
    const statusBreakdown = data?.statusBreakdown ?? {}

    const totals = dailyTrend.reduce(
        (acc, d) => ({
            revenue: acc.revenue + d.revenue,
            orders: acc.orders + d.orders,
        }),
        { revenue: 0, orders: 0 }
    )

    const newUsers = userGrowth.reduce((sum, u) => sum + u.count, 0)
    const avgOrderValue = totals.orders > 0 ? Math.round(totals.revenue / totals.orders) : 0

    const maxRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1)

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Analytics</h1>
                    <p className="mt-1 text-sm text-warm-gray">Platform-wide performance metrics</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 rounded-full bg-charcoal/5 p-1">
                        {([7, 30, 90] as const).map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                                    days === d
                                        ? 'bg-tomato text-cream'
                                        : 'text-charcoal/60 hover:text-charcoal'
                                )}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={IndianRupee}
                    label={`${days}-Day Revenue`}
                    value={`₹${totals.revenue.toLocaleString('en-IN')}`}
                    color="bg-green-100 text-green-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={ShoppingBag}
                    label={`${days}-Day Orders`}
                    value={String(totals.orders)}
                    color="bg-blue-100 text-blue-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Order Value"
                    value={`₹${avgOrderValue}`}
                    color="bg-purple-100 text-purple-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Users}
                    label="New Users"
                    value={String(newUsers)}
                    color="bg-orange-100 text-orange-600"
                    isLoading={isLoading}
                />
            </div>

            {/* Revenue Chart */}
            <div className="mt-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                                <BarChart3 className="h-5 w-5 text-tomato" />
                                Revenue Trend
                            </h2>
                            <p className="text-sm text-warm-gray">Last {days} days</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="mt-8 flex h-48 items-end gap-2">
                            {[...Array(Math.min(days, 15))].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 animate-pulse rounded-t-xl bg-charcoal/5"
                                    style={{ height: `${30 + (i % 5) * 12}%` }}
                                />
                            ))}
                        </div>
                    ) : dailyTrend.length === 0 ? (
                        <div className="mt-6 flex h-48 flex-col items-center justify-center">
                            <BarChart3 className="h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No data yet</p>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="flex h-48 items-end gap-1.5">
                                {dailyTrend.map((day) => {
                                    const pct = (day.revenue / maxRevenue) * 100
                                    const dayLabel = new Date(day.date).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                    })
                                    return (
                                        <div key={day.date} className="group relative flex-1">
                                            <div
                                                className="w-full rounded-t-lg bg-linear-to-t from-tomato to-orange transition-all hover:opacity-80"
                                                style={{ height: `${Math.max(pct, 4)}%`, minHeight: '8px' }}
                                            />
                                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-2 py-1 text-[10px] font-semibold text-cream group-hover:block">
                                                {dayLabel}: ₹{day.revenue} · {day.orders} order{day.orders !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] text-warm-gray">
                                <span>{dailyTrend[0]?.date}</span>
                                <span>{dailyTrend[dailyTrend.length - 1]?.date}</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Two-column: Top Restaurants + Status */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Restaurants */}
                <Card className="p-6">
                    <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                        <Award className="h-5 w-5 text-gold" />
                        Top Restaurants
                    </h2>
                    <p className="text-sm text-warm-gray">By revenue</p>

                    {isLoading ? (
                        <div className="mt-4 space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
                            ))}
                        </div>
                    ) : topRestaurants.length === 0 ? (
                        <div className="mt-4 flex h-48 flex-col items-center justify-center">
                            <Award className="h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No data yet</p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {topRestaurants.map((r, index) => (
                                <div
                                    key={r._id}
                                    className="flex items-center gap-3 rounded-xl border border-charcoal/5 bg-beige/30 p-3"
                                >
                                    <span
                                        className={cn(
                                            'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold',
                                            index === 0
                                                ? 'bg-gold text-cream'
                                                : index === 1
                                                    ? 'bg-charcoal/20 text-charcoal'
                                                    : index === 2
                                                        ? 'bg-orange/20 text-orange'
                                                        : 'bg-charcoal/5 text-charcoal/60'
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                    <img
                                        src={r.image}
                                        alt={r.name}
                                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-charcoal">
                                            {r.name}
                                        </p>
                                        <p className="text-xs text-warm-gray">
                                            {r.orders} order{r.orders !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <span className="shrink-0 font-display text-sm font-bold text-green-600">
                                        ₹{r.revenue.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Status Breakdown */}
                <Card className="p-6">
                    <h2 className="font-display text-lg font-bold text-charcoal">
                        Order Status Breakdown
                    </h2>
                    <p className="text-sm text-warm-gray">Last {days} days</p>

                    <div className="mt-4 space-y-3">
                        {[
                            'pending',
                            'confirmed',
                            'preparing',
                            'ready',
                            'out-for-delivery',
                            'delivered',
                            'cancelled',
                        ].map((status) => {
                            const count = statusBreakdown[status] || 0
                            const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0)
                            const pct = total > 0 ? (count / total) * 100 : 0

                            return (
                                <div key={status}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-semibold capitalize text-charcoal">
                                            {status.replace(/-/g, ' ')}
                                        </span>
                                        <span className="text-warm-gray">
                                            {count} ({pct.toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-charcoal/5">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                status === 'delivered'
                                                    ? 'bg-green-500'
                                                    : status === 'cancelled'
                                                        ? 'bg-red-500'
                                                        : 'bg-tomato'
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Platform Snapshot */}
            {stats && (
                <Card className="mt-6 p-6">
                    <h2 className="font-display text-lg font-bold text-charcoal">
                        Platform Snapshot
                    </h2>
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                            <p className="text-xs text-warm-gray">Total Users</p>
                            <p className="font-display text-lg font-bold text-charcoal">
                                {stats.users}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-warm-gray">Restaurants</p>
                            <p className="font-display text-lg font-bold text-charcoal">
                                {stats.restaurants}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-warm-gray">Active Now</p>
                            <p className="font-display text-lg font-bold text-green-600">
                                {stats.activeRestaurants}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-warm-gray">Pending</p>
                            <p className="font-display text-lg font-bold text-yellow-600">
                                {stats.pending}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

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
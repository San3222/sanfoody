// src/apps/restaurant/pages/Analytics.tsx
import { useMemo } from 'react'
import {
    TrendingUp,
    IndianRupee,
    ShoppingBag,
    Award,
    BarChart3,
    RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useRestaurantAnalytics, useRestaurantStats } from '@/api/restaurantHooks'
import { cn } from '@/lib/utils'

export function RestaurantAnalytics() {
    const { data, isLoading, refetch, isRefetching } = useRestaurantAnalytics()
    const { data: stats } = useRestaurantStats()

    const dailyTrend = data?.dailyTrend ?? []
    const topItems = data?.topItems ?? []

    // Compute totals
    const totals = useMemo(() => {
        const revenue = dailyTrend.reduce((sum, d) => sum + d.revenue, 0)
        const orders = dailyTrend.reduce((sum, d) => sum + d.orders, 0)
        const avgOrderValue = orders > 0 ? Math.round(revenue / orders) : 0
        return { revenue, orders, avgOrderValue }
    }, [dailyTrend])

    // Max revenue for bar scaling
    const maxRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1)

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Analytics</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Track your restaurant's performance
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                >
                    <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={IndianRupee}
                    label="7-Day Revenue"
                    value={`₹${totals.revenue.toLocaleString('en-IN')}`}
                    color="bg-green-100 text-green-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="7-Day Orders"
                    value={String(totals.orders)}
                    color="bg-blue-100 text-blue-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Order Value"
                    value={`₹${totals.avgOrderValue}`}
                    color="bg-purple-100 text-purple-600"
                    isLoading={isLoading}
                />
                <StatCard
                    icon={Award}
                    label="Total Reviews"
                    value={String(stats?.reviews?.totalReviews ?? 0)}
                    color="bg-gold/10 text-gold"
                    isLoading={isLoading}
                />
            </div>

            {/* 7-Day Revenue Chart */}
            <div className="mt-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                                <BarChart3 className="h-5 w-5 text-tomato" />
                                Revenue Trend
                            </h2>
                            <p className="text-sm text-warm-gray">Last 7 days</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="mt-8 flex h-48 items-end gap-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div
                                    key={i}
                                    className="flex-1 animate-pulse rounded-t-xl bg-charcoal/5"
                                    style={{ height: `${30 + i * 8}%` }}
                                />
                            ))}
                        </div>
                    ) : dailyTrend.length === 0 ? (
                        <div className="mt-6 flex h-48 flex-col items-center justify-center">
                            <BarChart3 className="h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No revenue data yet</p>
                            <p className="text-xs text-warm-gray">
                                Complete some orders to see your trend
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <div className="flex h-48 items-end gap-3">
                                {dailyTrend.map((day) => {
                                    const heightPct = (day.revenue / maxRevenue) * 100
                                    const dayLabel = new Date(day.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                    })
                                    return (
                                        <div
                                            key={day.date}
                                            className="flex flex-1 flex-col items-center gap-2"
                                        >
                                            <div className="group relative w-full">
                                                <div
                                                    className="w-full rounded-t-xl bg-linear-to-t from-tomato to-orange transition-all hover:opacity-80"
                                                    style={{
                                                        height: `${Math.max(heightPct, 4)}%`,
                                                        minHeight: '8px',
                                                    }}
                                                />
                                                {/* Tooltip */}
                                                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-2 py-1 text-[10px] font-semibold text-cream group-hover:block">
                                                    ₹{day.revenue} · {day.orders} order{day.orders !== 1 ? 's' : ''}
                                                </div>
                                            </div>
                                            <span className="text-xs text-warm-gray">{dayLabel}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* X-axis labels */}
                            <div className="mt-3 flex justify-between text-[10px] text-warm-gray">
                                <span>{dailyTrend[0]?.date}</span>
                                <span>{dailyTrend[dailyTrend.length - 1]?.date}</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Top Selling Items */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                                <Award className="h-5 w-5 text-gold" />
                                Top Selling Items
                            </h2>
                            <p className="text-sm text-warm-gray">Last 30 days</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="mt-4 space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
                            ))}
                        </div>
                    ) : topItems.length === 0 ? (
                        <div className="mt-4 flex h-48 flex-col items-center justify-center">
                            <Award className="h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 text-sm text-warm-gray">No items sold yet</p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {topItems.map((item, index) => (
                                <div
                                    key={item.name}
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
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-charcoal">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-warm-gray">
                                            {item.quantity} sold · ₹{item.revenue.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <Badge variant="success">🔥</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Insights */}
                <Card className="p-6">
                    <h2 className="font-display text-lg font-bold text-charcoal">Quick Insights</h2>
                    <p className="text-sm text-warm-gray">At a glance</p>

                    <div className="mt-4 space-y-4">
                        <InsightRow
                            label="Average Rating"
                            value={`${stats?.reviews?.averageRating?.toFixed(1) ?? '0.0'} ★`}
                            trend="+0.2"
                        />
                        <InsightRow
                            label="Accepting Orders"
                            value={stats?.restaurant?.isAcceptingOrders ? 'Yes' : 'Paused'}
                            trend={stats?.restaurant?.isAcceptingOrders ? '🟢' : '🔴'}
                        />
                        <InsightRow
                            label="Pending Orders"
                            value={String(stats?.orders?.pending ?? 0)}
                            trend={stats?.orders?.pending ? '⚡' : '✓'}
                        />
                        <InsightRow
                            label="Active Orders"
                            value={String(stats?.orders?.active ?? 0)}
                            trend=""
                        />
                        <InsightRow
                            label="Menu Size"
                            value={String(stats?.menu?.totalItems ?? 0)}
                            trend=""
                        />
                    </div>
                </Card>
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

function InsightRow({
    label,
    value,
    trend,
}: {
    label: string
    value: string
    trend: string
}) {
    return (
        <div className="flex items-center justify-between border-b border-charcoal/5 pb-3 last:border-0">
            <span className="text-sm text-warm-gray">{label}</span>
            <span className="flex items-center gap-2 font-semibold text-charcoal">
                {value}
                {trend && <span className="text-xs">{trend}</span>}
            </span>
        </div>
    )
}
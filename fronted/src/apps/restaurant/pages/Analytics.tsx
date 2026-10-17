// src/apps/restaurant/pages/Analytics.tsx
import { useMemo } from 'react'
import {
    TrendingUp,
    IndianRupee,
    ShoppingBag,
    Award,
    BarChart3,
    RefreshCw,
    Star,
    Package,
    UtensilsCrossed,
    Activity,
    CheckCircle2,
    Clock,
    Zap
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
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
    const maxRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 100) // 100 fallback for scale

    return (
        <div className="pb-12">
            {/* 🔥 Header & Refresh Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Analytics</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Track your restaurant's performance and growth
                    </p>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white px-5 text-sm font-semibold text-charcoal shadow-sm transition-all hover:border-charcoal/30 hover:bg-charcoal/5 disabled:opacity-60"
                >
                    <RefreshCw className={cn('h-4 w-4 text-warm-gray transition-colors group-hover:text-charcoal', isRefetching && 'animate-spin')} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* 🔥 Summary Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={IndianRupee}
                    label="7-Day Revenue"
                    value={`₹${totals.revenue.toLocaleString('en-IN')}`}
                    color="bg-green-100 text-green-600"
                    isLoading={isLoading}
                    trend={totals.revenue > 0 ? "+12%" : undefined}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="7-Day Orders"
                    value={String(totals.orders)}
                    color="bg-blue-100 text-blue-600"
                    isLoading={isLoading}
                    trend={totals.orders > 0 ? "+5%" : undefined}
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

            {/* 🔥 7-Day Revenue Chart */}
            <div className="mt-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                                <BarChart3 className="h-5 w-5 text-tomato" />
                                Revenue Trend
                            </h2>
                            <p className="text-sm text-warm-gray">Daily breakdown for the last 7 days</p>
                        </div>
                        <Badge variant="success" className="bg-green-50 text-green-700 hidden sm:flex">
                            <TrendingUp className="mr-1 h-3 w-3" /> Live Data
                        </Badge>
                    </div>

                    {isLoading ? (
                        <div className="flex h-64 items-end gap-3 sm:gap-6">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="flex-1 animate-pulse rounded-t-xl bg-charcoal/5" style={{ height: `${20 + (i * 10)}%` }} />
                            ))}
                        </div>
                    ) : dailyTrend.length === 0 ? (
                        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal/10 bg-beige/30">
                            <BarChart3 className="h-12 w-12 text-charcoal/20" />
                            <p className="mt-3 font-semibold text-charcoal">No revenue data yet</p>
                            <p className="text-sm text-warm-gray">Complete some orders to see your trend</p>
                        </div>
                    ) : (
                        <div className="relative mt-2 h-64 w-full">
                            {/* Y-axis guidelines (Background) */}
                            <div className="absolute inset-0 flex flex-col justify-between border-b border-charcoal/10 pb-6">
                                {[100, 75, 50, 25, 0].map((pct) => (
                                    <div key={pct} className="flex w-full items-center gap-2">
                                        <span className="w-8 shrink-0 text-right text-[10px] text-warm-gray">
                                            ₹{Math.round((maxRevenue * pct) / 100)}
                                        </span>
                                        <div className="h-px w-full bg-charcoal/5" />
                                    </div>
                                ))}
                            </div>

                            {/* Bars */}
                            <div className="absolute inset-0 flex items-end justify-between pl-10 pb-6">
                                {dailyTrend.map((day) => {
                                    const heightPct = (day.revenue / maxRevenue) * 100
                                    const dayLabel = new Date(day.date).toLocaleDateString('en-IN', {
                                        weekday: 'short',
                                    })
                                    return (
                                        <div key={day.date} className="group relative flex h-full flex-1 flex-col items-center justify-end px-1 sm:px-2">
                                            {/* Bar */}
                                            <div
                                                className="w-full max-w-[48px] rounded-t-md bg-linear-to-t from-tomato to-orange transition-all duration-300 group-hover:opacity-80 group-hover:shadow-warm"
                                                style={{
                                                    height: `${Math.max(heightPct, 1)}%`,
                                                }}
                                            />

                                            {/* Tooltip on Hover */}
                                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-cream shadow-lg group-hover:block z-10">
                                                ₹{day.revenue} <span className="text-cream/70 font-normal">({day.orders} orders)</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* X-axis Labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between pl-10">
                                {dailyTrend.map((day) => {
                                    const dayLabel = new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })
                                    return (
                                        <div key={day.date} className="flex-1 text-center text-xs font-medium text-warm-gray">
                                            {dayLabel}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* 🔥 Bottom Section */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Top Selling Items */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                                <Award className="h-5 w-5 text-gold" />
                                Top Selling Items
                            </h2>
                            <p className="text-sm text-warm-gray">Last 30 days</p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
                            ))}
                        </div>
                    ) : topItems.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal/10 bg-beige/30">
                            <Award className="h-10 w-10 text-charcoal/20" />
                            <p className="mt-3 font-semibold text-charcoal">No items sold yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {topItems.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-4 rounded-xl border border-charcoal/5 bg-white p-3 hover:bg-beige/30 transition-colors">
                                    <span className={cn(
                                        'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold shadow-sm',
                                        index === 0 ? 'bg-linear-to-br from-gold to-yellow-600 text-white' :
                                            index === 1 ? 'bg-gray-200 text-gray-700' :
                                                index === 2 ? 'bg-orange-200 text-orange-800' :
                                                    'bg-charcoal/5 text-charcoal/60'
                                    )}>
                                        #{index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-charcoal">{item.name}</p>
                                        <p className="text-xs text-warm-gray mt-0.5">{item.quantity} orders</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-display font-bold text-charcoal">₹{item.revenue.toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-fresh-green font-bold">Revenue</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Quick Insights */}
                <Card className="p-6">
                    <h2 className="font-display text-lg font-bold text-charcoal mb-6">
                        Quick Insights
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Insight Card 1 */}
                        <div className="flex flex-col gap-1 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
                            <div className="flex items-center gap-2 text-warm-gray mb-1">
                                <Star className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Rating</span>
                            </div>
                            <p className="font-display text-2xl font-bold text-charcoal">
                                {stats?.reviews?.averageRating?.toFixed(1) ?? '0.0'} <span className="text-gold text-lg">★</span>
                            </p>
                        </div>

                        {/* Insight Card 2 */}
                        <div className="flex flex-col gap-1 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
                            <div className="flex items-center gap-2 text-warm-gray mb-1">
                                <Activity className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Status</span>
                            </div>
                            <p className={cn("font-display text-lg font-bold", stats?.restaurant?.isAcceptingOrders ? "text-fresh-green" : "text-tomato")}>
                                {stats?.restaurant?.isAcceptingOrders ? 'Accepting Orders' : 'Paused'}
                            </p>
                        </div>

                        {/* Insight Card 3 */}
                        <div className="flex flex-col gap-1 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
                            <div className="flex items-center gap-2 text-warm-gray mb-1">
                                <Clock className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Pending</span>
                            </div>
                            <p className="font-display text-2xl font-bold text-charcoal">
                                {stats?.orders?.pending ?? 0}
                            </p>
                        </div>

                        {/* Insight Card 4 */}
                        <div className="flex flex-col gap-1 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
                            <div className="flex items-center gap-2 text-warm-gray mb-1">
                                <Package className="h-4 w-4" /> <span className="text-xs font-semibold uppercase">Active</span>
                            </div>
                            <p className="font-display text-2xl font-bold text-charcoal">
                                {stats?.orders?.active ?? 0}
                            </p>
                        </div>

                        {/* Insight Card 5 (Full Width) */}
                        <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-charcoal/5 bg-charcoal p-4 text-cream">
                            <div className="flex items-center gap-2">
                                <UtensilsCrossed className="h-5 w-5 text-orange" />
                                <span className="text-sm font-semibold">Menu Size</span>
                            </div>
                            <p className="font-display text-2xl font-bold">
                                {stats?.menu?.totalItems ?? 0}
                            </p>
                        </div>
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
    trend
}: {
    icon: React.ElementType
    label: string
    value: string
    color: string
    isLoading: boolean
    trend?: string
}) {
    return (
        <Card className="p-5 relative overflow-hidden group hover:shadow-warm transition-all duration-300">
            <div className="flex items-start justify-between">
                <div className={cn('inline-flex rounded-xl p-2.5', color)}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                        <TrendingUp className="h-3 w-3" /> {trend}
                    </span>
                )}
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-charcoal tracking-tight">
                {isLoading ? '—' : value}
            </p>
            <p className="mt-1 text-sm font-medium text-warm-gray">{label}</p>
        </Card>
    )
}
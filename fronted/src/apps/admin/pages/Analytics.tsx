// src/apps/admin/pages/Analytics.tsx
import { useMemo, useState } from 'react'
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Award,
  BarChart3,
  Users,
  RefreshCw,
  Download,
  Store,
  CheckCircle2,
  XCircle,
  Zap,
  CalendarDays,
} from 'lucide-react'
import { AdminButton } from '@/components/ui/AdminButton'
import { usePlatformAnalytics, useDashboardStats } from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const RANGES = [7, 30, 90] as const

const STATUS_ORDER = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out-for-delivery',
  'delivered',
  'cancelled',
]

const STATUS_COLOR: Record<string, { bar: string; dot: string }> = {
  pending: { bar: 'bg-amber-400', dot: 'bg-amber-400' },
  confirmed: { bar: 'bg-blue-400', dot: 'bg-blue-400' },
  preparing: { bar: 'bg-indigo-400', dot: 'bg-indigo-400' },
  ready: { bar: 'bg-teal-400', dot: 'bg-teal-400' },
  'out-for-delivery': { bar: 'bg-sky-400', dot: 'bg-sky-400' },
  delivered: { bar: 'bg-green-500', dot: 'bg-green-500' },
  cancelled: { bar: 'bg-red-500', dot: 'bg-red-500' },
}

type Metric = 'revenue' | 'orders'

// ============================================
// Helpers
// ============================================

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

const compact = (n: number) =>
  n >= 10_000_000
    ? `${(n / 10_000_000).toFixed(1)}Cr`
    : n >= 100_000
      ? `${(n / 100_000).toFixed(1)}L`
      : n >= 1000
        ? `${(n / 1000).toFixed(1)}k`
        : String(Math.round(n))

const keyOf = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const labelOf = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

/** Round max up to a "nice" number so axis ticks look clean. */
function niceMax(v: number) {
  if (v <= 0) return 4
  const pow = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / pow
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 4 : n <= 5 ? 5 : 10
  return nice * pow
}

// ============================================
// Page
// ============================================

export function Analytics() {
  const { showToast } = useToast()
  const [days, setDays] = useState<7 | 30 | 90>(30)
  const [metric, setMetric] = useState<Metric>('revenue')

  const { data, isLoading, refetch, isRefetching } = usePlatformAnalytics(days)
  const { data: stats } = useDashboardStats()

  const dailyTrend: any[] = data?.dailyTrend ?? []
  const topRestaurants: any[] = data?.topRestaurants ?? []
  const userGrowth: any[] = data?.userGrowth ?? []
  const statusBreakdown: Record<string, number> = data?.statusBreakdown ?? {}

  const totals = dailyTrend.reduce(
    (acc, d) => ({ revenue: acc.revenue + d.revenue, orders: acc.orders + d.orders }),
    { revenue: 0, orders: 0 }
  )
  const newUsers = userGrowth.reduce((sum, u) => sum + u.count, 0)
  const avgOrderValue = totals.orders > 0 ? Math.round(totals.revenue / totals.orders) : 0

  // Fill every day of the range (missing days = 0) so the chart is always complete.
  // Falls back to the raw API series if the dates don't line up.
  const series = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>()
    dailyTrend.forEach((d) => map.set(String(d.date).slice(0, 10), d))
    const filled: { date: string; revenue: number; orders: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = keyOf(d)
      const p = map.get(key)
      filled.push({ date: key, revenue: p?.revenue ?? 0, orders: p?.orders ?? 0 })
    }
    const filledOrders = filled.reduce((s, x) => s + x.orders, 0)
    if (filledOrders !== totals.orders) {
      return dailyTrend.map((d) => ({
        date: String(d.date).slice(0, 10),
        revenue: d.revenue,
        orders: d.orders,
      }))
    }
    return filled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyTrend, days])

  const values = series.map((s) => s[metric])
  const maxValue = Math.max(...values, 0)
  const axisMax = niceMax(maxValue)
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => axisMax * f)
  const labelStep = Math.max(1, Math.ceil(series.length / 8))

  const peak = series.reduce(
    (best, s) => (s[metric] > (best?.[metric] ?? -1) ? s : best),
    null as null | (typeof series)[number]
  )
  const avgPerDay = days > 0 ? totals[metric] / days : 0
  const hasData = totals.orders > 0 || totals.revenue > 0

  const statusTotal = Object.values(statusBreakdown).reduce((a, b) => a + b, 0)
  const delivered = statusBreakdown['delivered'] || 0
  const cancelled = statusBreakdown['cancelled'] || 0
  const deliveredRate = statusTotal ? (delivered / statusTotal) * 100 : 0
  const cancelRate = statusTotal ? (cancelled / statusTotal) * 100 : 0

  const maxRestaurantRevenue = Math.max(...topRestaurants.map((r) => r.revenue), 1)

  const handleExport = () => {
    if (series.length === 0) return showToast('error', 'Nothing to export')
    const csv = [['Date', 'Revenue', 'Orders'], ...series.map((s) => [s.date, s.revenue, s.orders])]
      .map((r) => r.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${days}d-${keyOf(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Report exported')
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Analytics</h1>
          <p className="mt-1 text-sm text-warm-gray">Platform-wide performance metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-charcoal/10">
            {RANGES.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'h-8 rounded-lg px-3.5 text-sm font-semibold transition-all',
                  days === d
                    ? 'bg-tomato text-cream shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {d} days
              </button>
            ))}
          </div>
          <AdminButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </AdminButton>
          <AdminButton variant="primary" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          icon={IndianRupee}
          tint="bg-green-50 text-green-600"
          label={`Revenue · ${days} days`}
          value={inr(totals.revenue)}
          sub={`${inr(totals.revenue / days)} per day`}
          loading={isLoading}
        />
        <KpiCard
          icon={ShoppingBag}
          tint="bg-blue-50 text-blue-600"
          label={`Orders · ${days} days`}
          value={String(totals.orders)}
          sub={`${(totals.orders / days).toFixed(1)} per day`}
          loading={isLoading}
        />
        <KpiCard
          icon={TrendingUp}
          tint="bg-purple-50 text-purple-600"
          label="Avg order value"
          value={inr(avgOrderValue)}
          sub="Revenue ÷ orders"
          loading={isLoading}
        />
        <KpiCard
          icon={Users}
          tint="bg-orange-50 text-orange-600"
          label="New users"
          value={String(newUsers)}
          sub={`Joined in ${days} days`}
          loading={isLoading}
        />
      </div>

      {/* Chart */}
      <section className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-tomato/10 text-tomato">
                <BarChart3 className="h-4 w-4" />
              </span>
              {metric === 'revenue' ? 'Revenue trend' : 'Orders trend'}
            </h2>
            <p className="mt-1 text-xs text-warm-gray">
              Daily · last {days} days
            </p>
          </div>

          <div className="flex gap-1 rounded-xl bg-beige/50 p-1">
            {(['revenue', 'orders'] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  'h-8 rounded-lg px-3.5 text-sm font-semibold capitalize transition-all',
                  metric === m
                    ? 'bg-white text-tomato shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Insight chips */}
        {!isLoading && hasData && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip icon={Zap} label="Peak day">
              {peak ? `${labelOf(peak.date)} · ${metric === 'revenue' ? inr(peak.revenue) : peak.orders}` : '—'}
            </Chip>
            <Chip icon={CalendarDays} label="Daily average">
              {metric === 'revenue' ? inr(avgPerDay) : avgPerDay.toFixed(1)}
            </Chip>
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 flex h-60 items-end gap-1.5">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t-md bg-charcoal/5"
                style={{ height: `${25 + ((i * 7) % 60)}%` }}
              />
            ))}
          </div>
        ) : !hasData ? (
          <div className="flex h-60 flex-col items-center justify-center text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-charcoal/5">
              <BarChart3 className="h-6 w-6 text-charcoal/30" />
            </div>
            <p className="mt-3 text-sm font-semibold text-charcoal">No data for this period</p>
            <p className="mt-1 text-xs text-warm-gray">Try a longer date range.</p>
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            {/* Y axis */}
            <div className="flex h-60 flex-col justify-between pb-0 text-right text-[10px] text-warm-gray">
              {ticks.map((t, i) => (
                <span key={i} className="-translate-y-1.5 leading-none first:translate-y-0 last:translate-y-1.5">
                  {metric === 'revenue' ? `₹${compact(t)}` : compact(t)}
                </span>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative h-60">
                {/* gridlines */}
                {ticks.map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-x-0 border-t border-dashed border-charcoal/10"
                    style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
                  />
                ))}

                {/* bars */}
                <div className="absolute inset-0 flex items-end gap-[3px]">
                  {series.map((s, i) => {
                    const v = s[metric]
                    const pct = (v / axisMax) * 100
                    const isPeak = peak?.date === s.date && v > 0
                    return (
                      <div
                        key={s.date}
                        className="group relative flex h-full flex-1 items-end justify-center"
                      >
                        <div
                          className={cn(
                            'w-full max-w-[36px] rounded-t-md transition-all',
                            v === 0
                              ? 'bg-charcoal/10'
                              : isPeak
                                ? 'bg-tomato'
                                : 'bg-tomato/60 group-hover:bg-tomato'
                          )}
                          style={{ height: v === 0 ? '2px' : `max(${pct}%, 4px)` }}
                        />
                        <div
                          className={cn(
                            'pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-charcoal px-2.5 py-1.5 text-[11px] text-cream shadow-lg group-hover:block',
                            i < 3 ? 'left-0' : i > series.length - 4 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                          )}
                        >
                          <p className="font-semibold">{labelOf(s.date)}</p>
                          <p className="text-cream/80">
                            {inr(s.revenue)} · {s.orders} order{s.orders !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* X axis */}
              <div className="mt-2 flex gap-[3px]">
                {series.map((s, i) => (
                  <div key={s.date} className="flex-1 text-center text-[10px] text-warm-gray">
                    {i % labelStep === 0 || i === series.length - 1 ? (
                      <span className="inline-block whitespace-nowrap">{labelOf(s.date)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Top restaurants + status */}
      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        {/* Top restaurants */}
        <section className="rounded-2xl border border-charcoal/10 bg-white p-5">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </span>
              Top restaurants
            </h2>
            <p className="mt-1 text-xs text-warm-gray">Ranked by revenue · last {days} days</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
              ))}
            </div>
          ) : topRestaurants.length === 0 ? (
            <div className="py-10 text-center">
              <Store className="mx-auto h-9 w-9 text-charcoal/20" />
              <p className="mt-2 text-sm text-warm-gray">No restaurant sales yet</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {topRestaurants.map((r, index) => (
                <li key={r._id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold',
                      index === 0
                        ? 'bg-amber-400 text-white'
                        : index === 1
                          ? 'bg-charcoal/20 text-charcoal'
                          : index === 2
                            ? 'bg-orange-200 text-orange-700'
                            : 'bg-charcoal/5 text-charcoal/60'
                    )}
                  >
                    {index + 1}
                  </span>
                  {r.image ? (
                    <img src={r.image} alt={r.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-charcoal/5 text-warm-gray">
                      <Store className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-charcoal">{r.name}</p>
                      <span className="shrink-0 font-display text-sm font-bold text-charcoal">
                        {inr(r.revenue)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-charcoal/5">
                      <div
                        className="h-full rounded-full bg-tomato"
                        style={{ width: `${(r.revenue / maxRestaurantRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-warm-gray">
                      {r.orders} order{r.orders !== 1 ? 's' : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Status breakdown */}
        <section className="rounded-2xl border border-charcoal/10 bg-white p-5">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-tomato/10 text-tomato">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Order status breakdown
            </h2>
            <p className="mt-1 text-xs text-warm-gray">Last {days} days · {statusTotal} orders</p>
          </div>

          {/* delivery vs cancel summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-green-50 p-3.5">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
              <div>
                <p className="font-display text-lg font-bold leading-none text-green-900">
                  {deliveredRate.toFixed(0)}%
                </p>
                <p className="mt-1 text-[11px] text-green-700">Delivered</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3.5">
              <XCircle className="h-6 w-6 shrink-0 text-red-600" />
              <div>
                <p className="font-display text-lg font-bold leading-none text-red-900">
                  {cancelRate.toFixed(0)}%
                </p>
                <p className="mt-1 text-[11px] text-red-700">Cancelled</p>
              </div>
            </div>
          </div>

          {/* stacked bar */}
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-charcoal/5">
            {STATUS_ORDER.map((status) => {
              const count = statusBreakdown[status] || 0
              if (!count || !statusTotal) return null
              return (
                <div
                  key={status}
                  className={STATUS_COLOR[status].bar}
                  style={{ width: `${(count / statusTotal) * 100}%` }}
                  title={`${status}: ${count}`}
                />
              )
            })}
          </div>

          {/* legend rows */}
          <ul className="mt-4 divide-y divide-charcoal/5">
            {STATUS_ORDER.map((status) => {
              const count = statusBreakdown[status] || 0
              const pct = statusTotal ? (count / statusTotal) * 100 : 0
              return (
                <li key={status} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="inline-flex items-center gap-2.5 font-medium capitalize text-charcoal">
                    <span className={cn('h-2.5 w-2.5 rounded-full', STATUS_COLOR[status].dot)} />
                    {status.replace(/-/g, ' ')}
                  </span>
                  <span className="text-warm-gray">
                    <span className="font-semibold text-charcoal">{count}</span> · {pct.toFixed(0)}%
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* Platform snapshot */}
      {stats && (
        <section className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-5">
          <h2 className="font-display text-base font-bold text-charcoal">Platform snapshot</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Snapshot label="Total users" value={stats.users} />
            <Snapshot label="Restaurants" value={stats.restaurants} />
            <Snapshot label="Active now" value={stats.activeRestaurants} tone="green" />
            <Snapshot label="Pending approval" value={stats.pending} tone="amber" />
          </div>
        </section>
      )}
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function KpiCard({
  icon: Icon,
  tint,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ElementType
  tint: string
  label: string
  value: string
  sub: string
  loading: boolean
}) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-warm-gray">{label}</p>
        <div className={cn('grid h-9 w-9 place-items-center rounded-xl', tint)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-charcoal">{loading ? '—' : value}</p>
      <p className="mt-1 text-xs text-warm-gray">{loading ? ' ' : sub}</p>
    </div>
  )
}

function Chip({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-beige/50 px-3 py-1.5 text-xs">
      <Icon className="h-3.5 w-3.5 text-tomato" />
      <span className="text-warm-gray">{label}:</span>
      <span className="font-semibold text-charcoal">{children}</span>
    </span>
  )
}

function Snapshot({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone?: 'green' | 'amber'
}) {
  return (
    <div className="rounded-xl bg-beige/40 p-4">
      <p className="text-xs text-warm-gray">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-xl font-bold',
          tone === 'green' ? 'text-green-600' : tone === 'amber' ? 'text-amber-600' : 'text-charcoal'
        )}
      >
        {value}
      </p>
    </div>
  )
}
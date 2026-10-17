// src/apps/admin/pages/Dashboard.tsx
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  Users,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Wallet,
  RefreshCw,
  BarChart3,
  Receipt,
  Bike,
  ChevronRight,
  PartyPopper,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { useDashboardStats, usePlatformAnalytics } from '@/api/adminHooks'
import { cn } from '@/lib/utils'

type Period = 7 | 30

const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`
const num = (n: number) => (n || 0).toLocaleString('en-IN')

// Chart axis ke liye chhota format: 1.2K, 3.4L, 1.1Cr
const compact = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`
  return `₹${Math.round(n)}`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function AdminDashboard() {
  const [period, setPeriod] = useState<Period>(7)
  const [selected, setSelected] = useState<string | null>(null)

  const { data: stats, isLoading: statsLoading, refetch: refetchStats, isRefetching } = useDashboardStats() as any
  const { data: analytics, isLoading: trendLoading, refetch: refetchTrend } = usePlatformAnalytics(period) as any

  // ---------- Trend (sirf real data, koi dummy nahi) ----------
  const trend: any[] = useMemo(
    () =>
      [...(analytics?.dailyTrend ?? [])].sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [analytics]
  )

  const totals = useMemo(() => {
    const revenue = trend.reduce((s, d) => s + (d.revenue || 0), 0)
    const orders = trend.reduce((s, d) => s + (d.orders || 0), 0)
    const best = trend.reduce<any>((b, d) => (!b || d.revenue > b.revenue ? d : b), null)
    return { revenue, orders, aov: orders ? revenue / orders : 0, best }
  }, [trend])

  const maxRevenue = Math.max(...trend.map((d) => d.revenue || 0), 1)
  const selectedDay = trend.find((d) => d.date === selected) ?? null

  // Aaj vs kal (trend ke last do din)
  const delta = (key: 'revenue' | 'orders') => {
    if (trend.length < 2) return null
    const cur = trend[trend.length - 1][key] || 0
    const prev = trend[trend.length - 2][key] || 0
    if (!prev) return null
    return ((cur - prev) / prev) * 100
  }

  // ---------- Needs attention ----------
  const attention = [
    {
      key: 'orders',
      label: 'Pending orders',
      sub: 'Waiting for restaurant or delivery',
      count: stats?.pending ?? 0,
      to: '/admin/orders',
      cta: 'Review',
      icon: Clock,
      tone: 'bg-orange/10 text-orange',
    },
    {
      key: 'restaurants',
      label: 'Restaurant approvals',
      sub: 'New restaurants waiting for review',
      count: stats?.pendingRestaurants ?? stats?.pendingApprovals,
      to: '/admin/restaurants',
      cta: 'Approve',
      icon: Store,
      tone: 'bg-green-100 text-green-600',
    },
    {
      key: 'payouts',
      label: 'Payout requests',
      sub: 'Delivery partners waiting for payment',
      count: stats?.pendingPayouts,
      to: '/admin/payouts',
      cta: 'Process',
      icon: Wallet,
      tone: 'bg-blue-100 text-blue-600',
    },
    {
      key: 'chats',
      label: 'Support chats',
      sub: 'Customers waiting for a reply',
      count: stats?.openChats ?? stats?.unreadChats,
      to: '/admin/chats',
      cta: 'Reply',
      icon: MessageSquare,
      tone: 'bg-purple-100 text-purple-600',
    },
  ].filter((a) => a.count !== undefined && a.count !== null)

  const openItems = attention.filter((a) => a.count > 0)

  const handleRefresh = () => {
    refetchStats()
    refetchTrend()
  }

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">{greeting()}, Admin</h1>
          <p className="mt-1 text-sm text-warm-gray">{todayLabel} · SanFoody control center</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-green-100 px-4 text-sm font-semibold text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live
          </span>
          <ActionButton
            onClick={handleRefresh}
            disabled={isRefetching}
            label="Refresh"
            iconOnly
            icon={<RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />}
          />
        </div>
      </div>

      {/* ================= Needs attention ================= */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-charcoal">Needs your attention</h2>
          {openItems.length > 0 && (
            <span className="rounded-full bg-tomato/10 px-3 py-1 text-xs font-semibold text-tomato">
              {openItems.reduce((s, a) => s + a.count, 0)} open
            </span>
          )}
        </div>

        {statsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-charcoal/5" />
            ))}
          </div>
        ) : openItems.length === 0 ? (
          <Card className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">All clear</p>
              <p className="text-sm text-warm-gray">No pending orders, approvals, payouts or chats right now.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attention.map((a) => {
              const Icon = a.icon
              const active = a.count > 0
              return (
                <Link
                  key={a.key}
                  to={a.to}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
                >
                  <Card
                    className={cn(
                      'group h-full p-4 transition-all hover:shadow-warm',
                      active ? 'ring-1 ring-tomato/30' : 'opacity-70'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn('grid h-10 w-10 place-items-center rounded-xl', a.tone)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-3xl font-extrabold text-charcoal">{num(a.count)}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-charcoal">{a.label}</p>
                    <p className="text-xs text-warm-gray">{a.sub}</p>
                    <p
                      className={cn(
                        'mt-3 inline-flex items-center gap-1 text-xs font-semibold',
                        active ? 'text-tomato' : 'text-warm-gray'
                      )}
                    >
                      {active ? a.cta : 'Nothing pending'}
                      {active && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}
                    </p>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* ================= KPIs ================= */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          icon={IndianRupee}
          tone="bg-green-100 text-green-600"
          label="Revenue today"
          value={inr(stats?.today?.revenue ?? 0)}
          delta={delta('revenue')}
          loading={statsLoading}
        />
        <KpiCard
          icon={ShoppingBag}
          tone="bg-tomato/10 text-tomato"
          label="Orders today"
          value={num(stats?.today?.orders ?? 0)}
          delta={delta('orders')}
          loading={statsLoading}
        />
        <KpiCard
          icon={Receipt}
          tone="bg-gold/10 text-gold"
          label="Revenue this month"
          value={inr(stats?.thisMonth?.revenue ?? 0)}
          loading={statsLoading}
        />
        <KpiCard
          icon={BarChart3}
          tone="bg-blue-100 text-blue-600"
          label={`Avg order value (${period}d)`}
          value={inr(totals.aov)}
          loading={trendLoading}
        />
      </div>

      {/* ================= Revenue trend ================= */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <TrendingUp className="h-5 w-5 text-tomato" />
              Revenue trend
            </h2>
            <p className="mt-1 text-sm text-warm-gray">
              {inr(totals.revenue)} from {num(totals.orders)} orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-full bg-charcoal/5 p-1">
              {([7, 30] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p)
                    setSelected(null)
                  }}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
                    period === p ? 'bg-tomato text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
                  )}
                >
                  {p} days
                </button>
              ))}
            </div>
            <Link
              to="/admin/analytics"
              className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-tomato transition hover:bg-tomato/10 sm:inline-flex"
            >
              Full analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {trendLoading ? (
          <div className="mt-6 flex h-52 items-end gap-2">
            {[...Array(period === 7 ? 7 : 15)].map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t-lg bg-charcoal/5"
                style={{ height: `${30 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
        ) : trend.length === 0 || totals.revenue === 0 ? (
          <div className="mt-6 flex h-52 flex-col items-center justify-center rounded-2xl bg-charcoal/[0.03]">
            <BarChart3 className="h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm font-semibold text-charcoal">No revenue in this period</p>
            <p className="text-xs text-warm-gray">Delivered orders will show up here.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex gap-3">
              {/* y-axis */}
              <div className="flex h-52 flex-col justify-between pb-6 text-right text-[11px] text-warm-gray">
                <span>{compact(maxRevenue)}</span>
                <span>{compact(maxRevenue / 2)}</span>
                <span>₹0</span>
              </div>

              <div className="flex h-52 flex-1 items-stretch gap-1.5 border-b border-charcoal/10 sm:gap-2">
                {trend.map((day) => {
                  const pct = Math.max(((day.revenue || 0) / maxRevenue) * 100, 3)
                  const active = selected === day.date
                  const d = new Date(day.date)
                  const label =
                    period === 7
                      ? d.toLocaleDateString('en-IN', { weekday: 'short' })
                      : d.toLocaleDateString('en-IN', { day: 'numeric' })
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelected(active ? null : day.date)}
                      className="group flex flex-1 flex-col items-center justify-end gap-1 focus:outline-none"
                      aria-label={`${d.toDateString()}: ${inr(day.revenue)}, ${day.orders} orders`}
                    >
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className={cn(
                            'w-full rounded-t-md transition-all',
                            active
                              ? 'bg-linear-to-t from-tomato to-orange'
                              : 'bg-tomato/30 group-hover:bg-tomato/60 group-focus-visible:bg-tomato/60'
                          )}
                          style={{ height: `${pct}%`, minHeight: '6px' }}
                        />
                      </div>
                      <span className={cn('h-5 text-[11px]', active ? 'font-bold text-charcoal' : 'text-warm-gray')}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-charcoal/5 px-4 py-3 text-sm">
              {selectedDay ? (
                <>
                  <span className="font-semibold text-charcoal">
                    {new Date(selectedDay.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-warm-gray">
                    <b className="text-green-600">{inr(selectedDay.revenue)}</b> · {num(selectedDay.orders)} orders
                    {selectedDay.orders > 0 && <> · {inr(selectedDay.revenue / selectedDay.orders)} avg</>}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-warm-gray">Tap a bar to see that day</span>
                  {totals.best && (
                    <span className="text-warm-gray">
                      Best day:{' '}
                      <b className="text-charcoal">
                        {new Date(totals.best.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </b>{' '}
                      · {inr(totals.best.revenue)}
                    </span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ================= Platform overview ================= */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-charcoal">Platform overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <OverviewTile to="/admin/users" icon={Users} tone="bg-blue-100 text-blue-600" label="Total users" value={num(stats?.users ?? 0)} loading={statsLoading} />
          <OverviewTile to="/admin/restaurants" icon={Store} tone="bg-green-100 text-green-600" label="Restaurants" value={num(stats?.restaurants ?? 0)} loading={statsLoading} />
          <OverviewTile to="/admin/orders" icon={ShoppingBag} tone="bg-orange/10 text-orange" label="Total orders" value={num(stats?.orders ?? 0)} loading={statsLoading} />
          {stats?.deliveryPartners !== undefined ? (
            <OverviewTile to="/admin/users" icon={Bike} tone="bg-purple-100 text-purple-600" label="Delivery partners" value={num(stats.deliveryPartners)} loading={statsLoading} />
          ) : (
            <OverviewTile to="/admin/analytics" icon={BarChart3} tone="bg-purple-100 text-purple-600" label="Analytics" value="Open" loading={false} />
          )}
        </div>
      </div>

      {/* ================= Quick actions ================= */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold text-charcoal">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction to="/admin/restaurants" icon={CheckCircle2} tone="bg-green-100 text-green-600" title="Approve restaurants" />
          <QuickAction to="/admin/payouts" icon={Wallet} tone="bg-blue-100 text-blue-600" title="Process payouts" />
          <QuickAction to="/admin/chats" icon={MessageSquare} tone="bg-purple-100 text-purple-600" title="Support chats" />
          <QuickAction to="/admin/orders" icon={ShoppingBag} tone="bg-orange/10 text-orange" title="Manage orders" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function KpiCard({
  icon: Icon,
  tone,
  label,
  value,
  delta,
  loading,
}: {
  icon: React.ElementType
  tone: string
  label: string
  value: string
  delta?: number | null
  loading: boolean
}) {
  const up = (delta ?? 0) >= 0
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        {delta != null && !loading && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
              up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            )}
            title="Compared with yesterday"
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold text-charcoal">
        {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-charcoal/10 align-middle" /> : value}
      </p>
      <p className="mt-0.5 text-sm text-warm-gray">{label}</p>
      {delta != null && !loading && <p className="mt-1 text-[11px] text-warm-gray">vs yesterday</p>}
    </Card>
  )
}

function OverviewTile({
  to,
  icon: Icon,
  tone,
  label,
  value,
  loading,
}: {
  to: string
  icon: React.ElementType
  tone: string
  label: string
  value: string
  loading: boolean
}) {
  return (
    <Link to={to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50">
      <Card className="group flex items-center gap-4 p-4 transition-all hover:shadow-warm">
        <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-bold text-charcoal">{loading ? '—' : value}</p>
          <p className="truncate text-xs text-warm-gray">{label}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-warm-gray transition-transform group-hover:translate-x-1" />
      </Card>
    </Link>
  )
}

function QuickAction({
  to,
  icon: Icon,
  tone,
  title,
}: {
  to: string
  icon: React.ElementType
  tone: string
  title: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-charcoal/10 bg-white px-4 py-3.5 shadow-sm transition hover:bg-beige/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
    >
      <div className="flex items-center gap-3">
        <div className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold text-charcoal">{title}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-warm-gray transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  iconOnly,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-charcoal/15 bg-white text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        iconOnly ? 'w-10' : 'px-4'
      )}
    >
      {icon}
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
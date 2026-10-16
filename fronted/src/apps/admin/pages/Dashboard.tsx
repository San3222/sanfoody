// src/apps/admin/pages/Dashboard.tsx
import { Link } from 'react-router-dom'
import {
  Store,
  Users,
  ShoppingBag,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { useDashboardStats, usePlatformAnalytics } from '@/api/adminHooks'
import { cn } from '@/lib/utils'

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: analytics } = usePlatformAnalytics(7)

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users ?? 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      link: '/admin/users',
    },
    {
      label: 'Restaurants',
      value: stats?.restaurants ?? 0,
      icon: Store,
      color: 'bg-green-100 text-green-600',
      link: '/admin/restaurants',
    },
    {
      label: 'Total Orders',
      value: stats?.orders ?? 0,
      icon: ShoppingBag,
      color: 'bg-orange-100 text-orange-600',
      link: '/admin/orders',
    },
    {
      label: 'Month Revenue',
      value: `₹${(stats?.thisMonth?.revenue ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-gold/10 text-gold',
    },
  ]

  // Mini chart data
  const dailyTrend = analytics?.dailyTrend ?? []
  const maxRevenue = Math.max(...dailyTrend.map((d) => d.revenue), 1)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Platform overview · SanFoody Control Center
          </p>
        </div>
        <Badge variant="success">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse" />
            Live
          </span>
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const content = (
            <Card className="p-5 transition-all hover:shadow-warm">
              <div className="flex items-start justify-between">
                <div className={cn('rounded-xl p-2', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.link && (
                  <ArrowRight className="h-4 w-4 text-charcoal/30" />
                )}
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-charcoal">
                {statsLoading ? '—' : stat.value}
              </p>
              <p className="text-sm text-warm-gray">{stat.label}</p>
            </Card>
          )

          return stat.link ? (
            <Link key={stat.label} to={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          )
        })}
      </div>

      {/* Today + Pending Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-tomato/10">
            <ShoppingBag className="h-6 w-6 text-tomato" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-charcoal">
              {stats?.today?.orders ?? 0}
            </p>
            <p className="text-sm text-warm-gray">Orders Today</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
            <IndianRupee className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-charcoal">
              ₹{(stats?.today?.revenue ?? 0).toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-warm-gray">Revenue Today</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-charcoal">
              {stats?.pending ?? 0}
            </p>
            <p className="text-sm text-warm-gray">Pending Orders</p>
          </div>
        </Card>
      </div>

      {/* Revenue Trend (7 days) */}
      <div className="mt-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <TrendingUp className="h-5 w-5 text-tomato" />
                Revenue Trend
              </h2>
              <p className="text-sm text-warm-gray">Last 7 days</p>
            </div>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-1 text-sm font-semibold text-tomato hover:underline"
            >
              Full analytics
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {dailyTrend.length === 0 ? (
            <div className="mt-6 flex h-40 flex-col items-center justify-center">
              <TrendingUp className="h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">No revenue data yet</p>
            </div>
          ) : (
            <div className="mt-6 flex h-40 items-end gap-2">
              {dailyTrend.map((day) => {
                const heightPct = (day.revenue / maxRevenue) * 100
                const dayLabel = new Date(day.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                })
                return (
                  <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-linear-to-t from-tomato to-orange transition-all hover:opacity-80"
                      style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: '8px' }}
                    />
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-2 py-1 text-[10px] font-semibold text-cream group-hover:block">
                      ₹{day.revenue} · {day.orders} order{day.orders !== 1 ? 's' : ''}
                    </div>
                    <span className="text-xs text-warm-gray">{dayLabel}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/admin/restaurants">
          <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">Restaurant Approvals</p>
                <p className="text-sm text-warm-gray">
                  {stats?.activeRestaurants ?? 0} active restaurants
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-1" />
          </Card>
        </Link>

        <Link to="/admin/payouts">
          <Card className="group flex items-center justify-between p-5 transition-all hover:shadow-warm">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/10">
                <IndianRupee className="h-6 w-6 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">Payout Approvals</p>
                <p className="text-sm text-warm-gray">Review withdrawals</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-1" />
          </Card>
        </Link>
      </div>
    </div>
  )
}
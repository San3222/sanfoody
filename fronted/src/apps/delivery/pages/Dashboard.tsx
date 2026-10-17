// src/apps/delivery/pages/Dashboard.tsx
import { Link } from 'react-router-dom'
import {
  Package,
  IndianRupee,
  Star,
  ArrowRight,
  MapPin,
  Clock,
  TrendingUp,
  Bike,
  Wallet,
  HelpCircle,
  Store,
  Banknote,
  CreditCard,
  Target,
  PowerOff,
  ChevronRight,
  Car,
  Zap,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { VerificationGate } from '@/apps/delivery/components/VerificationGate'
import { useDeliveryStats, useAvailableOrders } from '@/api/deliveryHooks'
import { useWalletBalance } from '@/api/payoutHooks'
import { cn } from '@/lib/utils'

// ---------- Config ----------
const DAILY_GOAL_DELIVERIES = 10 // TODO: backend/incentive plan ke hisaab se badlo
const MIN_WITHDRAW = 100
const SUPPORT_EMAIL = 'support@sanfoody.com' // TODO: apna support email daalo

const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/**
 * Public export: approval se pehle sirf "verification pending" screen dikhti hai.
 * Dashboard ke andar ka koi bhi data/hook tab tak chalta hi nahi.
 */
export function DeliveryDashboard() {
  return (
    <VerificationGate>
      <ApprovedDashboard />
    </VerificationGate>
  )
}

function ApprovedDashboard() {
  const { data: stats, isLoading: statsLoading } = useDeliveryStats()
  const { data: availableOrders, isLoading: ordersLoading } = useAvailableOrders()
  const { data: wallet } = useWalletBalance()

  const partner = stats?.partner
  const today = stats?.today
  const activeCount = stats?.active ?? 0
  const orders: any[] = availableOrders ?? []
  const preview = orders.slice(0, 3)

  const isOnline = partner?.status === 'online'
  const firstName = (partner?.name ?? 'Partner').split(' ')[0]

  const todayDeliveries = today?.completed ?? 0
  const todayEarnings = today?.earnings ?? 0
  const goalPct = Math.min((todayDeliveries / DAILY_GOAL_DELIVERIES) * 100, 100)
  const goalLeft = Math.max(DAILY_GOAL_DELIVERIES - todayDeliveries, 0)

  const walletBalance = wallet?.balance ?? 0
  const walletPending = wallet?.pending ?? 0

  const vehicle = partner?.vehicleType
    ? partner.vehicleType.charAt(0).toUpperCase() + partner.vehicleType.slice(1)
    : null
  const VehicleIcon = partner?.vehicleType === 'bike' || partner?.vehicleType === 'scooter' ? Bike : Car

  return (
    <div className="pb-10">
      {/* ================= Hero ================= */}
      <div className="overflow-hidden rounded-3xl bg-charcoal p-6 text-cream shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-cream/70">{greeting()},</p>
            <h1 className="font-display text-2xl font-bold">{firstName}</h1>
          </div>
          <span
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold',
              isOnline ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-cream/70'
            )}
          >
            <span
              className={cn('h-2 w-2 rounded-full', isOnline ? 'animate-pulse bg-green-400' : 'bg-cream/40')}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-cream/70">Today's earnings</p>
            <p className="mt-1 font-display text-5xl font-extrabold tracking-tight">
              {statsLoading ? '—' : inr(todayEarnings)}
            </p>
          </div>
          <div className="text-right text-sm text-cream/70">
            <p>
              <b className="text-cream">{todayDeliveries}</b> {todayDeliveries === 1 ? 'delivery' : 'deliveries'} completed
            </p>
            {todayDeliveries > 0 && <p>{inr(todayEarnings / todayDeliveries)} avg per order</p>}
          </div>
        </div>

        {/* Daily goal */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-cream">
              <Target className="h-3.5 w-3.5" />
              Daily goal
            </span>
            <span className="text-cream/70">
              {todayDeliveries} / {DAILY_GOAL_DELIVERIES} deliveries
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-linear-to-r from-orange to-tomato transition-all duration-500"
              style={{ width: `${goalPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-cream/70">
            {goalLeft > 0
              ? `${goalLeft} more ${goalLeft === 1 ? 'delivery' : 'deliveries'} to hit today's goal`
              : 'Goal reached. Great work today!'}
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {activeCount > 0 ? (
            <Link
              to="/delivery/my-deliveries"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-tomato px-5 text-sm font-bold text-cream shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Bike className="h-4 w-4" />
              Continue {activeCount === 1 ? 'delivery' : `${activeCount} deliveries`}
            </Link>
          ) : (
            <Link
              to="/delivery/available-orders"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-tomato px-5 text-sm font-bold text-cream shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Package className="h-4 w-4" />
              Browse orders{orders.length > 0 && ` (${orders.length})`}
            </Link>
          )}
          <Link
            to="/delivery/earnings"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-bold text-cream transition hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <IndianRupee className="h-4 w-4" />
            View earnings
          </Link>
        </div>
      </div>

      {/* ================= Offline notice ================= */}
      {!isOnline && !statsLoading && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3.5">
          <PowerOff className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-semibold text-charcoal">You are offline</p>
            <p className="text-xs text-warm-gray">Use the power button in the sidebar to go online and start receiving orders.</p>
          </div>
        </div>
      )}

      {/* ================= Quick stats ================= */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile icon={Zap} tone="bg-orange/10 text-orange" label="Active now" value={String(activeCount)} loading={statsLoading} />
        <StatTile
          icon={Star}
          tone="bg-gold/10 text-gold"
          label="Your rating"
          value={`${partner?.rating?.toFixed(1) ?? '5.0'} ★`}
          loading={statsLoading}
        />
        <StatTile
          icon={TrendingUp}
          tone="bg-tomato/10 text-tomato"
          label="Lifetime deliveries"
          value={String(partner?.totalDeliveries ?? 0)}
          loading={statsLoading}
        />
        <StatTile
          icon={IndianRupee}
          tone="bg-green-100 text-green-600"
          label="Lifetime earnings"
          value={inr(partner?.totalEarnings ?? 0)}
          loading={statsLoading}
        />
      </div>

      {/* ================= Wallet + Vehicle ================= */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-green-100">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-warm-gray">Wallet balance</p>
                <p className="font-display text-2xl font-bold text-charcoal">{inr(walletBalance)}</p>
              </div>
            </div>
            <Link
              to="/delivery/earnings"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
                walletBalance >= MIN_WITHDRAW && walletPending === 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'border border-charcoal/15 bg-white text-charcoal hover:bg-beige/60'
              )}
            >
              {walletBalance >= MIN_WITHDRAW && walletPending === 0 ? 'Withdraw' : 'Details'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-3 text-xs text-warm-gray">
            {walletPending > 0
              ? `${inr(walletPending)} withdrawal in progress`
              : walletBalance >= MIN_WITHDRAW
                ? 'Ready to withdraw to your UPI or bank'
                : `${inr(MIN_WITHDRAW - walletBalance)} more to unlock withdrawals`}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-beige">
              <VehicleIcon className="h-5 w-5 text-tomato" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-warm-gray">Your vehicle</p>
              <p className="font-display text-lg font-bold text-charcoal">{vehicle ?? 'Not added'}</p>
            </div>
            {partner?.vehicleNumber && (
              <span className="rounded-lg border border-charcoal/20 bg-white px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-charcoal">
                {partner.vehicleNumber}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs text-warm-gray">Keep your vehicle details up to date so restaurants can find you.</p>
        </Card>
      </div>

      {/* ================= Orders preview ================= */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-charcoal">Orders waiting for pickup</h2>
            <p className="text-sm text-warm-gray">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} available
            </p>
          </div>
          <Link
            to="/delivery/available-orders"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-tomato transition hover:bg-tomato/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
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
          ) : preview.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-charcoal/5">
                <Package className="h-7 w-7 text-charcoal/30" />
              </div>
              <p className="mt-4 font-semibold text-charcoal">No orders right now</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-warm-gray">
                {isOnline
                  ? 'New orders appear here automatically as restaurants get them ready.'
                  : 'Go online from the sidebar to start receiving orders.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal/5">
              {preview.map((order) => {
                const restaurant = order.restaurant || {}
                const isCod = order.paymentMethod === 'cod'
                const ageMin = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
                return (
                  <Link
                    key={order._id}
                    to="/delivery/available-orders"
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-beige/30"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-beige">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-5 w-5 text-warm-gray" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-charcoal">{restaurant.name || 'Restaurant'}</p>
                        {ageMin < 3 && (
                          <span className="rounded-full bg-tomato/10 px-2 py-0.5 text-[10px] font-semibold text-tomato">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-gray">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{order.address}</span>
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-warm-gray">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(order.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {isCod ? <Banknote className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                          {isCod ? 'Cash on delivery' : 'Paid online'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-bold text-green-600">{inr(order.estimatedEarnings)}</p>
                      <p className="text-[11px] text-warm-gray">you earn</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-warm-gray" />
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ================= Quick actions ================= */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <ActionTile to="/delivery/available-orders" icon={Package} tone="bg-tomato/10 text-tomato" title="Browse orders" sub={`${orders.length} available`} />
          <ActionTile to="/delivery/my-deliveries" icon={Bike} tone="bg-blue-100 text-blue-600" title="My deliveries" sub={`${activeCount} active`} />
          <ActionTile to="/delivery/earnings" icon={Wallet} tone="bg-green-100 text-green-600" title="Earnings" sub="Wallet & payouts" />
          <ActionTile href={`mailto:${SUPPORT_EMAIL}?subject=Delivery%20partner%20help`} icon={HelpCircle} tone="bg-gold/10 text-gold" title="Help & support" sub="Talk to us" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
  loading,
}: {
  icon: React.ElementType
  tone: string
  label: string
  value: string
  loading: boolean
}) {
  return (
    <Card className="p-4">
      <div className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-xl font-bold text-charcoal">{loading ? '—' : value}</p>
      <p className="text-xs text-warm-gray">{label}</p>
    </Card>
  )
}

function ActionTile({
  to,
  href,
  icon: Icon,
  tone,
  title,
  sub,
}: {
  to?: string
  href?: string
  icon: React.ElementType
  tone: string
  title: string
  sub: string
}) {
  const inner = (
    <Card className="group h-full p-4 transition-all hover:shadow-warm">
      <div className="flex items-start justify-between">
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight className="h-4 w-4 text-warm-gray transition-transform group-hover:translate-x-1" />
      </div>
      <p className="mt-3 text-sm font-semibold text-charcoal">{title}</p>
      <p className="text-xs text-warm-gray">{sub}</p>
    </Card>
  )
  const cls = 'block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50'
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {inner}
    </a>
  )
}

// ============================================
// Helpers
// ============================================

function getTimeAgo(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}
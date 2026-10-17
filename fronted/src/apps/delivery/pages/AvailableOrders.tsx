// src/apps/delivery/pages/AvailableOrders.tsx
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Bike,
  Clock,
  RefreshCw,
  Package,
  Store,
  Navigation,
  IndianRupee,
  Banknote,
  CreditCard,
  ChevronDown,
  Phone,
  PowerOff,
  Flame,
  Radar,
  ShieldAlert,
  ShieldX,
  WifiOff,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import {
  useAvailableOrders,
  useAcceptDeliveryOrder,
  useDeliveryStats,
} from '@/api/deliveryHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const MY_DELIVERIES_PATH = '/delivery/my-deliveries'

type SortKey = 'newest' | 'earning'

const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

export function AvailableOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const {
    data: orders,
    isLoading: ordersLoading,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useAvailableOrders() as any

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
    isRefetching: statsRefetching,
  } = useDeliveryStats() as any

  const acceptMutation = useAcceptDeliveryOrder()

  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('newest')

  // ---------- Verification (admin approval) ----------
  const partner = stats?.partner
  const verificationStatus: string =
    partner?.verificationStatus ??
    partner?.deliveryDetails?.verificationStatus ??
    (partner?.isVerified === true ? 'verified' : 'pending')
  const rejectionReason: string | undefined =
    partner?.rejectionReason ?? partner?.deliveryDetails?.rejectionReason

  const isVerified = verificationStatus === 'verified' || partner?.isVerified === true
  const isOnline = partner?.status === 'online'

  // Orders are NEVER used / shown until the admin has approved this partner.
  const list: any[] = isVerified ? (orders ?? []) : []

  const sorted = useMemo(() => {
    const copy = [...list]
    if (sort === 'earning')
      copy.sort((a, b) => (b.estimatedEarnings || 0) - (a.estimatedEarnings || 0))
    else
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return copy
  }, [list, sort])

  const maxEarning = Math.max(...list.map((o) => o.estimatedEarnings || 0), 0)
  const totalPotential = list.reduce((sum, o) => sum + (o.estimatedEarnings || 0), 0)

  const handleAccept = (orderId: string, restaurantName: string) => {
    if (!isVerified) return // extra safety: never accept while unverified
    setAcceptingId(orderId)
    acceptMutation.mutate(orderId, {
      onSuccess: () => {
        showToast('success', `Order accepted from ${restaurantName}`)
        setAcceptingId(null)
        navigate(MY_DELIVERIES_PATH)
      },
      onError: (err: any) => {
        showToast('error', err.message || 'Could not accept this order')
        setAcceptingId(null)
      },
    })
  }

  // ================= 1) Checking account status =================
  if (statsLoading) {
    return (
      <div className="pb-10">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-charcoal/5" />
        <div className="mt-6 space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-44 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // ================= 2) Could not load status =================
  if (statsError || !partner) {
    return (
      <GateScreen
        icon={WifiOff}
        tone="neutral"
        title="Couldn't check your account"
        message="We couldn't load your verification status. Check your connection and try again."
        onRefresh={() => refetchStats()}
        refreshing={statsRefetching}
        refreshLabel="Try again"
      />
    )
  }

  // ================= 3) Not approved by admin yet =================
  if (!isVerified) {
    const rejected = verificationStatus === 'rejected'
    return (
      <GateScreen
        icon={rejected ? ShieldX : ShieldAlert}
        tone={rejected ? 'danger' : 'warning'}
        title={rejected ? 'Verification Rejected' : 'Account Under Review'}
        message={
          rejected
            ? 'Your documents could not be approved. Please fix the issue below and contact support to get verified again.'
            : 'Your documents (Driving License, Aadhaar, etc.) are being verified by our admin team. You can see and accept orders once your account is approved.'
        }
        note={
          rejected
            ? rejectionReason
              ? `Reason: ${rejectionReason}`
              : 'No reason was provided.'
            : 'This usually takes up to 24 hours.'
        }
        onRefresh={() => refetchStats()}
        refreshing={statsRefetching}
        refreshLabel="Check status"
      />
    )
  }

  // ================= 4) Verified: normal screen =================
  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Available Orders</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {list.length} {list.length === 1 ? 'order' : 'orders'} waiting for pickup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold',
              isOnline ? 'bg-green-100 text-green-700' : 'bg-charcoal/10 text-charcoal/70'
            )}
          >
            <span
              className={cn('h-2 w-2 rounded-full', isOnline ? 'bg-green-500' : 'bg-charcoal/40')}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <ActionButton
            onClick={() => refetch()}
            disabled={isRefetching}
            label="Refresh"
            iconOnly
            icon={<RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />}
          />
        </div>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3.5">
          <PowerOff className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-semibold text-charcoal">You are offline</p>
            <p className="text-xs text-warm-gray">
              Use the power button in the sidebar to go online. You can browse orders, but you
              can't accept them.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {list.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile icon={Package} tone="bg-tomato/10 text-tomato" label="Waiting" value={String(list.length)} />
          <StatTile icon={Flame} tone="bg-orange/10 text-orange" label="Best payout" value={inr(maxEarning)} />
          <StatTile icon={IndianRupee} tone="bg-green-100 text-green-600" label="Total on offer" value={inr(totalPotential)} />
        </div>
      )}

      {/* Toolbar */}
      {list.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex gap-1 rounded-full bg-charcoal/5 p-1">
            {(
              [
                ['newest', 'Newest'],
                ['earning', 'Highest earning'],
              ] as [SortKey, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
                  sort === key ? 'bg-tomato text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-warm-gray">
            <Radar className={cn('h-3.5 w-3.5', isOnline && 'text-green-600')} />
            {dataUpdatedAt ? `Updated ${getTimeAgo(new Date(dataUpdatedAt).toISOString())}` : 'Live'}
          </p>
        </div>
      )}

      {/* List */}
      <div className="mt-5 space-y-4">
        {ordersLoading ? (
          [1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-44 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : sorted.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-charcoal/5">
              <Bike className="h-8 w-8 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">No orders right now</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-warm-gray">
              {isOnline
                ? 'New orders show up here automatically as soon as restaurants mark them ready.'
                : 'Go online from the sidebar to start receiving orders.'}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-6 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
              Check again
            </button>
          </Card>
        ) : (
          sorted.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isBest={list.length > 1 && (order.estimatedEarnings || 0) === maxEarning}
              isOnline={isOnline}
              isAccepting={acceptingId === order.orderId}
              disabled={!!acceptingId}
              onAccept={() => handleAccept(order.orderId, order.restaurant?.name || 'Restaurant')}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// Gate screen (not verified / error)
// ============================================

function GateScreen({
  icon: Icon,
  tone,
  title,
  message,
  note,
  onRefresh,
  refreshing,
  refreshLabel,
}: {
  icon: React.ElementType
  tone: 'warning' | 'danger' | 'neutral'
  title: string
  message: string
  note?: string
  onRefresh: () => void
  refreshing?: boolean
  refreshLabel: string
}) {
  const styles = {
    warning: {
      card: 'border-amber-200 bg-amber-50/50',
      ring: 'bg-amber-100 text-amber-600',
      note: 'border-amber-100 text-amber-700',
    },
    danger: {
      card: 'border-red-200 bg-red-50/50',
      ring: 'bg-red-100 text-red-600',
      note: 'border-red-100 text-red-700',
    },
    neutral: {
      card: 'border-charcoal/10 bg-white',
      ring: 'bg-charcoal/5 text-charcoal/50',
      note: 'border-charcoal/10 text-warm-gray',
    },
  }[tone]

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className={cn('w-full max-w-md rounded-2xl p-8 text-center shadow-sm', styles.card)}>
        <div className={cn('mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full', styles.ring)}>
          <Icon className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl font-bold text-charcoal">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-warm-gray">{message}</p>
        {note && (
          <div className={cn('mt-6 rounded-xl border bg-white p-3 text-xs font-medium', styles.note)}>
            {note}
          </div>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-charcoal/15 bg-white px-6 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          {refreshLabel}
        </button>
      </Card>
    </div>
  )
}

// ============================================
// Order Card
// ============================================

function OrderCard({
  order,
  isBest,
  isOnline,
  isAccepting,
  disabled,
  onAccept,
}: {
  order: any
  isBest: boolean
  isOnline: boolean
  isAccepting: boolean
  disabled: boolean
  onAccept: () => void
}) {
  const [itemsOpen, setItemsOpen] = useState(false)
  const restaurant = order.restaurant || {}
  const items: any[] = order.items ?? []
  const isCod = order.paymentMethod === 'cod'
  const codAmount = order.total ?? order.totalAmount ?? 0
  const ageMin = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  const isNew = ageMin < 3
  const distance = order.distance ?? order.distanceKm

  const openMaps = (address: string) =>
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank',
      'noopener'
    )

  return (
    <Card className={cn('overflow-hidden p-0', isBest && 'ring-1 ring-green-500/40')}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-beige">
              {restaurant.image ? (
                <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
              ) : (
                <Store className="h-6 w-6 text-warm-gray" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-charcoal">{restaurant.name || 'Restaurant'}</p>
              <p className="font-mono text-xs text-warm-gray">#{order.orderId}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {isNew && <Pill tone="bg-tomato/10 text-tomato">New</Pill>}
                {isBest && (
                  <Pill tone="bg-green-100 text-green-700">
                    <Flame className="h-3 w-3" />
                    Best pay
                  </Pill>
                )}
                <Pill tone="bg-blue-50 text-blue-700">Ready for pickup</Pill>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-extrabold text-green-600">{inr(order.estimatedEarnings)}</p>
            <p className="text-xs text-warm-gray">you earn</p>
          </div>
        </div>

        {/* Route */}
        <div className="relative mt-5 space-y-5">
          <div className="absolute bottom-10 left-5 top-10 w-px border-l-2 border-dashed border-charcoal/15" />
          <Stop
            icon={Store}
            iconClass="bg-tomato/10 text-tomato"
            title="Pickup"
            name={restaurant.name || 'Restaurant'}
            address={restaurant.address || 'Pickup address'}
            actions={
              <>
                {restaurant.phone && <MiniLink href={`tel:${restaurant.phone}`} icon={Phone} label="Call" />}
                {restaurant.address && (
                  <MiniLink onClick={() => openMaps(restaurant.address)} icon={Navigation} label="View on map" />
                )}
              </>
            }
          />
          <Stop
            icon={MapPin}
            iconClass="bg-blue-50 text-blue-600"
            title="Drop"
            name={order.user?.name || 'Customer'}
            address={order.address}
            actions={
              order.address && (
                <MiniLink onClick={() => openMaps(order.address)} icon={Navigation} label="View on map" />
              )
            }
          />
        </div>

        {/* Meta chips */}
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Chip icon={Clock}>{getTimeAgo(order.createdAt)}</Chip>
          {distance != null && <Chip icon={Navigation}>{Number(distance).toFixed(1)} km</Chip>}
          <Chip icon={isCod ? Banknote : CreditCard} highlight={isCod}>
            {isCod ? `Collect ${inr(codAmount)} cash` : 'Paid online'}
          </Chip>
        </div>

        {/* Items */}
        <button
          onClick={() => setItemsOpen((v) => !v)}
          className="mt-4 flex w-full items-center justify-between rounded-xl bg-charcoal/5 px-4 py-2.5 text-sm hover:bg-charcoal/10"
        >
          <span className="flex items-center gap-2 font-semibold text-charcoal">
            <Package className="h-4 w-4 text-warm-gray" />
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-warm-gray transition-transform', itemsOpen && 'rotate-180')} />
        </button>
        {itemsOpen && (
          <ul className="mt-2 divide-y divide-charcoal/5 rounded-xl border border-charcoal/10 px-4 text-sm">
            {items.length === 0 && <li className="py-2.5 text-warm-gray">No item details</li>}
            {items.map((it: any, i: number) => (
              <li key={i} className="flex justify-between py-2.5">
                <span className="text-charcoal">{it.name || it.title || 'Item'}</span>
                <span className="font-semibold text-warm-gray">× {it.quantity ?? it.qty ?? 1}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Accept */}
      <div className="border-t border-charcoal/10 bg-beige/30 p-4">
        <button
          onClick={onAccept}
          disabled={!isOnline || disabled}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tomato text-sm font-bold text-cream shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-charcoal/15 disabled:text-charcoal/50 disabled:shadow-none disabled:hover:opacity-100"
        >
          {isAccepting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Accepting…
            </>
          ) : !isOnline ? (
            <>
              <PowerOff className="h-4 w-4" />
              Go online to accept
            </>
          ) : (
            <>
              <Bike className="h-4 w-4" />
              Accept order · Earn {inr(order.estimatedEarnings)}
            </>
          )}
        </button>
      </div>
    </Card>
  )
}

// ============================================
// Small components
// ============================================

function Stop({
  icon: Icon,
  iconClass,
  title,
  name,
  address,
  actions,
}: {
  icon: React.ElementType
  iconClass: string
  title: string
  name: string
  address?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="relative flex items-start gap-3">
      <div className={cn('relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl', iconClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-warm-gray">{title}</p>
        <p className="truncate text-sm font-semibold text-charcoal">{name}</p>
        <p className="mt-0.5 text-xs text-warm-gray">{address || '—'}</p>
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

function MiniLink({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
}) {
  const cls =
    'inline-flex h-8 items-center gap-1.5 rounded-full border border-charcoal/15 bg-white px-3 text-xs font-semibold text-charcoal transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50'
  if (href)
    return (
      <a href={href} className={cls}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </a>
    )
  return (
    <button type="button" onClick={onClick} className={cls}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tone)}>
      {children}
    </span>
  )
}

function Chip({
  icon: Icon,
  children,
  highlight,
}: {
  icon: React.ElementType
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium',
        highlight ? 'border-gold/40 bg-gold/10 text-charcoal' : 'border-charcoal/10 text-warm-gray'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: React.ElementType
  tone: string
  label: string
  value: string
}) {
  return (
    <Card className="p-4">
      <div className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-xl font-bold text-charcoal">{value}</p>
      <p className="text-xs text-warm-gray">{label}</p>
    </Card>
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
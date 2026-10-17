// src/apps/delivery/pages/MyDeliveries.tsx
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Clock,
  Navigation,
  Radio,
  Store,
  RefreshCw,
  Bike,
  Copy,
  ChevronDown,
  IndianRupee,
  Banknote,
  Search,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import {
  useMyDeliveries,
  useMarkPickedUp,
  useMarkDelivered,
} from '@/api/deliveryHooks'
import { useToast } from '@/context/ToastContext'
import { updateDeliveryLocation } from '@/api/deliveryClient'
import { cn } from '@/lib/utils'

type TabFilter = 'active' | 'completed'

const AVAILABLE_ORDERS_PATH = '/delivery/available-orders' // TODO: apna real route daalo
const LOCATION_INTERVAL_MS = 15000

const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

export function MyDeliveries() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabFilter>('active')
  const [isSharingLocation, setIsSharingLocation] = useState(false)

  // Dono lists fetch karte hain taaki tab me counts aur live-location kisi bhi tab par chale
  const activeQ = useMyDeliveries('active', 1, 20)
  const completedQ = useMyDeliveries('completed', 1, 20)
  const pickUpMutation = useMarkPickedUp()
  const deliverMutation = useMarkDelivered()
  const { showToast } = useToast()

  const activeList: any[] = activeQ.data?.orders ?? []
  const completedList: any[] = completedQ.data?.orders ?? []
  const deliveries = tab === 'active' ? activeList : completedList
  const isLoading = tab === 'active' ? activeQ.isLoading : completedQ.isLoading
  const isRefetching = activeQ.isRefetching || completedQ.isRefetching

  const outForDelivery = activeList.find((d) => d.status === 'out-for-delivery')
  const hasActiveDelivery = !!outForDelivery

  // ---------- Today stats ----------
  const todayStats = useMemo(() => {
    const k = new Date().toDateString()
    const rows = completedList.filter((d) => new Date(d.updatedAt || d.createdAt).toDateString() === k)
    return {
      count: rows.length,
      earnings: rows.reduce((sum, d) => sum + (d.deliveryEarnings || 0), 0),
    }
  }, [completedList])

  // ---------- Live location ----------
  useEffect(() => {
    if (!outForDelivery || !isSharingLocation) return
    if (!navigator.geolocation) return

    let cancelled = false
    const send = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (cancelled) return
          try {
            await updateDeliveryLocation(outForDelivery.orderId, pos.coords.latitude, pos.coords.longitude)
          } catch (err) {
            console.error('Failed to update location:', err)
          }
        },
        (error) => console.warn('Geolocation update failed:', error.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      )
    }

    send()
    const id = setInterval(send, LOCATION_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [outForDelivery?.orderId, isSharingLocation])

  // Active delivery khatam ho gayi to sharing band
  useEffect(() => {
    if (!hasActiveDelivery && isSharingLocation) setIsSharingLocation(false)
  }, [hasActiveDelivery, isSharingLocation])

  // ---------- Handlers ----------
  const refreshAll = () => {
    activeQ.refetch()
    completedQ.refetch()
  }

  const handlePickUp = (orderId: string) => {
    pickUpMutation.mutate(orderId, {
      onSuccess: () => showToast('success', 'Picked up. Head to the customer'),
      onError: (err: any) => showToast('error', err.message || 'Could not confirm pickup'),
    })
  }

  const handleDelivered = (orderId: string) => {
    if (!confirm(`Mark order ${orderId} as delivered?`)) return
    deliverMutation.mutate(orderId, {
      onSuccess: () => {
        showToast('success', 'Order delivered. Earnings added')
        setIsSharingLocation(false)
      },
      onError: (err: any) => showToast('error', err.message || 'Could not mark delivered'),
    })
  }

  const toggleLocationSharing = () => {
    const next = !isSharingLocation
    setIsSharingLocation(next)
    showToast(next ? 'success' : 'info', next ? 'Location sharing started' : 'Location sharing stopped')
  }

  return (
    <div className="pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">My Deliveries</h1>
          <p className="mt-1 text-sm text-warm-gray">Your active and completed orders</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={refreshAll}
            disabled={isRefetching}
            label="Refresh"
            iconOnly
            icon={<RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />}
          />
        </div>
      </div>

      {/* ================= Today stats ================= */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile icon={Bike} tone="bg-tomato/10 text-tomato" label="In progress" value={String(activeList.length)} />
        <StatTile icon={CheckCircle2} tone="bg-green-100 text-green-600" label="Delivered today" value={String(todayStats.count)} />
        <StatTile icon={IndianRupee} tone="bg-gold/10 text-gold" label="Earned today" value={inr(todayStats.earnings)} />
      </div>

      {/* ================= Live location banner ================= */}
      {hasActiveDelivery && (
        <div
          className={cn(
            'mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3',
            isSharingLocation ? 'border-green-200 bg-green-50' : 'border-gold/30 bg-gold/10'
          )}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              {isSharingLocation && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              )}
              <span
                className={cn(
                  'relative inline-flex h-2.5 w-2.5 rounded-full',
                  isSharingLocation ? 'bg-green-500' : 'bg-gold'
                )}
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-charcoal">
                {isSharingLocation ? 'Sharing your live location' : 'Location sharing is off'}
              </p>
              <p className="text-xs text-warm-gray">
                {isSharingLocation
                  ? 'The customer can see you on the map'
                  : 'Turn it on so the customer can track this order'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleLocationSharing}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
              isSharingLocation
                ? 'border border-charcoal/15 bg-white text-charcoal hover:bg-beige/60'
                : 'bg-tomato text-cream hover:opacity-90'
            )}
          >
            <Radio className="h-4 w-4" />
            {isSharingLocation ? 'Stop sharing' : 'Start sharing'}
          </button>
        </div>
      )}

      {/* ================= Tabs ================= */}
      <div className="mt-6 inline-flex gap-1 rounded-full bg-charcoal/5 p-1">
        <TabButton active={tab === 'active'} onClick={() => setTab('active')} label="Active" count={activeList.length} />
        <TabButton active={tab === 'completed'} onClick={() => setTab('completed')} label="Completed" count={completedList.length} />
      </div>

      {/* ================= List ================= */}
      <div className="mt-5 space-y-4">
        {isLoading ? (
          [1, 2].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-40 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : deliveries.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-charcoal/5">
              <Bike className="h-8 w-8 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">
              {tab === 'active' ? 'No active deliveries' : 'No completed deliveries yet'}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-warm-gray">
              {tab === 'active'
                ? 'Accept an order from Available Orders and it will show up here.'
                : 'Orders you finish will be listed here with your earnings.'}
            </p>
            {tab === 'active' && (
              <button
                onClick={() => navigate(AVAILABLE_ORDERS_PATH)}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-tomato px-6 text-sm font-semibold text-cream shadow-sm transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2"
              >
                <Search className="h-4 w-4" />
                Find orders
              </button>
            )}
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery._id}
              delivery={delivery}
              tab={tab}
              isSharingLocation={isSharingLocation}
              onPickUp={() => handlePickUp(delivery.orderId)}
              onDelivered={() => handleDelivered(delivery.orderId)}
              isPickingUp={pickUpMutation.isPending && pickUpMutation.variables === delivery.orderId}
              isDelivering={deliverMutation.isPending && deliverMutation.variables === delivery.orderId}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// Delivery Card
// ============================================

const STEPS = ['Pickup', 'On the way', 'Delivered']

function DeliveryCard({
  delivery,
  tab,
  isSharingLocation,
  onPickUp,
  onDelivered,
  isPickingUp,
  isDelivering,
}: {
  delivery: any
  tab: TabFilter
  isSharingLocation: boolean
  onPickUp: () => void
  onDelivered: () => void
  isPickingUp: boolean
  isDelivering: boolean
}) {
  const { showToast } = useToast()
  const [itemsOpen, setItemsOpen] = useState(false)

  const restaurant = delivery.restaurant || {}
  const customer = delivery.user || {}
  const items: any[] = delivery.items ?? []
  const isActive = tab === 'active'

  const statusConfig: Record<string, { label: string; variant: any; step: number }> = {
    ready: { label: 'Ready for pickup', variant: 'info', step: 0 },
    'out-for-delivery': { label: 'Out for delivery', variant: 'warning', step: 1 },
    delivered: { label: 'Delivered', variant: 'success', step: 2 },
  }
  const config = statusConfig[delivery.status] || { label: delivery.status, variant: 'neutral', step: 0 }

  // Cash on delivery (field names backend ke hisaab se adjust karo)
  const isCod = delivery.paymentMethod === 'cod'
  const codAmount = delivery.total ?? delivery.totalAmount ?? 0

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(delivery.orderId)
      showToast('success', 'Order ID copied')
    } catch {
      showToast('error', 'Could not copy')
    }
  }

  const openMaps = (address: string) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank',
      'noopener'
    )
  }

  const goingToCustomer = delivery.status === 'out-for-delivery'

  return (
    <Card className={cn('overflow-hidden p-0', goingToCustomer && isActive && 'ring-1 ring-tomato/40')}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <button
              onClick={copyId}
              className="group inline-flex items-center gap-1.5 font-mono text-xs font-bold text-charcoal hover:text-tomato"
              title="Copy order ID"
            >
              #{delivery.orderId}
              <Copy className="h-3 w-3 opacity-40 group-hover:opacity-100" />
            </button>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={config.variant}>{config.label}</Badge>
              {goingToCustomer && isSharingLocation && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  Live
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold text-green-600">{inr(delivery.deliveryEarnings)}</p>
            <p className="text-xs text-warm-gray">your earning</p>
          </div>
        </div>

        {/* Progress */}
        {isActive && (
          <div className="mt-5 flex items-center">
            {STEPS.map((label, i) => {
              const done = i <= config.step
              return (
                <div key={label} className={cn('flex items-center', i < STEPS.length - 1 && 'flex-1')}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold',
                        done ? 'bg-tomato text-cream' : 'bg-charcoal/10 text-charcoal/40'
                      )}
                    >
                      {i < config.step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={cn('mt-1 text-[11px]', done ? 'font-semibold text-charcoal' : 'text-warm-gray')}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn('mx-2 mb-4 h-0.5 flex-1 rounded-full', i < config.step ? 'bg-tomato' : 'bg-charcoal/10')}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Route */}
        <div className="relative mt-5 space-y-5">
          <div className="absolute left-5 top-10 bottom-10 w-px border-l-2 border-dashed border-charcoal/15" />

          <Stop
            icon={Store}
            iconClass="bg-tomato/10 text-tomato"
            title="Pickup"
            name={restaurant.name || 'Restaurant'}
            address={restaurant.address}
            dim={goingToCustomer || !isActive}
            actions={
              isActive && (
                <>
                  {restaurant.phone && <MiniLink href={`tel:${restaurant.phone}`} icon={Phone} label="Call" />}
                  {restaurant.address && (
                    <MiniLink onClick={() => openMaps(restaurant.address)} icon={Navigation} label="Navigate" />
                  )}
                </>
              )
            }
          />

          <Stop
            icon={MapPin}
            iconClass="bg-blue-50 text-blue-600"
            title="Drop"
            name={customer.name || 'Customer'}
            address={delivery.address}
            dim={!goingToCustomer && isActive}
            actions={
              isActive && (
                <>
                  {customer.phone && <MiniLink href={`tel:${customer.phone}`} icon={Phone} label="Call customer" />}
                  {delivery.address && <MiniLink onClick={() => openMaps(delivery.address)} icon={Navigation} label="Navigate" />}
                </>
              )
            }
          />
        </div>

        {/* COD */}
        {isActive && isCod && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
            <Banknote className="h-5 w-5 text-gold" />
            <p className="text-sm text-charcoal">
              Collect <b>{inr(codAmount)}</b> in cash from the customer
            </p>
          </div>
        )}

        {/* Items */}
        <button
          onClick={() => setItemsOpen((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-xl bg-charcoal/5 px-4 py-2.5 text-sm hover:bg-charcoal/10"
        >
          <span className="flex items-center gap-2 font-semibold text-charcoal">
            <Package className="h-4 w-4 text-warm-gray" />
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <span className="flex items-center gap-2 text-xs text-warm-gray">
            <Clock className="h-3.5 w-3.5" />
            {getTimeAgo(delivery.createdAt)}
            <ChevronDown className={cn('h-4 w-4 transition-transform', itemsOpen && 'rotate-180')} />
          </span>
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

      {/* Primary action */}
      {isActive && delivery.status === 'ready' && (
        <div className="border-t border-charcoal/10 bg-beige/30 p-4">
          <PrimaryButton onClick={onPickUp} loading={isPickingUp} icon={Package} label="Confirm pickup" tone="tomato" />
        </div>
      )}
      {isActive && goingToCustomer && (
        <div className="border-t border-charcoal/10 bg-beige/30 p-4">
          <PrimaryButton onClick={onDelivered} loading={isDelivering} icon={CheckCircle2} label="Mark as delivered" tone="green" />
        </div>
      )}
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
  dim,
  actions,
}: {
  icon: React.ElementType
  iconClass: string
  title: string
  name: string
  address?: string
  dim?: boolean
  actions?: React.ReactNode
}) {
  return (
    <div className={cn('relative flex items-start gap-3', dim && 'opacity-60')}>
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

function PrimaryButton({
  onClick,
  loading,
  icon: Icon,
  label,
  tone,
}: {
  onClick: () => void
  loading: boolean
  icon: React.ElementType
  label: string
  tone: 'tomato' | 'green'
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-sm transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        tone === 'tomato'
          ? 'bg-tomato hover:opacity-90 focus-visible:ring-tomato/50'
          : 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500/50'
      )}
    >
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {loading ? 'Updating…' : label}
    </button>
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

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
        active ? 'bg-tomato text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
      )}
    >
      {label}
      <span
        className={cn(
          'grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold',
          active ? 'bg-white/25 text-cream' : 'bg-charcoal/10 text-charcoal/60'
        )}
      >
        {count}
      </span>
    </button>
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
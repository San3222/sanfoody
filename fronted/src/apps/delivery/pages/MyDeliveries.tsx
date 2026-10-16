// src/apps/delivery/pages/MyDeliveries.tsx
import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import {
  useMyDeliveries,
  useMarkPickedUp,
  useMarkDelivered,
} from '@/api/deliveryHooks'
import { useToast } from '@/context/ToastContext'
import { updateDeliveryLocation } from '@/api/deliveryClient'
import { cn } from '@/lib/utils'

type TabFilter = 'active' | 'completed'

export function MyDeliveries() {
  const [tab, setTab] = useState<TabFilter>('active')
  const [isSharingLocation, setIsSharingLocation] = useState(false)

  const { data, isLoading, refetch, isRefetching } = useMyDeliveries(tab, 1, 20)
  const pickUpMutation = useMarkPickedUp()
  const deliverMutation = useMarkDelivered()
  const { showToast } = useToast()

  const deliveries = data?.orders ?? []

  // 🔥 Live location sharing for active delivery
  useEffect(() => {
    const activeDelivery = deliveries.find((d) => d.status === 'out-for-delivery')

    if (!activeDelivery || !isSharingLocation) return
    if (!navigator.geolocation) return

    let isCancelled = false

    const updateCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (isCancelled) return
          const { latitude, longitude } = position.coords
          try {
            await updateDeliveryLocation(
              activeDelivery.orderId,
              latitude,
              longitude
            )
            console.log(`📍 Location updated: ${latitude}, ${longitude}`)
          } catch (err) {
            console.error('Failed to update location:', err)
          }
        },
        (error) => {
          // 🔥 Silent fail — don't spam console
          console.warn('Geolocation update failed:', error.message)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000,  // 🔥 Increased from 10s to 15s
        }
      )
    }

    updateCurrentLocation()
    const interval = setInterval(updateCurrentLocation, 15000)  // 🔥 15s instead of 10s

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [deliveries, isSharingLocation])

  const hasActiveDelivery = deliveries.some((d) => d.status === 'out-for-delivery')

  const handlePickUp = (orderId: string) => {
    pickUpMutation.mutate(orderId, {
      onSuccess: () => showToast('success', '📦 Picked up! On the way to customer'),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleDelivered = (orderId: string) => {
    if (!confirm(`Mark order ${orderId} as delivered?`)) return
    deliverMutation.mutate(orderId, {
      onSuccess: () => {
        showToast('success', '✅ Order delivered! Earnings added')
        setIsSharingLocation(false)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const toggleLocationSharing = () => {
    const next = !isSharingLocation
    setIsLocationSharing(next)
    showToast(
      next ? 'success' : 'info',
      next ? '📍 Location sharing started' : '📍 Location sharing stopped'
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            My Deliveries
          </h1>
          <p className="mt-1 text-sm text-warm-gray">
            Track your active and completed deliveries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveDelivery && (
            <button
              onClick={toggleLocationSharing}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                isSharingLocation
                  ? 'bg-green-100 text-green-700'
                  : 'bg-charcoal/5 text-charcoal/70 hover:bg-charcoal/10'
              )}
            >
              <span className="relative flex h-2 w-2">
                {isSharingLocation && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                )}
                <span
                  className={cn(
                    'relative inline-flex h-2 w-2 rounded-full',
                    isSharingLocation ? 'bg-green-500' : 'bg-charcoal/40'
                  )}
                />
              </span>
              <Radio className="h-4 w-4" />
              {isSharingLocation ? 'Sharing' : 'Share Location'}
            </button>
          )}

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
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2 border-b border-charcoal/10">
        <button
          onClick={() => setTab('active')}
          className={cn(
            'relative px-4 py-2.5 text-sm font-semibold transition-colors',
            tab === 'active'
              ? 'text-tomato'
              : 'text-charcoal/60 hover:text-charcoal'
          )}
        >
          Active
          {tab === 'active' && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-tomato" />
          )}
        </button>
        <button
          onClick={() => setTab('completed')}
          className={cn(
            'relative px-4 py-2.5 text-sm font-semibold transition-colors',
            tab === 'completed'
              ? 'text-tomato'
              : 'text-charcoal/60 hover:text-charcoal'
          )}
        >
          Completed
          {tab === 'completed' && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-tomato" />
          )}
        </button>
      </div>

      {/* Deliveries List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-32 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : deliveries.length === 0 ? (
          <Card className="p-12 text-center">
            <Bike className="mx-auto h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm text-warm-gray">
              {tab === 'active'
                ? 'No active deliveries. Accept an order to get started!'
                : 'No completed deliveries yet'}
            </p>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery._id}
              delivery={delivery}
              onPickUp={() => handlePickUp(delivery.orderId)}
              onDelivered={() => handleDelivered(delivery.orderId)}
              isPickingUp={pickUpMutation.isPending}
              isDelivering={deliverMutation.isPending}
              isSharingLocation={isSharingLocation}
              tab={tab}
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

function DeliveryCard({
  delivery,
  onPickUp,
  onDelivered,
  isPickingUp,
  isDelivering,
  isSharingLocation,
  tab,
}: {
  delivery: any
  onPickUp: () => void
  onDelivered: () => void
  isPickingUp: boolean
  isDelivering: boolean
  isSharingLocation: boolean
  tab: TabFilter
}) {
  const restaurant = delivery.restaurant || {}
  const customer = delivery.user || {}

  const statusConfig: Record<string, { label: string; variant: any }> = {
    ready: { label: 'Ready for pickup', variant: 'info' },
    'out-for-delivery': { label: 'Out for delivery', variant: 'warning' },
    delivered: { label: 'Delivered', variant: 'success' },
  }
  const config = statusConfig[delivery.status] || {
    label: delivery.status,
    variant: 'neutral',
  }

  return (
    <Card
      className={cn(
        'p-5',
        delivery.status === 'out-for-delivery' && 'border-l-4 border-l-tomato'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-charcoal">
            {delivery.orderId}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            {delivery.status === 'out-for-delivery' && isSharingLocation && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                Live
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-green-600">
            ₹{delivery.deliveryEarnings}
          </p>
          <p className="text-xs text-warm-gray">
            {new Date(delivery.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Pickup */}
      <div className="mt-4 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-beige">
          <Store className="h-5 w-5 text-tomato" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-warm-gray">
            Pickup
          </p>
          <p className="truncate text-sm font-semibold text-charcoal">
            {restaurant.name || 'Restaurant'}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-warm-gray">
            <MapPin className="h-3 w-3 shrink-0 text-tomato" />
            <span className="truncate">{restaurant.address || '—'}</span>
          </p>
        </div>
      </div>

      {/* Delivery */}
      <div className="mt-3 flex items-start gap-3 border-t border-charcoal/5 pt-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50">
          <Navigation className="h-5 w-5 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-warm-gray">
            Deliver
          </p>
          <p className="truncate text-sm font-semibold text-charcoal">
            {customer.name || 'Customer'}
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-warm-gray">
            <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
            <span className="truncate">{delivery.address}</span>
          </p>
        </div>
      </div>

      {/* Customer phone */}
      {customer.phone && tab === 'active' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-beige/40 px-3 py-2">
          <Phone className="h-4 w-4 text-warm-gray" />
          <a
            href={`tel:${customer.phone}`}
            className="text-sm font-semibold text-tomato hover:underline"
          >
            {customer.phone}
          </a>
        </div>
      )}

      {/* Items count */}
      <div className="mt-3 flex items-center gap-3 text-xs text-warm-gray">
        <span className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          {delivery.items?.length || 0} item
          {(delivery.items?.length || 0) !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {getTimeAgo(delivery.createdAt)}
        </span>
      </div>

      {/* Actions */}
      {tab === 'active' && (
        <div className="mt-4 flex gap-2">
          {delivery.status === 'ready' && (
            <Button
              onClick={onPickUp}
              disabled={isPickingUp}
              className="flex-1"
              size="lg"
            >
              {isPickingUp ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Confirm Pickup
                </>
              )}
            </Button>
          )}

          {delivery.status === 'out-for-delivery' && (
            <Button
              onClick={onDelivered}
              disabled={isDelivering}
              variant="success"
              className="flex-1"
              size="lg"
            >
              {isDelivering ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Delivered
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </Card>
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

function setIsLocationSharing(next: boolean) {
  throw new Error('Function not implemented.')
}

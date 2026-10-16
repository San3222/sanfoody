// src/apps/delivery/pages/AvailableOrders.tsx
import { useState } from 'react'
import {
  MapPin,
  Bike,
  Clock,
  RefreshCw,
  Package,
  Store,
  Navigation,
  IndianRupee,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import {
  useAvailableOrders,
  useAcceptDeliveryOrder,
  useDeliveryStats,
} from '@/api/deliveryHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function AvailableOrders() {
  const { data: orders, isLoading, refetch, isRefetching } = useAvailableOrders()
  const { data: stats } = useDeliveryStats()
  const acceptMutation = useAcceptDeliveryOrder()
  const { showToast } = useToast()

  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const isOnline = stats?.partner?.status === 'online'

  const handleAccept = (orderId: string, restaurantName: string) => {
    setAcceptingId(orderId)
    acceptMutation.mutate(orderId, {
      onSuccess: () => {
        showToast('success', `✅ Order accepted from ${restaurantName}`)
        setAcceptingId(null)
      },
      onError: (err: any) => {
        showToast('error', err.message || 'Failed to accept')
        setAcceptingId(null)
      },
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Available Orders
          </h1>
          <p className="mt-1 text-sm text-warm-gray">
            {orders?.length ?? 0} order{(orders?.length ?? 0) !== 1 ? 's' : ''} waiting
            for pickup
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'success' : 'warning'}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Badge>
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

      {/* Offline Warning */}
      {!isOnline && !isLoading && (
        <Card className="mt-6 border-l-4 border-l-yellow-500 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ You are <strong>offline</strong>. Go online from the sidebar to accept
            orders.
          </p>
        </Card>
      )}

      {/* Orders List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-32 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : !orders || orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Bike className="mx-auto h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm font-semibold text-warm-gray">
              No orders available right now
            </p>
            <p className="mt-1 text-xs text-warm-gray">
              {isOnline
                ? 'New orders will appear here automatically when restaurants mark them ready'
                : 'Go online to start receiving orders'}
            </p>
          </Card>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onAccept={() =>
                handleAccept(
                  order.orderId,
                  (order.restaurant as any)?.name || 'Restaurant'
                )
              }
              isAccepting={acceptingId === order.orderId}
              isOnline={isOnline}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================
// Order Card
// ============================================

function OrderCard({
  order,
  onAccept,
  isAccepting,
  isOnline,
}: {
  order: any
  onAccept: () => void
  isAccepting: boolean
  isOnline: boolean
}) {
  const restaurant = order.restaurant || {}
  const timeAgo = getTimeAgo(order.createdAt)

  return (
    <Card className="overflow-hidden p-0">
      {/* Header - earnings highlight */}
      <div className="flex items-center justify-between bg-linear-to-r from-green-50 to-emerald-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-charcoal">
            {order.orderId}
          </span>
          <Badge variant="success">Ready for pickup</Badge>
        </div>
        <div className="flex items-center gap-1">
          <IndianRupee className="h-4 w-4 text-green-600" />
          <span className="font-display text-lg font-extrabold text-green-700">
            {order.estimatedEarnings}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Restaurant */}
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-beige">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="h-6 w-6 text-warm-gray" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
              Pickup from
            </p>
            <p className="font-bold text-charcoal">{restaurant.name || 'Restaurant'}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-gray">
              <MapPin className="h-3 w-3 shrink-0 text-tomato" />
              <span className="truncate">{restaurant.address || 'Pickup address'}</span>
            </p>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mt-4 flex items-start gap-3 border-t border-charcoal/5 pt-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50">
            <Navigation className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
              Deliver to
            </p>
            <p className="font-semibold text-charcoal">{order.user?.name || 'Customer'}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-warm-gray">
              <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
              <span className="truncate">{order.address}</span>
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-charcoal/5 pt-4 text-xs text-warm-gray">
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" />
            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </span>
          <span className="flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" />
            {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}
          </span>
        </div>

        {/* Action */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onAccept}
            disabled={isAccepting || !isOnline}
            className="flex-1"
            size="lg"
          >
            {isAccepting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : !isOnline ? (
              'Go online to accept'
            ) : (
              <>
                <Bike className="mr-2 h-4 w-4" />
                Accept Order · Earn ₹{order.estimatedEarnings}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// Helpers
// ============================================

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
}
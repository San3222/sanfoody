// src/apps/restaurant/pages/Orders.tsx
import { useState, useMemo } from 'react'
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    ChefHat,
    Bell,
    Phone,
    MapPin,
    CreditCard,
    Banknote,
    RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import {
    useRestaurantOrders,
    useAcceptOrder,
    useRejectOrder,
    useMarkOrderPreparing,
    useMarkOrderReady,
    useMarkOrderDelivered,
} from '@/api/restaurantHooks'
import type { RestaurantOrder } from '@/api/restaurantClient'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Filter Tabs
// ============================================

const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'out-for-delivery', label: 'Out for Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
] as const

// ============================================
// Status Config
// ============================================

const STATUS_CONFIG: Record<
    RestaurantOrder['status'],
    { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'neutral' }
> = {
    pending: { label: 'Pending', variant: 'warning' },
    confirmed: { label: 'Confirmed', variant: 'info' },
    preparing: { label: 'Preparing', variant: 'info' },
    ready: { label: 'Ready', variant: 'success' },
    'out-for-delivery': { label: 'Out for Delivery', variant: 'info' },
    delivered: { label: 'Delivered', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
}

// ============================================
// Main Component
// ============================================

export function RestaurantOrders() {
    const [filter, setFilter] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null)
    const [rejectModal, setRejectModal] = useState<RestaurantOrder | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const { data, isLoading, refetch, isRefetching } = useRestaurantOrders(filter, 1, 50)
    const acceptMutation = useAcceptOrder()
    const rejectMutation = useRejectOrder()
    const preparingMutation = useMarkOrderPreparing()
    const readyMutation = useMarkOrderReady()
    const deliveredMutation = useMarkOrderDelivered()
    const { showToast } = useToast()

    const orders = data?.orders ?? []

    // Sort: newest first, but pending/active at top
    const sortedOrders = useMemo(() => {
        const priority: Record<RestaurantOrder['status'], number> = {
            pending: 1,
            confirmed: 2,
            preparing: 3,
            ready: 4,
            'out-for-delivery': 5,
            delivered: 6,
            cancelled: 7,
        }
        return [...orders].sort((a, b) => {
            const pa = priority[a.status] - priority[b.status]
            if (pa !== 0) return pa
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [orders])

    // ============================================
    // Handlers
    // ============================================

    const handleAccept = (order: RestaurantOrder) => {
        acceptMutation.mutate(
            { orderId: order.orderId, estimatedPrepTime: 20 },
            {
                onSuccess: () => showToast('success', `Order ${order.orderId} accepted`),
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const handleReject = () => {
        if (!rejectModal) return
        rejectMutation.mutate(
            { orderId: rejectModal.orderId, reason: rejectReason || 'Rejected by restaurant' },
            {
                onSuccess: () => {
                    showToast('success', `Order ${rejectModal.orderId} rejected`)
                    setRejectModal(null)
                    setRejectReason('')
                },
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const handlePreparing = (order: RestaurantOrder) => {
        preparingMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order marked preparing'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    const handleReady = (order: RestaurantOrder) => {
        readyMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order marked ready for pickup'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    const handleDelivered = (order: RestaurantOrder) => {
        if (!confirm(`Mark order ${order.orderId} as delivered? (TEST MODE)`)) return
        deliveredMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order marked delivered'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Orders</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        {data?.total ?? 0} total order{(data?.total ?? 0) !== 1 ? 's' : ''}
                    </p>
                </div>

                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                    <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            filter === tab.id
                                ? 'bg-tomato text-cream'
                                : 'bg-white text-charcoal/70 hover:bg-beige'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="mt-6 space-y-4">
                {isLoading ? (
                    // Skeletons
                    [1, 2, 3].map((i) => (
                        <Card key={i} className="p-5">
                            <div className="h-24 animate-pulse rounded-xl bg-charcoal/5" />
                        </Card>
                    ))
                ) : sortedOrders.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="mx-auto h-12 w-12 text-charcoal/20" />
                        <p className="mt-3 text-sm text-warm-gray">
                            {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
                        </p>
                        <p className="text-xs text-warm-gray">
                            New orders will appear here automatically
                        </p>
                    </Card>
                ) : (
                    sortedOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onAccept={() => handleAccept(order)}
                            onReject={() => setRejectModal(order)}
                            onPreparing={() => handlePreparing(order)}
                            onReady={() => handleReady(order)}
                            onDelivered={() => handleDelivered(order)}
                            onViewDetails={() => setSelectedOrder(order)}
                            isAccepting={acceptMutation.isPending}
                            isRejecting={rejectMutation.isPending}
                            isPreparing={preparingMutation.isPending}
                            isReady={readyMutation.isPending}
                            isDelivering={deliveredMutation.isPending}
                        />
                    ))
                )}
            </div>

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />

            {/* Reject Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => {
                    setRejectModal(null)
                    setRejectReason('')
                }}
                title="Reject Order"
            >
                <p className="text-sm text-warm-gray">
                    Reject <strong>{rejectModal?.orderId}</strong>? The customer will be notified
                    and refund initiated.
                </p>
                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Reason (optional)
                    </label>
                    <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Out of stock, Closing early"
                    />
                </div>
                <div className="mt-5 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setRejectModal(null)
                            setRejectReason('')
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={rejectMutation.isPending}
                        className="flex-1"
                    >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

// ============================================
// OrderCard Component
// ============================================

function OrderCard({
    order,
    onAccept,
    onReject,
    onPreparing,
    onReady,
    onDelivered,
    onViewDetails,
    isAccepting,
    isRejecting,
    isPreparing,
    isReady,
    isDelivering,
}: {
    order: RestaurantOrder
    onAccept: () => void
    onReject: () => void
    onPreparing: () => void
    onReady: () => void
    onDelivered: () => void
    onViewDetails: () => void
    isAccepting: boolean
    isRejecting: boolean
    isPreparing: boolean
    isReady: boolean
    isDelivering: boolean
}) {
    const config = STATUS_CONFIG[order.status]
    const isPending = order.status === 'pending'

    return (
        <Card
            className={cn(
                'p-5 transition-all',
                isPending && 'border-l-4 border-l-tomato shadow-warm'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    {isPending && (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato/10">
                            <Bell className="h-5 w-5 animate-pulse text-tomato" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-bold text-charcoal">{order.orderId}</p>
                            <Badge variant={config.variant}>{config.label}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-warm-gray">
                            {order.user?.name} · {new Date(order.createdAt).toLocaleString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-display text-xl font-bold text-charcoal">₹{order.total}</p>
                    <p className="flex items-center justify-end gap-1 text-xs text-warm-gray">
                        {order.paymentMethod === 'cod' ? (
                            <>
                                <Banknote className="h-3 w-3" />
                                Cash
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-3 w-3" />
                                {order.isPaid ? 'Paid' : 'Pending'}
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Items preview */}
            <div className="mt-3 rounded-xl bg-beige/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-sm text-charcoal">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </p>
            </div>

            {/* Customer info */}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-warm-gray">
                <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {order.user?.phone || 'No phone'}
                </span>
                <span className="flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{order.address}</span>
                </span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <button
                    onClick={onViewDetails}
                    className="text-xs font-semibold text-tomato hover:underline"
                >
                    View details →
                </button>

                <div className="flex flex-wrap gap-2">
                    {order.status === 'pending' && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onReject}
                                disabled={isRejecting}
                            >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button size="sm" onClick={onAccept} disabled={isAccepting}>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                {isAccepting ? 'Accepting...' : 'Accept Order'}
                            </Button>
                        </>
                    )}

                    {order.status === 'confirmed' && (
                        <Button size="sm" onClick={onPreparing} disabled={isPreparing}>
                            <ChefHat className="mr-1 h-3.5 w-3.5" />
                            {isPreparing ? 'Starting...' : 'Start Preparing'}
                        </Button>
                    )}

                    {order.status === 'preparing' && (
                        <Button size="sm" variant="success" onClick={onReady} disabled={isReady}>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            {isReady ? 'Marking...' : 'Mark Ready'}
                        </Button>
                    )}

                    {order.status === 'ready' && (
                        <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                                <Clock className="h-3 w-3" />
                                Ready for pickup
                            </span>
                            <Button
                                size="sm"
                                variant="success"
                                onClick={onDelivered}
                                disabled={isDelivering}
                            >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                {isDelivering ? 'Marking...' : 'Mark Delivered'}
                            </Button>
                        </div>
                    )}

                    {order.status === 'out-for-delivery' && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                            🚴 Out for delivery
                        </span>
                    )}

                    {order.status === 'delivered' && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                        </span>
                    )}

                    {order.status === 'cancelled' && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <XCircle className="h-3 w-3" />
                            {order.rejectionReason || 'Cancelled'}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    )
}

// ============================================
// Order Detail Modal
// ============================================

function OrderDetailModal({
    order,
    onClose,
}: {
    order: RestaurantOrder | null
    onClose: () => void
}) {
    if (!order) return null

    const config = STATUS_CONFIG[order.status]

    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Order ${order.orderId}`}>
            {/* Status */}
            <div className="mb-4 flex items-center justify-between">
                <Badge variant={config.variant}>{config.label}</Badge>
                <p className="text-xs text-warm-gray">
                    {new Date(order.createdAt).toLocaleString('en-IN')}
                </p>
            </div>

            {/* Customer */}
            <div className="rounded-2xl bg-beige/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                    Customer
                </p>
                <p className="mt-1 font-semibold text-charcoal">{order.user?.name}</p>
                {order.user?.phone && (
                    <p className="text-sm text-warm-gray">📞 {order.user.phone}</p>
                )}
                <p className="mt-2 text-sm text-warm-gray">📍 {order.address}</p>
            </div>

            {/* Items */}
            <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
                    Items
                </p>
                <div className="mt-2 space-y-2">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-charcoal">
                                {item.quantity}× {item.name}
                            </span>
                            <span className="font-semibold text-charcoal">
                                ₹{item.price * item.quantity}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bill */}
            <div className="mt-4 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
                <div className="flex justify-between text-warm-gray">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-warm-gray">
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-warm-gray">
                    <span>GST</span>
                    <span>₹{order.gst}</span>
                </div>
                <div className="flex justify-between border-t border-charcoal/10 pt-2 font-bold text-charcoal">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                </div>
            </div>

            {/* Payment */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-charcoal/5 p-3 text-sm">
                <span className="text-warm-gray">Payment</span>
                <span className="font-semibold text-charcoal">
                    {order.paymentMethod.toUpperCase()} · {order.isPaid ? '✅ Paid' : '⏳ Pending'}
                </span>
            </div>
        </Modal>
    )
}
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
    TrendingUp,
    Layers,
    ArrowRight
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
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
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
    { label: string; variant: 'warning' | 'info' | 'success' | 'danger' | 'neutral'; icon: any }
> = {
    pending: { label: 'Pending', variant: 'warning', icon: Clock },
    confirmed: { label: 'Confirmed', variant: 'info', icon: CheckCircle2 },
    preparing: { label: 'Preparing', variant: 'info', icon: ChefHat },
    ready: { label: 'Ready', variant: 'success', icon: Package },
    'out-for-delivery': { label: 'Out for Delivery', variant: 'info', icon: TrendingUp },
    delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
}

// ============================================
// Main Component
// ============================================

export function RestaurantOrders() {
    const [filter, setFilter] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null)
    const [rejectModal, setRejectModal] = useState<RestaurantOrder | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const { data, isLoading, refetch, isRefetching } = useRestaurantOrders('all', 1, 50)

    const acceptMutation = useAcceptOrder()
    const rejectMutation = useRejectOrder()
    const preparingMutation = useMarkOrderPreparing()
    const readyMutation = useMarkOrderReady()
    const deliveredMutation = useMarkOrderDelivered()

    const { showToast } = useToast()

    const orders = data?.orders ?? []

    // 🔥 Stats Calculation for Top Cards
    const stats = useMemo(() => {
        return {
            pending: orders.filter(o => o.status === 'pending').length,
            active: orders.filter(o => ['confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(o.status)).length,
            completed: orders.filter(o => o.status === 'delivered').length,
        }
    }, [orders])

    // Filter & Sort
    const filteredAndSortedOrders = useMemo(() => {
        let result = orders
        if (filter !== 'all') {
            result = orders.filter(o => o.status === filter || (filter === 'preparing' && o.status === 'confirmed'))
        }

        const priority: Record<RestaurantOrder['status'], number> = {
            pending: 1,
            confirmed: 2,
            preparing: 3,
            ready: 4,
            'out-for-delivery': 5,
            delivered: 6,
            cancelled: 7,
        }

        return [...result].sort((a, b) => {
            const pa = priority[a.status] - priority[b.status]
            if (pa !== 0) return pa
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [orders, filter])

    // ============================================
    // Handlers
    // ============================================

    const handleAccept = (order: RestaurantOrder) => {
        acceptMutation.mutate(
            { orderId: order.orderId, estimatedPrepTime: 20 },
            {
                onSuccess: () => showToast('success', `Order #${order.orderId} accepted`),
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
                    showToast('success', `Order #${rejectModal.orderId} rejected`)
                    setRejectModal(null)
                    setRejectReason('')
                },
                onError: (err: any) => showToast('error', err.message || 'Failed'),
            }
        )
    }

    const handlePreparing = (order: RestaurantOrder) => {
        preparingMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order moved to preparing'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    const handleReady = (order: RestaurantOrder) => {
        readyMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order is ready for pickup!'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    const handleDelivered = (order: RestaurantOrder) => {
        if (!confirm(`Mark order #${order.orderId} as delivered?`)) return
        deliveredMutation.mutate(order.orderId, {
            onSuccess: () => showToast('success', 'Order completed'),
            onError: (err: any) => showToast('error', err.message || 'Failed'),
        })
    }

    return (
        <div className="pb-12">
            {/* 🔥 Header & Refresh Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Orders</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Manage incoming orders and track their status
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

            {/* 🔥 Stats Cards (Only show if orders exist) */}
            {!isLoading && orders.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                    <Card className="flex items-center gap-3 p-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-yellow-100">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-bold text-charcoal">{stats.pending}</p>
                            <p className="text-xs text-warm-gray">New / Pending</p>
                        </div>
                    </Card>

                    <Card className="flex items-center gap-3 p-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100">
                            <Layers className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-bold text-charcoal">{stats.active}</p>
                            <p className="text-xs text-warm-gray">In Progress</p>
                        </div>
                    </Card>

                    <Card className="flex items-center gap-3 p-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-bold text-charcoal">{stats.completed}</p>
                            <p className="text-xs text-warm-gray">Completed</p>
                        </div>
                    </Card>
                </div>
            )}

            {/* 🔥 Filter Tabs */}
            <div className="mt-6 scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={cn(
                            'flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                            filter === tab.id
                                ? 'border-tomato bg-tomato text-cream shadow-sm'
                                : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/30 hover:text-tomato'
                        )}
                    >
                        {tab.label}
                        {tab.id === 'pending' && stats.pending > 0 && (
                            <span className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                                filter === 'pending' ? "bg-white/20" : "bg-tomato/10 text-tomato"
                            )}>
                                {stats.pending}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ============================================
                Orders List
                ============================================ */}
            <div className="mt-6 space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <Card key={i} className="p-5">
                            <div className="flex gap-4">
                                <div className="h-16 w-16 animate-pulse rounded-xl bg-charcoal/5" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-4 w-1/3 animate-pulse rounded bg-charcoal/5" />
                                    <div className="h-3 w-1/2 animate-pulse rounded bg-charcoal/5" />
                                </div>
                            </div>
                        </Card>
                    ))
                ) : filteredAndSortedOrders.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center border-dashed border-2 border-charcoal/10 p-16 text-center shadow-none">
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-beige mb-4">
                            <Package className="h-10 w-10 text-charcoal/20" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-charcoal">
                            {filter === 'all' ? 'No orders yet' : `No ${filter} orders found`}
                        </h3>
                        <p className="mt-1 text-sm text-warm-gray max-w-sm">
                            {filter === 'all'
                                ? 'When customers place an order, it will appear here automatically with a notification sound.'
                                : 'Try changing the filter to see other orders.'}
                        </p>
                    </Card>
                ) : (
                    filteredAndSortedOrders.map((order) => (
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

            {/* Modals... (Unchanged) */}
            <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />

            <Modal
                isOpen={!!rejectModal}
                onClose={() => { setRejectModal(null); setRejectReason('') }}
                title="Reject Order"
            >
                <p className="text-sm text-warm-gray">
                    Are you sure you want to reject order <strong>#{rejectModal?.orderId}</strong>? The customer will be notified and refund initiated immediately.
                </p>
                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Reason for rejection (optional)
                    </label>
                    <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Out of stock, Kitchen is full"
                    />
                </div>
                <div className="mt-6 flex gap-3">
                    <Button variant="outline" onClick={() => { setRejectModal(null); setRejectReason('') }} className="flex-1 bg-white">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject} disabled={rejectMutation.isPending} className="flex-1">
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

// ============================================
// 🔥 Redesigned OrderCard Component
// ============================================

function OrderCard({
    order, onAccept, onReject, onPreparing, onReady, onDelivered, onViewDetails,
    isAccepting, isRejecting, isPreparing, isReady, isDelivering,
}: {
    order: RestaurantOrder
    onAccept: () => void; onReject: () => void; onPreparing: () => void;
    onReady: () => void; onDelivered: () => void; onViewDetails: () => void;
    isAccepting: boolean; isRejecting: boolean; isPreparing: boolean; isReady: boolean; isDelivering: boolean;
}) {
    const config = STATUS_CONFIG[order.status]
    const StatusIcon = config.icon
    const isPending = order.status === 'pending'

    // Item images preview (max 3)
    const previewImages = order.items.slice(0, 3).map(i => i.image).filter(Boolean)

    return (
        <Card
            className={cn(
                'overflow-hidden p-0 transition-all duration-300',
                isPending ? 'border-l-4 border-l-tomato shadow-warm ring-1 ring-tomato/20' : 'hover:shadow-warm'
            )}
        >
            {/* Top Bar */}
            <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3",
                isPending ? "bg-tomato/5 border-tomato/10" : "bg-charcoal/[0.02] border-charcoal/5"
            )}>
                <div className="flex items-center gap-3">
                    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                        isPending ? "bg-tomato text-cream animate-pulse" : "bg-charcoal/10 text-charcoal/70"
                    )}>
                        {isPending && <Bell className="h-3 w-3" />}
                        {config.label}
                    </span>
                    <span className="font-mono text-sm font-bold text-charcoal">#{order.orderId}</span>
                </div>
                <div className="text-xs font-medium text-warm-gray">
                    {new Date(order.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                    {/* Left: Customer & Items */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-charcoal/5 font-bold text-charcoal">
                                {order.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="font-semibold text-charcoal">{order.user?.name}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-warm-gray mt-0.5">
                                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {order.user?.phone || 'No phone'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items List with Images */}
                        <div className="rounded-xl border border-charcoal/5 bg-beige/20 p-3">
                            <ul className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="grid h-5 w-5 place-items-center rounded bg-charcoal/10 text-[10px] font-bold text-charcoal">
                                                {item.quantity}x
                                            </span>
                                            <span className="font-medium text-charcoal">{item.name}</span>
                                        </div>
                                        <span className="font-semibold text-warm-gray">₹{item.price * item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Bill & Address */}
                    <div className="sm:w-64 shrink-0 space-y-3 border-t border-charcoal/10 pt-4 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0">
                        <div>
                            <p className="text-xs text-warm-gray">Total Amount</p>
                            <p className="font-display text-2xl font-bold text-charcoal">₹{order.total}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-fresh-green bg-fresh-green/10 w-fit px-2 py-1 rounded-md">
                            {order.paymentMethod === 'cod' ? <Banknote className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : (order.isPaid ? 'Paid Online' : 'Payment Pending')}
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-warm-gray">
                            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.address}</span>
                        </div>
                    </div>
                </div>

                {/* 🔥 Action Buttons Row */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-4">
                    <button onClick={onViewDetails} className="group flex items-center gap-1 text-xs font-semibold text-warm-gray hover:text-charcoal transition-colors">
                        View full details
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    <div className="flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                            <>
                                <Button variant="outline" size="sm" onClick={onReject} disabled={isRejecting} className="bg-white">
                                    Reject
                                </Button>
                                <Button size="sm" onClick={onAccept} disabled={isAccepting} className="shadow-warm">
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    {isAccepting ? 'Accepting...' : 'Accept Order'}
                                </Button>
                            </>
                        )}

                        {order.status === 'confirmed' && (
                            <Button size="sm" onClick={onPreparing} disabled={isPreparing} className="shadow-warm">
                                <ChefHat className="mr-1.5 h-4 w-4" />
                                {isPreparing ? 'Starting...' : 'Start Preparing'}
                            </Button>
                        )}

                        {order.status === 'preparing' && (
                            <Button size="sm" variant="success" onClick={onReady} disabled={isReady} className="shadow-warm">
                                <Package className="mr-1.5 h-4 w-4" />
                                {isReady ? 'Marking...' : 'Mark as Ready'}
                            </Button>
                        )}

                        {order.status === 'ready' && (
                            <>
                                <span className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                                    <Clock className="h-4 w-4 animate-pulse" />
                                    Waiting for Pickup
                                </span>
                                <Button size="sm" variant="outline" onClick={onDelivered} disabled={isDelivering} className="border-green-200 text-green-700 hover:bg-green-50">
                                    Mark Delivered (Test)
                                </Button>
                            </>
                        )}

                        {['out-for-delivery', 'delivered', 'cancelled'].includes(order.status) && (
                            <div className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold",
                                order.status === 'delivered' ? "bg-charcoal/5 text-charcoal" :
                                    order.status === 'cancelled' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                            )}>
                                <StatusIcon className="h-4 w-4" />
                                {order.status === 'out-for-delivery' ? 'Out for Delivery' :
                                    order.status === 'delivered' ? 'Order Completed' : 'Order Cancelled'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

// ============================================
// Order Detail Modal (Unchanged, cleaned up)
// ============================================

function OrderDetailModal({ order, onClose }: { order: RestaurantOrder | null; onClose: () => void }) {
    if (!order) return null
    const config = STATUS_CONFIG[order.status]

    return (
        <Modal isOpen={!!order} onClose={onClose} title={`Order #${order.orderId}`}>
            <div className="flex items-center justify-between mb-4">
                <Badge variant={config.variant}>{config.label}</Badge>
                <p className="text-xs text-warm-gray">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-xl border border-charcoal/10 bg-beige/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">Customer Details</p>
                <p className="mt-1 font-semibold text-charcoal">{order.user?.name}</p>
                {order.user?.phone && <p className="text-sm text-warm-gray">📞 {order.user.phone}</p>}
                <p className="mt-2 text-sm text-warm-gray">📍 {order.address}</p>
            </div>
            <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray mb-2">Items Breakdown</p>
                <div className="space-y-2">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                            <span>{item.quantity}× {item.name}</span>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-5 space-y-2 border-t border-charcoal/10 pt-4 text-sm">
                <div className="flex justify-between text-warm-gray"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between text-warm-gray"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>
                <div className="flex justify-between text-warm-gray"><span>GST</span><span>₹{order.gst}</span></div>
                <div className="flex justify-between border-t border-charcoal/10 pt-2 font-bold text-lg text-charcoal"><span>Total</span><span>₹{order.total}</span></div>
            </div>
        </Modal>
    )
}
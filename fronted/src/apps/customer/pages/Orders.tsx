import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck, X, ChevronLeft, ChevronRight as ChevronRightIcon, Filter } from 'lucide-react'
import { useUserOrders, useCancelOrder } from '@/api/Hooks'
import { Badge } from '@/components/shared/Badge'
import { cn } from '@/lib/utils'

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  'pending': 'warning',
  'confirmed': 'info',
  'preparing': 'info',
  'out-for-delivery': 'info',
  'delivered': 'success',
  'cancelled': 'danger',
}

const statusIcons: Record<string, React.ElementType> = {
  'pending': Clock,
  'confirmed': Clock,
  'preparing': Clock,
  'out-for-delivery': Truck,
  'delivered': CheckCircle,
  'cancelled': XCircle,
}

const statusSteps = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered']

// 🔥 Filter options
const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

type FilterType = (typeof FILTER_OPTIONS)[number]['id']

export function Orders() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const limit = 10
  const { data: ordersData, isLoading, isError } = useUserOrders(page, limit)
  const cancelOrder = useCancelOrder()

  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')  // 🔥 Filter state

  const allOrders = ordersData?.orders || []
  const totalPages = ordersData?.totalPages || 1

  // 🔥 Filter orders based on active filter
  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return allOrders

    if (activeFilter === 'pending') {
      return allOrders.filter((o: any) =>
        ['pending', 'confirmed', 'preparing', 'out-for-delivery'].includes(o.status)
      )
    }

    return allOrders.filter((o: any) => o.status === activeFilter)
  }, [allOrders, activeFilter])

  const handleCancelClick = (id: string) => {
    setCancelOrderId(id)
    setIsModalOpen(true)
  }

  const handleConfirmCancel = () => {
    if (cancelOrderId) {
      cancelOrder.mutate(cancelOrderId)
    }
    setIsModalOpen(false)
    setCancelOrderId(null)
  }

  const getStatusLabel = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getProgress = (status: string) => {
    const index = statusSteps.indexOf(status)
    return index === -1 ? 0 : (index / (statusSteps.length - 1)) * 100
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft">
              <div className="h-20 rounded bg-charcoal/8"></div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-12 text-center shadow-soft">
          <p className="text-warm-gray">Couldn't load your orders. Please try again.</p>
        </div>
      </section>
    )
  }

  if (!allOrders || allOrders.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/5 bg-white p-12 text-center shadow-soft">
          <Package className="mx-auto h-16 w-16 text-charcoal/20" strokeWidth={1.5} />
          <h3 className="mt-4 font-display text-xl font-bold text-charcoal">No orders yet</h3>
          <p className="mt-1 text-warm-gray">Start exploring and place your first order!</p>
          <button
            onClick={() => navigate('/explore')}
            className="mt-6 rounded-full bg-linear-to-r from-tomato to-orange px-8 py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Restaurants
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="rounded-xl bg-tomato/10 p-3">
            <Package className="h-7 w-7 text-tomato" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">Order History</h1>
            <p className="text-sm text-warm-gray">{ordersData?.total || 0} orders</p>
          </div>
        </div>

        {/* 🔥 Filter Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-warm-gray" />
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              aria-pressed={activeFilter === filter.id}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
                activeFilter === filter.id
                  ? 'border-tomato bg-tomato text-cream'
                  : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-charcoal/5 bg-white p-12 text-center shadow-soft">
            <Package className="mx-auto h-16 w-16 text-charcoal/20" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-xl font-bold text-charcoal">
              No {activeFilter !== 'all' ? activeFilter : ''} orders found
            </h3>
            <p className="mt-1 text-warm-gray">Try a different filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any, index: number) => {
              const StatusIcon = statusIcons[order.status] || Clock
              const progress = getProgress(order.status)
              const isComplete = order.status === 'delivered' || order.status === 'cancelled'

              return (
                <motion.div
                  key={order._id || order.orderId || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm"
                >
                  <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-1 gap-4">
                        {order.restaurant?.image ? (
                          <img
                            src={order.restaurant.image}
                            alt={order.restaurant?.name || 'Restaurant'}
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-beige" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-bold text-charcoal">
                            {order.restaurant?.name || 'Restaurant'}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                              statusColors[order.status] === 'success' && 'bg-green-100 text-green-800 border-green-200',
                              statusColors[order.status] === 'warning' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                              statusColors[order.status] === 'info' && 'bg-blue-100 text-blue-800 border-blue-200',
                              statusColors[order.status] === 'danger' && 'bg-red-100 text-red-800 border-red-200',
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              {getStatusLabel(order.status)}
                            </span>
                            <span className="text-warm-gray">Order #{order.orderId}</span>
                          </div>
                          <p className="mt-1 text-sm text-warm-gray">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="font-display text-xl font-bold text-tomato">₹{order.total.toFixed(2)}</p>
                        <p className="text-sm text-warm-gray">{order.items.length} items</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!isComplete && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-warm-gray">
                          <span>Order placed</span>
                          <span>Delivered</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-charcoal/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-tomato to-orange transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {order.estimatedDelivery && (
                          <p className="mt-2 text-xs font-medium text-tomato">
                            Estimated: {new Date(order.estimatedDelivery).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Items + Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item: any, idx: number) => (
                          <span key={idx} className="text-sm text-charcoal/70">
                            {item.quantity}x {item.name}
                            {idx < order.items.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelClick(order.orderId)}
                            className="rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            Cancel Order
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/order/${order.orderId}`)}
                          className="flex items-center gap-1 text-sm font-semibold text-tomato transition-colors hover:underline"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-full border border-charcoal/15 px-4 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:border-tomato/40 hover:text-tomato disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm font-medium text-warm-gray">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-full border border-charcoal/15 px-4 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:border-tomato/40 hover:text-tomato disabled:opacity-40"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-charcoal">Cancel Order?</h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-warm-gray">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-full bg-tomato py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
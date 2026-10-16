// frontend/src/apps/customer/pages/OrderTracking.tsx
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Check,
  ChefHat,
  PartyPopper,
  ShoppingBag,
  Bike,
  PackageX,
  Copy,
  CopyCheck,
  MapPin,
  Phone,
  ReceiptText,
  CreditCard,
  Wallet as WalletIcon,
  CircleCheck,
  CircleAlert,
  Star,
} from 'lucide-react'
import { io } from 'socket.io-client'
import { useOrder } from '@/api/Hooks'
import { cn } from '@/lib/utils'
import { TrackingMap } from '@/apps/customer/components/TrackingMap'
import { RatingModal } from '@/apps/customer/components/RatingModal'

const STAGES = [
  { key: 'placed', label: 'Order placed', caption: "We've got your order", icon: ShoppingBag },
  { key: 'preparing', label: 'Preparing your food', caption: 'The kitchen is on it', icon: ChefHat },
  { key: 'out-for-delivery', label: 'Out for delivery', caption: 'Your rider is on the way', icon: Bike },
  { key: 'delivered', label: 'Delivered', caption: 'Enjoy your meal', icon: PartyPopper },
] as const

function stageIndexForStatus(status: string) {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return 0
    case 'preparing':
    case 'ready':
      return 1
    case 'out-for-delivery':
      return 2
    case 'delivered':
      return 3
    default:
      return 0
  }
}

function useCountdown(target?: string | Date) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!target) return
    const targetMs = new Date(target).getTime()

    const tick = () => {
      const diffMs = targetMs - Date.now()
      if (diffMs <= 0) {
        setLabel('Any moment now')
        return
      }
      const mins = Math.round(diffMs / 60000)
      setLabel(mins <= 1 ? '1 min' : `${mins} mins`)
    }

    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [target])

  return label
}

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const state = location.state as { estimatedMinutes?: number; total?: number } | null
  const { data: order, isLoading, isError, refetch } = useOrder(orderId)
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)

  const activeIndex = liveStatus
    ? stageIndexForStatus(liveStatus)
    : order
      ? stageIndexForStatus(order.status)
      : 0
  const isCancelled = liveStatus === 'cancelled' || order?.status === 'cancelled'
  const isDelivered = liveStatus === 'delivered' || order?.status === 'delivered'
  const isOutForDelivery =
    liveStatus === 'out-for-delivery' || order?.status === 'out-for-delivery'
  const countdown = useCountdown(order?.estimatedDelivery)

  // 🔥 Restaurant aur Customer ki location set karo (order se ya default)
  const restaurantLocation = {
    lat: order?.restaurant?.location?.coordinates?.[1] || 19.076,
    lng: order?.restaurant?.location?.coordinates?.[0] || 72.8777,
  }

  const customerLocation = {
    lat: order?.deliveryLocation?.lat || 19.0896,
    lng: order?.deliveryLocation?.lng || 72.8656,
  }

  // 🔥 SOCKET.IO - Real-time tracking
  useEffect(() => {
    if (!orderId) return

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    })

    // Order room join karo
    socket.emit('join-order-room', orderId)

    // Status update listen karo
    socket.on('order-status-update', (data: any) => {
      console.log('📦 Order status updated:', data)
      setLiveStatus(data.status)
      refetch()
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    return () => {
      socket.disconnect()
    }
  }, [orderId, refetch])

  // 🔥 Auto-open rating modal 2 seconds after delivery
  useEffect(() => {
    if (
      order?.status === 'delivered' &&
      order?.deliveryPartner &&
      !order?.deliveryPartnerRating
    ) {
      const timer = setTimeout(() => setRatingModalOpen(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [order?.status, order?.deliveryPartner, order?.deliveryPartnerRating])

  const handleCopyId = () => {
    if (!order) return
    navigator.clipboard.writeText(order.orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  // "Order again" button ka onClick handler
  const handleOrderAgain = () => {
    if (order?.restaurant?._id) {
      navigate(`/restaurants/${order.restaurant._id}`)
    } else if (order?.restaurant?.id) {
      navigate(`/restaurants/${order.restaurant.id}`)
    } else {
      navigate('/')
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-5">
          <div className="mx-auto h-6 w-40 rounded-full bg-charcoal/8" />
          <div className="mx-auto h-9 w-2/3 rounded bg-charcoal/8" />
          <div className="h-48 rounded-3xl bg-charcoal/8" />
          <div className="h-36 rounded-3xl bg-charcoal/8" />
        </div>
      </section>
    )
  }

  if (isError || !order) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-12 shadow-soft">
          <p className="text-warm-gray">
            {isError ? "Couldn't load your order. Please try again." : 'Order not found.'}
          </p>
          <Link
            to="/orders"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-cream"
          >
            Back to orders
          </Link>
        </div>
      </section>
    )
  }

  // 🔥 CANCELLED ORDER VIEW (Refund Info ke saath)
  if (isCancelled) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8 sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-600">
          <PackageX className="h-3.5 w-3.5" />
          Order Cancelled
        </span>

        <h1 className="mt-6 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
          This order was cancelled
        </h1>
        <p className="mt-2 text-warm-gray">
          If this was a mistake, please reach out to support.
        </p>

        <div className="mt-6 rounded-2xl border border-charcoal/10 bg-white p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-warm-gray">Order Total</span>
            <span className="font-semibold text-charcoal">₹{order.total}</span>
          </div>
          {order.cancellationFee > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-warm-gray">Cancellation Fee</span>
              <span className="font-semibold text-red-600">-₹{order.cancellationFee}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-charcoal/10 pt-3">
            <span className="text-sm font-semibold text-charcoal">Refund Amount</span>
            <span className="text-lg font-bold text-green-600">
              ₹{order.refundAmount || order.total}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleOrderAgain}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-tomato to-orange px-7 py-3.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-[1.01] active:scale-[0.98] sm:w-auto sm:px-10"
          >
            Order again
          </button>
          <Link
            to="/orders"
            className="text-sm font-semibold text-warm-gray transition-colors hover:text-tomato"
          >
            View all orders
          </Link>
        </div>
      </section>
    )
  }

  // 🔥 DELIVERED ORDER VIEW — with Rating CTA
  if (isDelivered) {
    const alreadyRated = !!order.deliveryPartnerRating

    return (
      <section className="mx-auto max-w-2xl px-5 py-28 text-center sm:px-8 sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
          <Check className="h-3.5 w-3.5" />
          Delivered
        </span>

        <h1 className="mt-6 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
          Enjoy your meal! 🎉
        </h1>
        <p className="mt-2 text-warm-gray">Order #{order.orderId} has been delivered.</p>

        <div className="mt-8 rounded-3xl border border-charcoal/10 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-bold text-charcoal">
                {order.restaurant?.name}
              </p>
              <p className="text-sm text-warm-gray">Order #{order.orderId}</p>
            </div>
            <p className="font-display text-xl font-bold text-charcoal">
              ₹{order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* 🔥 Rating CTA — only if not rated yet */}
        {order.deliveryPartner && !alreadyRated && (
          <div className="mt-6 rounded-3xl border border-tomato/20 bg-linear-to-br from-tomato/5 to-orange/5 p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-soft">
                <Star className="h-7 w-7 fill-gold text-gold" />
              </div>
              <div className="text-center">
                <p className="font-display text-lg font-bold text-charcoal">
                  How was your delivery?
                </p>
                <p className="mt-1 text-sm text-warm-gray">
                  Rate {(order.deliveryPartner as any)?.name || 'your delivery partner'} and
                  add an optional tip
                </p>
              </div>
              <button
                onClick={() => setRatingModalOpen(true)}
                className="mt-2 rounded-full bg-linear-to-r from-tomato to-orange px-8 py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-105 active:scale-95"
              >
                ⭐ Rate Your Delivery
              </button>
            </div>
          </div>
        )}

        {/* If already rated */}
        {order.deliveryPartner && alreadyRated && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-4 py-3">
            <Check className="h-4 w-4 text-green-700" />
            <p className="text-sm font-semibold text-green-700">
              You rated this delivery {order.deliveryPartnerRating} ★
              {(order as any).tipAmount > 0 && ` · Tipped ₹${(order as any).tipAmount}`}
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handleOrderAgain}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-tomato to-orange px-7 py-3.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-[1.01] active:scale-[0.98] sm:w-auto sm:px-10"
          >
            Order again
          </button>
          <Link
            to="/orders"
            className="text-sm font-semibold text-warm-gray transition-colors hover:text-tomato"
          >
            View all orders
          </Link>
        </div>

        {/* 🔥 Rating Modal */}
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false)
            refetch()
          }}
          orderId={order.orderId}
          deliveryPartnerName={(order.deliveryPartner as any)?.name}
        />
      </section>
    )
  }

  // 🔥 ACTIVE ORDER VIEW (Pending, Preparing, Out for Delivery)
  return (
    <section className="mx-auto max-w-2xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
      {/* ---- Status header ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center"
      >
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide',
            isCancelled && 'bg-red-50 text-red-600',
            isDelivered && 'bg-green-50 text-green-700',
            !isCancelled && !isDelivered && 'bg-tomato/8 text-tomato'
          )}
        >
          {!isCancelled && !isDelivered && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tomato opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tomato" />
            </span>
          )}
          {isCancelled ? (
            <PackageX className="h-3.5 w-3.5" />
          ) : isDelivered ? (
            <Check className="h-3.5 w-3.5" />
          ) : null}
          {isCancelled ? 'Order cancelled' : STAGES[activeIndex].label}
        </span>

        <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-charcoal sm:text-4xl">
          {isCancelled
            ? 'This order was cancelled'
            : isDelivered
              ? 'Enjoy your meal 🎉'
              : STAGES[activeIndex].caption}
        </h1>

        {!isCancelled && !isDelivered && (
          <p className="mt-2 text-warm-gray">
            {countdown ? (
              <>
                Arriving in <span className="font-semibold text-charcoal">{countdown}</span>
              </>
            ) : (
              'Your food is on the way'
            )}
          </p>
        )}
        {isCancelled && (
          <p className="mt-2 text-warm-gray">
            If this was a mistake, please reach out to support.
          </p>
        )}
      </motion.div>

      {/* ---- Progress tracker ---- */}
      {!isCancelled && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-8 rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft sm:p-8"
        >
          <ol className="relative flex flex-col gap-0" aria-label="Order status">
            {STAGES.map((stage, i) => {
              const done = i < activeIndex || isDelivered
              const current = i === activeIndex && !isDelivered
              const isLast = i === STAGES.length - 1

              return (
                <li key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute left-[21px] top-11 h-[calc(100%-2.75rem)] w-0.5 -translate-x-1/2 bg-charcoal/10"
                      aria-hidden
                    >
                      <motion.span
                        initial={{ height: '0%' }}
                        animate={{ height: done ? '100%' : '0%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        className="block w-full bg-linear-to-b from-tomato to-orange"
                      />
                    </span>
                  )}

                  <div
                    className={cn(
                      'relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300',
                      done
                        ? 'border-tomato bg-tomato text-cream'
                        : current
                          ? 'border-tomato bg-white text-tomato'
                          : 'border-charcoal/12 bg-white text-charcoal/25'
                    )}
                  >
                    {current && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tomato/30" />
                    )}
                    {done ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <stage.icon className="relative h-5 w-5" />
                    )}
                  </div>

                  <div className="pt-1.5">
                    <p
                      className={cn(
                        'font-semibold',
                        done || current ? 'text-charcoal' : 'text-charcoal/35'
                      )}
                    >
                      {stage.label}
                    </p>
                    {current && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-0.5 text-xs font-medium text-tomato"
                        aria-live="polite"
                      >
                        {stage.caption} · in progress
                      </motion.p>
                    )}
                    {!current && (done || i > activeIndex) && (
                      <p className="mt-0.5 text-xs text-warm-gray">{stage.caption}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </motion.div>
      )}

      {/* ---- Delivery partner card ---- */}
      <AnimatePresence>
        {isOutForDelivery && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 rounded-3xl border border-charcoal/5 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tomato/10">
                  <Bike className="h-6 w-6 text-tomato" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {order.deliveryPartner?.name ?? 'Your delivery partner'}
                  </p>
                  <p className="text-sm text-warm-gray">is heading to your location</p>
                </div>
              </div>
              <a
                href={
                  order.deliveryPartner?.phone
                    ? `tel:${order.deliveryPartner.phone}`
                    : undefined
                }
                aria-disabled={!order.deliveryPartner?.phone}
                className={cn(
                  'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-charcoal text-cream transition-transform',
                  order.deliveryPartner?.phone
                    ? 'hover:scale-105 active:scale-95'
                    : 'pointer-events-none opacity-40'
                )}
              >
                <Phone className="h-4.5 w-4.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 Tracking Map (Sirf Out for Delivery ya Delivered ke liye) */}
      {(isOutForDelivery || isDelivered) && orderId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4"
        >
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <MapPin className="h-5 w-5 text-tomato" />
            Live Tracking
          </h2>
          <TrackingMap
            orderId={orderId}
            restaurantLocation={restaurantLocation}
            customerLocation={customerLocation}
          />
        </motion.div>
      )}

      {/* ---- Order summary card ---- */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-4 rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {order.restaurant?.image ? (
              <img
                src={order.restaurant.image}
                alt={order.restaurant?.name ?? 'Restaurant'}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-beige" />
            )}
            <div>
              <p className="font-display text-lg font-bold text-charcoal">
                {order.restaurant?.name}
              </p>
              <button
                onClick={handleCopyId}
                className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-warm-gray transition-colors hover:text-tomato"
              >
                #{order.orderId}
                {copied ? (
                  <CopyCheck className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <p
            className={cn(
              'shrink-0 font-display text-xl font-bold',
              isCancelled ? 'text-red-600' : 'text-charcoal'
            )}
          >
            ₹{order.total.toFixed(2)}
          </p>
        </div>

        <div className="mt-5 flex items-start gap-3 border-t border-charcoal/8 pt-5">
          <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/40" />
          <div className="flex flex-wrap gap-x-1.5 gap-y-1 text-sm text-charcoal/70">
            {order.items.map((item: any, idx: number) => (
              <span key={idx}>
                {item.quantity}× {item.name}
                {idx < order.items.length - 1 && ','}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-3">
          {order.paymentMethod === 'cod' ? (
            <WalletIcon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/40" />
          ) : (
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/40" />
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal/70">
              {order.paymentMethod === 'cod'
                ? 'Cash on Delivery'
                : order.paymentMethod === 'upi'
                  ? 'UPI'
                  : 'Card Payment'}
            </span>
            {order.isPaid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                <CircleCheck className="h-3.5 w-3.5" />
                Paid
              </span>
            ) : order.paymentMethod === 'cod' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
                <CircleAlert className="h-3.5 w-3.5" />
                Pay on delivery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                <CircleAlert className="h-3.5 w-3.5" />
                Payment pending
              </span>
            )}
          </div>
        </div>

        {order.razorpayPaymentId && (
          <p className="mt-1.5 pl-7 text-xs text-warm-gray">
            Payment ID: {order.razorpayPaymentId}
          </p>
        )}

        {order.address && (
          <div className="mt-3 flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-charcoal/40" />
            <p className="text-sm text-charcoal/70">{order.address}</p>
          </div>
        )}
      </motion.div>

      {/* ---- Actions ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8 flex flex-col items-center gap-4"
      >
        <button
          onClick={handleOrderAgain}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-tomato to-orange px-7 py-3.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-[1.01] active:scale-[0.98] sm:w-auto sm:px-10"
        >
          {isDelivered || isCancelled ? 'Order again' : 'Back to home'}
        </button>

        <Link
          to="/orders"
          className="text-sm font-semibold text-warm-gray transition-colors hover:text-tomato"
        >
          View all orders
        </Link>
      </motion.div>
    </section>
  )
}
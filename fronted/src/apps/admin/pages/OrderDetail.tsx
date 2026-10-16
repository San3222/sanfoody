// src/apps/admin/pages/OrderDetail.tsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package,
  User,
  Store,
  Bike,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Loader2,
  Calendar,
  Hash,
  IndianRupee,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useAdminOrder } from '@/api/adminHooks'
import { cn } from '@/lib/utils'

// Status config
const STATUS_CONFIG: Record<string, any> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'info', icon: CheckCircle2 },
  preparing: { label: 'Preparing', variant: 'info', icon: ChefHat },
  ready: { label: 'Ready', variant: 'success', icon: Package },
  'out-for-delivery': { label: 'Out for Delivery', variant: 'info', icon: Bike },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
}

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading } = useAdminOrder(orderId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-tomato" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-warm-gray">Order not found</p>
        <Link
          to="/admin/orders"
          className="mt-4 inline-block text-tomato hover:underline"
        >
          Back to orders
        </Link>
      </div>
    )
  }

  const customer = order.user as any
  const restaurant = order.restaurant as any
  const deliveryPartner = order.deliveryPartner as any
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const StatusIcon = config.icon

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-charcoal/10 text-charcoal hover:bg-beige"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-charcoal">
                Order {order.orderId}
              </h1>
              <Badge variant={config.variant}>
                <span className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
              </Badge>
              {order.isPaid ? (
                <Badge variant="success">Paid</Badge>
              ) : (
                <Badge variant="warning">Payment Pending</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-warm-gray">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <Receipt className="h-5 w-5 text-tomato" />
              Order Items
            </h2>

            <div className="mt-4 space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 border-b border-charcoal/5 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-warm-gray">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-charcoal">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <MapPin className="h-5 w-5 text-tomato" />
              Delivery Address
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-charcoal">
              {order.address}
            </p>
          </Card>

          {/* Bill Summary */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <IndianRupee className="h-5 w-5 text-tomato" />
              Bill Summary
            </h2>

            <div className="mt-4 space-y-2 text-sm">
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
                <span>₹{order.gst || 0}</span>
              </div>
              {order.tipAmount > 0 && (
                <div className="flex justify-between text-warm-gray">
                  <span>Tip</span>
                  <span>₹{order.tipAmount}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-charcoal/10 pt-2 font-bold text-charcoal">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-beige/50 p-3">
              {order.paymentMethod === 'cod' ? (
                <Banknote className="h-4 w-4 text-warm-gray" />
              ) : (
                <CreditCard className="h-4 w-4 text-warm-gray" />
              )}
              <span className="text-sm font-medium text-charcoal">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery'
                  : order.paymentMethod === 'upi'
                    ? 'UPI Payment'
                    : 'Card Payment'}
              </span>
              {order.razorpayPaymentId && (
                <span className="ml-auto text-xs text-warm-gray">
                  {order.razorpayPaymentId}
                </span>
              )}
            </div>
          </Card>

          {/* Order Timeline */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <Clock className="h-5 w-5 text-tomato" />
              Timeline
            </h2>

            <div className="mt-4 space-y-3">
              <TimelineItem
                label="Order Placed"
                date={order.createdAt}
                icon={Package}
                active
              />
              {order.acceptedAt && (
                <TimelineItem
                  label="Accepted by Restaurant"
                  date={String(order.acceptedAt)}
                  icon={CheckCircle2}
                  active
                />
              )}
              {order.preparedAt && (
                <TimelineItem
                  label="Preparing"
                  date={String(order.preparedAt)}
                  icon={ChefHat}
                  active
                />
              )}
              {order.readyAt && (
                <TimelineItem
                  label="Ready for Pickup"
                  date={String(order.readyAt)}
                  icon={Package}
                  active
                />
              )}
              {order.pickedUpAt && (
                <TimelineItem
                  label="Picked Up"
                  date={String(order.pickedUpAt)}
                  icon={Bike}
                  active
                />
              )}
              {order.deliveredAt && (
                <TimelineItem
                  label="Delivered"
                  date={String(order.deliveredAt)}
                  icon={CheckCircle2}
                  active
                  color="green"
                />
              )}
              {order.rejectedAt && (
                <TimelineItem
                  label={`Rejected${order.rejectionReason ? `: ${order.rejectionReason}` : ''}`}
                  date={String(order.rejectedAt)}
                  icon={XCircle}
                  active
                  color="red"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Right: side info */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <User className="h-4 w-4 text-tomato" />
              Customer
            </h2>
            {customer ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-tomato/10 font-bold text-tomato">
                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">
                      {customer.name}
                    </p>
                    <p className="truncate text-xs text-warm-gray">
                      {customer.email}
                    </p>
                  </div>
                </div>
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 rounded-xl bg-beige/50 p-2.5 text-sm text-charcoal transition-colors hover:bg-beige"
                  >
                    <Phone className="h-3.5 w-3.5 text-warm-gray" />
                    {customer.phone}
                  </a>
                )}
                {customer._id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/admin/users/${customer._id}`)}
                  >
                    View Customer Profile
                  </Button>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-warm-gray">Customer info not available</p>
            )}
          </Card>

          {/* Restaurant */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <Store className="h-4 w-4 text-tomato" />
              Restaurant
            </h2>
            {restaurant ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  {restaurant.image && (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">
                      {restaurant.name}
                    </p>
                    {restaurant.address && (
                      <p className="truncate text-xs text-warm-gray">
                        {restaurant.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-warm-gray">Restaurant not available</p>
            )}
          </Card>

          {/* Delivery Partner */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <Bike className="h-4 w-4 text-tomato" />
              Delivery Partner
            </h2>
            {deliveryPartner ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {deliveryPartner.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">
                      {deliveryPartner.name}
                    </p>
                    {deliveryPartner.phone && (
                      <p className="truncate text-xs text-warm-gray">
                        {deliveryPartner.phone}
                      </p>
                    )}
                  </div>
                </div>

                {deliveryPartner.vehicleNumber && (
                  <p className="text-xs text-warm-gray">
                    🚗 {deliveryPartner.vehicleType} · {deliveryPartner.vehicleNumber}
                  </p>
                )}

                {deliveryPartner.rating !== undefined && (
                  <p className="text-xs text-warm-gray">
                    ⭐ {deliveryPartner.rating.toFixed(1)} rating
                  </p>
                )}

                {deliveryPartner._id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/admin/users/${deliveryPartner._id}`)}
                  >
                    View Partner Profile
                  </Button>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-warm-gray">
                No delivery partner assigned yet
              </p>
            )}
          </Card>

          {/* Meta Info */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
              <Hash className="h-4 w-4 text-tomato" />
              Order Info
            </h2>
            <div className="mt-3 space-y-2 text-xs">
              <MetaRow label="Order ID" value={order.orderId} mono />
              <MetaRow label="Status" value={order.status} />
              <MetaRow label="Payment" value={order.paymentMethod.toUpperCase()} />
              <MetaRow
                label="Payment Status"
                value={order.paymentStatus || (order.isPaid ? 'paid' : 'pending')}
              />
              {order.razorpayOrderId && (
                <MetaRow label="Razorpay Order" value={String(order.razorpayOrderId)} mono />
              )}
              {order.razorpayPaymentId && (
                <MetaRow
                  label="Razorpay Payment"
                  value={String(order.razorpayPaymentId)}
                  mono
                />
              )}
              {order.deliveryEarnings !== undefined && (
                <MetaRow
                  label="Partner Earnings"
                  value={`₹${order.deliveryEarnings}`}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function TimelineItem({
  label,
  date,
  icon: Icon,
  active,
  color = 'tomato',
}: {
  label: string
  date: string
  icon: React.ElementType
  active?: boolean
  color?: 'tomato' | 'green' | 'red'
}) {
  const colorClasses = {
    tomato: 'bg-tomato/10 text-tomato',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full',
          colorClasses[color]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-charcoal">{label}</p>
        <p className="text-xs text-warm-gray">
          {new Date(date).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-charcoal/5 pb-2 last:border-0 last:pb-0">
      <span className="text-warm-gray">{label}</span>
      <span className={cn('font-medium text-charcoal', mono && 'font-mono text-[10px]')}>
        {value}
      </span>
    </div>
  )
}
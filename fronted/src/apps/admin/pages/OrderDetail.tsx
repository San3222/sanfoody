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
  CreditCard,
  Banknote,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Loader2,
  IndianRupee,
  Copy,
  Printer,
  ChevronRight,
  Star,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { AdminButton } from '@/components/ui/AdminButton'
import { useAdminOrder } from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const STATUS_CONFIG: Record<string, any> = {
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'info', icon: CheckCircle2 },
  preparing: { label: 'Preparing', variant: 'info', icon: ChefHat },
  ready: { label: 'Ready', variant: 'success', icon: Package },
  'out-for-delivery': { label: 'Out for Delivery', variant: 'info', icon: Bike },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', variant: 'danger', icon: XCircle },
}

const FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered']

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const fmtShort = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

// ============================================
// Page
// ============================================

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

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
        <Link to="/admin/orders" className="mt-4 inline-block text-tomato hover:underline">
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
  const isCancelled = order.status === 'cancelled'
  const currentStep = FLOW.indexOf(order.status)
  const itemCount = order.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0)

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('success', `${label} copied`)
    } catch {
      showToast('error', 'Copy failed')
    }
  }

  const PayIcon =
    order.paymentMethod === 'cod' ? Banknote : order.paymentMethod === 'upi' ? Smartphone : CreditCard
  const payLabel =
    order.paymentMethod === 'cod'
      ? 'Cash on Delivery'
      : order.paymentMethod === 'upi'
        ? 'UPI Payment'
        : 'Card Payment'

  // Timeline entries (only those that have a timestamp)
  const timeline = [
    { label: 'Order placed', date: order.createdAt, icon: Package, tone: 'tomato' },
    order.acceptedAt && { label: 'Accepted by restaurant', date: String(order.acceptedAt), icon: CheckCircle2, tone: 'tomato' },
    order.preparedAt && { label: 'Preparing', date: String(order.preparedAt), icon: ChefHat, tone: 'tomato' },
    order.readyAt && { label: 'Ready for pickup', date: String(order.readyAt), icon: Package, tone: 'tomato' },
    order.pickedUpAt && { label: 'Picked up', date: String(order.pickedUpAt), icon: Bike, tone: 'tomato' },
    order.deliveredAt && { label: 'Delivered', date: String(order.deliveredAt), icon: CheckCircle2, tone: 'green' },
    order.rejectedAt && {
      label: 'Rejected',
      sub: order.rejectionReason,
      date: String(order.rejectedAt),
      icon: XCircle,
      tone: 'red',
    },
  ].filter(Boolean) as {
    label: string
    sub?: string
    date: string
    icon: React.ElementType
    tone: 'tomato' | 'green' | 'red'
  }[]

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-warm-gray">
        <button
          onClick={() => navigate('/admin/orders')}
          className="mr-1 grid h-8 w-8 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal hover:bg-beige"
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Link to="/admin/orders" className="hover:text-tomato">
          Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-mono text-xs font-medium text-charcoal">{order.orderId}</span>
      </nav>

      {/* Header card */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-charcoal">
                Order {order.orderId}
              </h1>
              <Badge variant={config.variant}>
                <span className="inline-flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
              </Badge>
              {order.isPaid ? (
                <Badge variant="success">Paid</Badge>
              ) : (
                <Badge variant="warning">Payment pending</Badge>
              )}
            </div>
            <p className="mt-1.5 text-sm text-warm-gray">
              Placed on {fmtDateTime(order.createdAt)} · {itemCount} item{itemCount !== 1 ? 's' : ''} ·{' '}
              <span className="font-semibold text-charcoal">₹{order.total}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminButton variant="secondary" onClick={() => copy(order.orderId, 'Order ID')}>
              <Copy className="h-4 w-4" />
              Copy ID
            </AdminButton>
            <AdminButton variant="primary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print invoice
            </AdminButton>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="mt-6 border-t border-charcoal/10 pt-6">
          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
              <XCircle className="h-6 w-6 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-900">This order was cancelled</p>
                {order.rejectionReason && (
                  <p className="text-xs text-red-700">Reason: {order.rejectionReason}</p>
                )}
              </div>
            </div>
          ) : (
            <ol className="flex items-start">
              {FLOW.map((step, i) => {
                const done = currentStep >= i
                const current = currentStep === i
                const cfg = STATUS_CONFIG[step]
                const Icon = cfg.icon
                return (
                  <li key={step} className="relative flex flex-1 flex-col items-center text-center">
                    {i > 0 && (
                      <span
                        className={cn(
                          'absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2',
                          currentStep >= i ? 'bg-tomato' : 'bg-charcoal/10'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 transition-colors',
                        done
                          ? 'border-tomato bg-tomato text-cream'
                          : 'border-charcoal/15 bg-white text-charcoal/30',
                        current && 'ring-4 ring-tomato/20'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={cn(
                        'mt-2 hidden text-[11px] font-semibold sm:block',
                        done ? 'text-charcoal' : 'text-charcoal/40'
                      )}
                    >
                      {cfg.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="space-y-5 lg:col-span-2">
          {/* Items */}
          <Panel title="Order items" icon={Receipt} action={<span className="text-xs text-warm-gray">{itemCount} items</span>}>
            <div className="divide-y divide-charcoal/5">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-charcoal/5 text-warm-gray">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-charcoal">{item.name}</p>
                      <p className="mt-0.5 text-xs text-warm-gray">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold text-charcoal">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Delivery address */}
          <Panel
            title="Delivery address"
            icon={MapPin}
            action={
              <AdminButton
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`,
                    '_blank'
                  )
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in Maps
              </AdminButton>
            }
          >
            <p className="rounded-xl bg-beige/40 p-3.5 text-sm leading-relaxed text-charcoal">
              {order.address}
            </p>
          </Panel>

          {/* Bill */}
          <Panel title="Bill summary" icon={IndianRupee}>
            <div className="space-y-2.5 text-sm">
              <BillRow label="Subtotal" value={order.subtotal} />
              <BillRow label="Delivery fee" value={order.deliveryFee} />
              <BillRow label="GST" value={order.gst || 0} />
              {order.tipAmount > 0 && <BillRow label="Tip" value={order.tipAmount} />}
              <div className="flex items-center justify-between border-t border-dashed border-charcoal/15 pt-3 text-base font-bold text-charcoal">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-beige/40 p-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-charcoal/70">
                <PayIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-charcoal">{payLabel}</p>
                <p className={cn('text-xs font-semibold', order.isPaid ? 'text-green-700' : 'text-amber-600')}>
                  {order.isPaid ? 'Payment received' : 'Payment pending'}
                </p>
              </div>
              {order.razorpayPaymentId && (
                <button
                  onClick={() => copy(String(order.razorpayPaymentId), 'Payment ID')}
                  className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-warm-gray hover:text-tomato"
                  title="Copy payment ID"
                >
                  {String(order.razorpayPaymentId)}
                  <Copy className="h-3 w-3" />
                </button>
              )}
            </div>
          </Panel>

          {/* Timeline */}
          <Panel title="Timeline" icon={Clock}>
            <ol>
              {timeline.map((t, i) => (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span className="absolute left-4 top-9 h-[calc(100%-28px)] w-px bg-charcoal/10" />
                  )}
                  <span
                    className={cn(
                      'relative grid h-8 w-8 shrink-0 place-items-center rounded-full',
                      t.tone === 'tomato' && 'bg-tomato/10 text-tomato',
                      t.tone === 'green' && 'bg-green-100 text-green-700',
                      t.tone === 'red' && 'bg-red-100 text-red-700'
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-charcoal">{t.label}</p>
                    {t.sub && <p className="text-xs text-red-600">{t.sub}</p>}
                    <p className="text-xs text-warm-gray">{fmtShort(t.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5">
          {/* Customer */}
          <Panel title="Customer" icon={User}>
            {customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tomato/10 font-bold text-tomato">
                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">{customer.name}</p>
                    <p className="truncate text-xs text-warm-gray">{customer.email}</p>
                  </div>
                </div>
                {customer.phone && (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-beige/40 p-3 text-sm text-charcoal">
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-warm-gray" />
                      {customer.phone}
                    </span>
                    <AdminButton
                      size="icon"
                      variant="ghost"
                      title="Call customer"
                      aria-label="Call customer"
                      onClick={() => (window.location.href = `tel:${customer.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </AdminButton>
                  </div>
                )}
                {customer._id && (
                  <AdminButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/admin/users/${customer._id}`)}
                  >
                    View customer profile
                  </AdminButton>
                )}
              </div>
            ) : (
              <p className="text-sm text-warm-gray">Customer info not available</p>
            )}
          </Panel>

          {/* Restaurant */}
          <Panel title="Restaurant" icon={Store}>
            {restaurant ? (
              <div className="flex items-center gap-3">
                {restaurant.image ? (
                  <img src={restaurant.image} alt={restaurant.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-charcoal/5 text-warm-gray">
                    <Store className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-charcoal">{restaurant.name}</p>
                  {restaurant.address && (
                    <p className="truncate text-xs text-warm-gray">{restaurant.address}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-warm-gray">Restaurant not available</p>
            )}
          </Panel>

          {/* Delivery partner */}
          <Panel title="Delivery partner" icon={Bike}>
            {deliveryPartner ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {deliveryPartner.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-charcoal">{deliveryPartner.name}</p>
                    {deliveryPartner.phone && (
                      <p className="truncate text-xs text-warm-gray">{deliveryPartner.phone}</p>
                    )}
                  </div>
                  {deliveryPartner.rating !== undefined && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-current" />
                      {Number(deliveryPartner.rating).toFixed(1)}
                    </span>
                  )}
                </div>

                {deliveryPartner.vehicleNumber && (
                  <div className="flex items-center gap-2 rounded-xl bg-beige/40 p-3 text-xs text-charcoal">
                    <Bike className="h-3.5 w-3.5 text-warm-gray" />
                    <span className="capitalize">{deliveryPartner.vehicleType}</span>
                    <span className="text-warm-gray">·</span>
                    <span className="font-mono">{deliveryPartner.vehicleNumber}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {deliveryPartner.phone && (
                    <AdminButton
                      variant="secondary"
                      className="flex-1"
                      onClick={() => (window.location.href = `tel:${deliveryPartner.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </AdminButton>
                  )}
                  {deliveryPartner._id && (
                    <AdminButton
                      variant="secondary"
                      className="flex-1"
                      onClick={() => navigate(`/admin/users/${deliveryPartner._id}`)}
                    >
                      Profile
                    </AdminButton>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-warm-gray">No delivery partner assigned yet</p>
            )}
          </Panel>

          {/* Meta */}
          <Panel title="Order info" icon={Receipt}>
            <div className="space-y-2.5 text-xs">
              <MetaRow label="Order ID" value={order.orderId} mono />
              <MetaRow label="Status" value={order.status.replace(/-/g, ' ')} capitalize />
              <MetaRow label="Payment" value={order.paymentMethod.toUpperCase()} />
              <MetaRow
                label="Payment status"
                value={order.paymentStatus || (order.isPaid ? 'paid' : 'pending')}
                capitalize
              />
              {order.razorpayOrderId && (
                <MetaRow label="Razorpay order" value={String(order.razorpayOrderId)} mono />
              )}
              {order.deliveryEarnings !== undefined && (
                <MetaRow label="Partner earnings" value={`₹${order.deliveryEarnings}`} />
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string
  icon: React.ElementType
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-tomato/10 text-tomato">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function BillRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-warm-gray">
      <span>{label}</span>
      <span className="text-charcoal">₹{value}</span>
    </div>
  )
}

function MetaRow({
  label,
  value,
  mono = false,
  capitalize = false,
}: {
  label: string
  value: string
  mono?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-charcoal/5 pb-2.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-warm-gray">{label}</span>
      <span
        className={cn(
          'truncate text-right font-medium text-charcoal',
          mono && 'font-mono text-[11px]',
          capitalize && 'capitalize'
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}
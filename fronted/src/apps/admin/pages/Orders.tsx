// src/apps/admin/pages/Orders.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Eye,
  SlidersHorizontal,
  Banknote,
  CreditCard,
  Smartphone,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { AdminButton } from '@/components/ui/AdminButton'
import { useAdminOrders } from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'out-for-delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

const PAYMENT_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
] as const

const METHOD_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: 'cod', label: 'COD' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
] as const

const statusColors: Record<string, any> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  'out-for-delivery': 'info',
  delivered: 'success',
  cancelled: 'danger',
}

// ============================================
// Helpers
// ============================================

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

function MethodIcon({ method }: { method?: string }) {
  if (method === 'cod') return <Banknote className="h-3.5 w-3.5" />
  if (method === 'upi') return <Smartphone className="h-3.5 w-3.5" />
  return <CreditCard className="h-3.5 w-3.5" />
}

function exportCsv(orders: any[]) {
  const header = ['Order ID', 'Customer', 'Phone', 'Restaurant', 'Items', 'Total', 'Payment', 'Paid', 'Status', 'Placed at']
  const rows = orders.map((o) => [
    o.orderId,
    o.user?.name ?? '',
    o.user?.phone ?? '',
    o.restaurant?.name ?? '',
    o.items?.length ?? 0,
    o.total,
    o.paymentMethod ?? '',
    o.isPaid ? 'Yes' : 'No',
    o.status,
    new Date(o.createdAt).toISOString(),
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Page
// ============================================

export function AdminOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [status, setStatus] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [showFilters, setShowFilters] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, refetch, isRefetching } = useAdminOrders(status, search, page, 20)

  const orders: any[] = data?.orders ?? []

  const visibleOrders = useMemo(
    () =>
      orders.filter((o) => {
        if (paymentFilter === 'paid' && !o.isPaid) return false
        if (paymentFilter === 'unpaid' && o.isPaid) return false
        if (methodFilter !== 'all' && o.paymentMethod !== methodFilter) return false
        return true
      }),
    [orders, paymentFilter, methodFilter]
  )

  const pageRevenue = visibleOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + (Number(o.total) || 0), 0)

  const activeFilterCount =
    (paymentFilter !== 'all' ? 1 : 0) + (methodFilter !== 'all' ? 1 : 0)

  const copyId = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(id)
      showToast('success', 'Order ID copied')
    } catch {
      showToast('error', 'Copy failed')
    }
  }

  const handleExport = () => {
    if (visibleOrders.length === 0) return showToast('error', 'Nothing to export')
    exportCsv(visibleOrders)
    showToast('success', `Exported ${visibleOrders.length} orders`)
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Orders</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {data?.total ?? 0} orders across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </AdminButton>
          <AdminButton variant="primary" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-6 rounded-2xl border border-charcoal/10 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl bg-beige/50 px-3.5 focus-within:bg-beige/80">
            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by order ID or address..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="text-warm-gray hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <AdminButton
            variant="secondary"
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              'h-10 rounded-xl',
              (showFilters || activeFilterCount > 0) && 'border-tomato/40 text-tomato'
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[10px] text-cream">
                {activeFilterCount}
              </span>
            )}
          </AdminButton>
        </div>

        {/* Status tabs */}
        <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto rounded-xl bg-beige/50 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatus(tab.id)
                setPage(1)
              }}
              className={cn(
                'h-8 shrink-0 rounded-lg px-3.5 text-sm font-semibold transition-all',
                status === tab.id
                  ? 'bg-white text-tomato shadow-sm'
                  : 'text-charcoal/60 hover:text-charcoal'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3 border-t border-charcoal/10 pt-3">
            <FilterGroup
              label="Payment"
              options={PAYMENT_FILTERS}
              value={paymentFilter}
              onChange={setPaymentFilter}
            />
            <FilterGroup
              label="Method"
              options={METHOD_FILTERS}
              value={methodFilter}
              onChange={setMethodFilter}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setPaymentFilter('all')
                  setMethodFilter('all')
                }}
                className="ml-auto pb-1.5 text-xs font-semibold text-tomato hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
            ))}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-charcoal/5">
              <Package className="h-6 w-6 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">No orders found</p>
            <p className="mt-1 text-sm text-warm-gray">
              {search || activeFilterCount ? 'Try changing your search or filters.' : 'Orders will show up here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-beige/40 text-[11px] uppercase tracking-wider text-warm-gray">
                  <th className="py-3 pl-5 pr-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Restaurant</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Payment</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Placed</th>
                  <th className="py-3 pl-3 pr-5 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    className="group cursor-pointer border-b border-charcoal/5 transition-colors last:border-0 hover:bg-beige/30"
                  >
                    <td className="py-3 pl-5 pr-3">
                      <button
                        onClick={(e) => copyId(e, order.orderId)}
                        title="Copy order ID"
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-charcoal hover:text-tomato"
                      >
                        {order.orderId}
                        <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tomato/10 text-xs font-bold text-tomato">
                          {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-charcoal">
                            {order.user?.name || 'Unknown'}
                          </p>
                          {order.user?.phone && (
                            <p className="text-xs text-warm-gray">{order.user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      {order.restaurant ? (
                        <div className="flex items-center gap-2.5">
                          {order.restaurant.image ? (
                            <img
                              src={order.restaurant.image}
                              alt=""
                              className="h-8 w-8 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-charcoal/5 text-warm-gray">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <span className="max-w-[160px] truncate text-charcoal">
                            {order.restaurant.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-warm-gray">Not available</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-warm-gray">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>

                    <td className="px-3 py-3 font-semibold text-charcoal">₹{order.total}</td>

                    <td className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase text-charcoal/70">
                          <MethodIcon method={order.paymentMethod} />
                          {order.paymentMethod}
                        </span>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-semibold',
                            order.isPaid ? 'text-green-700' : 'text-amber-600'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              order.isPaid ? 'bg-green-500' : 'bg-amber-500'
                            )}
                          />
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="capitalize">
                        <Badge variant={statusColors[order.status] || 'neutral'}>
                          {order.status.replace(/-/g, ' ')}
                        </Badge>
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-xs text-warm-gray">
                      {fmtDate(order.createdAt)}
                    </td>

                    <td className="py-3 pl-3 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <AdminButton
                        size="icon"
                        variant="ghost"
                        title="View order"
                        aria-label="View order"
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </AdminButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer: totals + pagination */}
        {!isLoading && visibleOrders.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 px-5 py-3">
            <p className="text-xs text-warm-gray">
              {data && data.totalPages > 1 ? (
                <>
                  Page {data.page} of {data.totalPages} ·{' '}
                </>
              ) : null}
              Showing {visibleOrders.length} orders · ₹{pageRevenue.toLocaleString('en-IN')} on this page
            </p>

            {data && data.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <AdminButton
                  size="icon"
                  variant="secondary"
                  aria-label="Previous page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </AdminButton>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === data.totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && p - arr[idx - 1] > 1 && (
                        <span className="px-1 text-warm-gray">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={cn(
                          'h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors',
                          p === page ? 'bg-tomato text-cream' : 'text-charcoal/70 hover:bg-beige'
                        )}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <AdminButton
                  size="icon"
                  variant="secondary"
                  aria-label="Next page"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </AdminButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Small components
// ============================================

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
        {label}
      </p>
      <div className="flex gap-1 rounded-xl bg-beige/50 p-1">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              'h-7 rounded-lg px-3 text-xs font-semibold transition-all',
              value === o.id
                ? 'bg-white text-tomato shadow-sm'
                : 'text-charcoal/60 hover:text-charcoal'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
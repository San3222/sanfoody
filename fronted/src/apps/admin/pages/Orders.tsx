// src/apps/admin/pages/Orders.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useAdminOrders } from '@/api/adminHooks'
import { cn } from '@/lib/utils'

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

const statusColors: Record<string, any> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  'out-for-delivery': 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export function AdminOrders() {
  const [status, setStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading, refetch, isRefetching } = useAdminOrders(
    status,
    search,
    page,
    20
  )

  const orders = data?.orders ?? []

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Orders</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {data?.total ?? 0} total orders across the platform · Click any order to view details
          </p>
        </div>

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

      {/* Search */}
      <div className="mt-6 flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2.5">
        <Search className="h-4 w-4 text-warm-gray" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by order ID or address..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
        />
      </div>

      {/* Status Tabs */}
      <div className="mt-4 scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatus(tab.id)
              setPage(1)
            }}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              status === tab.id
                ? 'bg-tomato text-cream'
                : 'bg-white text-charcoal/70 hover:bg-beige'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-charcoal/10 bg-white shadow-soft">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm text-warm-gray">
              {search ? 'No orders match your search' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-charcoal/10 bg-beige/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-charcoal">Order ID</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Customer</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Restaurant</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Items</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Total</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Status</th>
                  <th className="px-4 py-3 font-semibold text-charcoal">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    className="cursor-pointer border-b border-charcoal/5 transition-colors hover:bg-beige/30"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-charcoal">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-charcoal">
                        {order.user?.name || 'N/A'}
                      </p>
                      {order.user?.phone && (
                        <p className="text-xs text-warm-gray">{order.user.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.restaurant?.image && (
                          <img
                            src={order.restaurant.image}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        )}
                        <span className="text-sm text-charcoal">
                          {order.restaurant?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-warm-gray">
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 font-semibold text-charcoal">
                      ₹{order.total}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || 'neutral'}>
                        {order.status.replace(/-/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-warm-gray">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="inline-block h-4 w-4 text-warm-gray" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-charcoal/10 px-5 py-3">
            <p className="text-xs text-warm-gray">
              Page {data.page} of {data.totalPages} · {data.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/10 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-charcoal">
                {page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="grid h-8 w-8 place-items-center rounded-full border border-charcoal/10 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
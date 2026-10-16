// src/apps/admin/pages/Users.tsx
import { useState } from 'react'
import {
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  Users as UsersIcon,
  ShoppingBag,
  Store,
  Bike,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useAdminUsers, useToggleUserStatus } from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const ROLE_FILTERS = [
  { id: 'all', label: 'All', icon: UsersIcon },
  { id: 'customer', label: 'Customers', icon: ShoppingBag },
  { id: 'restaurant', label: 'Restaurants', icon: Store },
  { id: 'delivery', label: 'Delivery', icon: Bike },
] as const

const roleBadgeVariants: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  customer: 'info',
  restaurant: 'success',
  delivery: 'warning',
  admin: 'danger',
}

// 🔥 Verification status badge variants
const verificationVariants: Record<string, any> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
}

export function AdminUsers() {
  const [role, setRole] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading, refetch, isRefetching } = useAdminUsers(
    role,
    search,
    page,
    20
  )
  const toggleStatus = useToggleUserStatus()
  const { showToast } = useToast()

  const users = data?.users ?? []
  const stats = data?.stats

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    setPage(1)
  }

  const handleToggleStatus = (
    e: React.MouseEvent,
    userId: string,
    name: string,
    isActive: boolean
  ) => {
    e.stopPropagation() // 🔥 Prevent row click
    const action = isActive ? 'block' : 'activate'
    if (!confirm(`Are you sure you want to ${action} ${name}?`)) return

    toggleStatus.mutate(userId, {
      onSuccess: (result) => {
        showToast(
          'success',
          `User ${result.isActive ? 'activated' : 'blocked'} successfully`
        )
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Users</h1>
          <p className="mt-1 text-sm text-warm-gray">
            {data?.total ?? 0} total users on the platform
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

      {/* Stats Cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4">
            <p className="font-display text-xl font-bold text-charcoal">
              {stats.customers}
            </p>
            <p className="text-xs text-warm-gray">Customers</p>
          </Card>
          <Card className="p-4">
            <p className="font-display text-xl font-bold text-charcoal">
              {stats.restaurants}
            </p>
            <p className="text-xs text-warm-gray">Restaurants</p>
          </Card>
          <Card className="p-4">
            <p className="font-display text-xl font-bold text-charcoal">
              {stats.delivery}
            </p>
            <p className="text-xs text-warm-gray">Delivery Partners</p>
          </Card>
          <Card className="p-4">
            <p className="font-display text-xl font-bold text-charcoal">
              {stats.admins}
            </p>
            <p className="text-xs text-warm-gray">Admins</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2.5">
          <Search className="h-4 w-4 text-warm-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
          />
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleRoleChange(filter.id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                role === filter.id
                  ? 'bg-tomato text-cream'
                  : 'bg-white text-charcoal/70 hover:bg-beige'
              )}
            >
              <filter.icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-charcoal/10 bg-white shadow-soft">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm text-warm-gray">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-charcoal/10 bg-beige/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-charcoal">Name</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Email</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Role</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Verification</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Status</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Joined</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => {
                  // 🔥 Get verification status for restaurant/delivery
                  const details =
                    user.role === 'restaurant'
                      ? user.restaurantDetails
                      : user.role === 'delivery'
                        ? user.deliveryDetails
                        : null
                  const verificationStatus = details?.verificationStatus

                  return (
                    <tr
                      key={user._id}
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="cursor-pointer border-b border-charcoal/5 transition-colors hover:bg-beige/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'grid h-8 w-8 place-items-center rounded-full text-xs font-bold',
                              user.role === 'admin'
                                ? 'bg-tomato text-cream'
                                : 'bg-tomato/10 text-tomato'
                            )}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-charcoal">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-warm-gray">{user.email}</td>
                      <td className="px-5 py-3">
                        <Badge variant={roleBadgeVariants[user.role] || 'neutral'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {verificationStatus ? (
                          <Badge variant={verificationVariants[verificationStatus]}>
                            {verificationStatus}
                          </Badge>
                        ) : (
                          <span className="text-xs text-warm-gray">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-warm-gray">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) =>
                                handleToggleStatus(
                                  e,
                                  user._id,
                                  user.name,
                                  user.isActive
                                )
                              }
                              disabled={toggleStatus.isPending}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="mr-1 h-3.5 w-3.5 text-tomato" />
                                  Block
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-1 h-3.5 w-3.5 text-green-600" />
                                  Activate
                                </>
                              )}
                            </Button>
                          )}
                          <ChevronRight className="h-4 w-4 text-warm-gray" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
// src/apps/admin/pages/Users.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  UserCheck,
  UserX,
  RefreshCw,
  Users as UsersIcon,
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  Download,
  Eye,
  Mail,
  Phone,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Modal } from '@/components/ui/Modal'
import { AdminButton } from '@/components/ui/AdminButton'
import { useAdminUsers, useToggleUserStatus } from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const ROLE_FILTERS = [
  { id: 'all', label: 'All', icon: UsersIcon },
  { id: 'customer', label: 'Customers', icon: ShoppingBag },
  { id: 'restaurant', label: 'Restaurants', icon: Store },
  { id: 'delivery', label: 'Delivery', icon: Bike },
] as const

const STATUS_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: 'active', label: 'Active' },
  { id: 'blocked', label: 'Blocked' },
] as const

const VERIFICATION_FILTERS = [
  { id: 'all', label: 'Any' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'rejected', label: 'Rejected' },
] as const

const roleBadgeVariants: Record<string, any> = {
  customer: 'info',
  restaurant: 'success',
  delivery: 'warning',
  admin: 'danger',
}

const verificationVariants: Record<string, any> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
}

type SortKey = 'name' | 'createdAt'

// ============================================
// Helpers
// ============================================

function getVerification(user: any): string | undefined {
  const details =
    user.role === 'restaurant'
      ? user.restaurantDetails
      : user.role === 'delivery'
        ? user.deliveryDetails
        : null
  return details?.verificationStatus
}

function exportCsv(users: any[]) {
  const header = ['Name', 'Email', 'Phone', 'Role', 'Verification', 'Status', 'Joined']
  const rows = users.map((u) => [
    u.name,
    u.email,
    u.phone ?? '',
    u.role,
    getVerification(u) ?? '',
    u.isActive ? 'Active' : 'Blocked',
    new Date(u.createdAt).toISOString().slice(0, 10),
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Page
// ============================================

export function AdminUsers() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [role, setRole] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [verificationFilter, setVerificationFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [blockTarget, setBlockTarget] = useState<any | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, refetch, isRefetching } = useAdminUsers(role, search, page, 20)
  const toggleStatus = useToggleUserStatus()

  const users: any[] = data?.users ?? []
  const stats = data?.stats

  const visibleUsers = useMemo(() => {
    const list = users.filter((u) => {
      if (statusFilter === 'active' && !u.isActive) return false
      if (statusFilter === 'blocked' && u.isActive) return false
      if (verificationFilter !== 'all' && getVerification(u) !== verificationFilter)
        return false
      return true
    })
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a, b) =>
      sortKey === 'name'
        ? a.name.localeCompare(b.name) * dir
        : (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    )
  }, [users, statusFilter, verificationFilter, sortKey, sortDir])

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) + (verificationFilter !== 'all' ? 1 : 0)

  const selectableIds = visibleUsers.map((u) => u._id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id))

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    setPage(1)
    setSelected(new Set())
  }

  const toggleSelectOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatusFilter('all')
    setVerificationFilter('all')
    handleRoleChange('all')
  }

  const confirmToggle = () => {
    if (!blockTarget) return
    toggleStatus.mutate(blockTarget._id, {
      onSuccess: (result: any) => {
        showToast(
          'success',
          `${blockTarget.name} ${result.isActive ? 'activated' : 'blocked'} successfully`
        )
        setBlockTarget(null)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleExport = () => {
    const list = selected.size ? visibleUsers.filter((u) => selected.has(u._id)) : visibleUsers
    if (list.length === 0) return showToast('error', 'Nothing to export')
    exportCsv(list)
    showToast('success', `Exported ${list.length} users`)
  }

  const statCards = [
    { id: 'all', label: 'Total users', value: data?.total ?? 0, icon: UsersIcon, tint: 'bg-charcoal/5 text-charcoal', clickable: true },
    { id: 'customer', label: 'Customers', value: stats?.customers ?? 0, icon: ShoppingBag, tint: 'bg-blue-50 text-blue-600', clickable: true },
    { id: 'restaurant', label: 'Restaurants', value: stats?.restaurants ?? 0, icon: Store, tint: 'bg-green-50 text-green-600', clickable: true },
    { id: 'delivery', label: 'Delivery partners', value: stats?.delivery ?? 0, icon: Bike, tint: 'bg-amber-50 text-amber-600', clickable: true },
    { id: 'admin', label: 'Admins', value: stats?.admins ?? 0, icon: ShieldCheck, tint: 'bg-red-50 text-red-600', clickable: false },
  ]

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Users</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage customers, restaurants and delivery partners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {selected.size ? `Export (${selected.size})` : 'Export CSV'}
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statCards.map((s) => {
          const active = s.clickable && role === s.id
          return (
            <button
              key={s.id}
              type="button"
              disabled={!s.clickable}
              onClick={() => s.clickable && handleRoleChange(s.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-all',
                'disabled:cursor-default',
                active
                  ? 'border-tomato bg-tomato/[0.04] shadow-sm'
                  : 'border-charcoal/10',
                s.clickable && !active && 'hover:border-charcoal/20 hover:shadow-sm'
              )}
            >
              <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', s.tint)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-2xl font-bold leading-none text-charcoal">
                  {isLoading ? '–' : s.value}
                </p>
                <p className="mt-1.5 truncate text-xs text-warm-gray">{s.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl bg-beige/50 px-3.5 focus-within:bg-beige/80">
            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
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

          {/* Segmented role control */}
          <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl bg-beige/50 p-1">
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => handleRoleChange(f.id)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-all',
                  role === f.id
                    ? 'bg-white text-tomato shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                <f.icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            ))}
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

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3 border-t border-charcoal/10 pt-3">
            <FilterGroup
              label="Account status"
              options={STATUS_FILTERS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterGroup
              label="Verification"
              options={VERIFICATION_FILTERS}
              value={verificationFilter}
              onChange={setVerificationFilter}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setVerificationFilter('all')
                }}
                className="ml-auto pb-1.5 text-xs font-semibold text-tomato hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-charcoal px-4 py-2.5 text-cream">
          <p className="text-sm font-semibold">{selected.size} selected</p>
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={handleExport}
            >
              <Download className="h-3.5 w-3.5" />
              Export selected
            </AdminButton>
            <button
              onClick={() => setSelected(new Set())}
              className="px-2 text-xs font-semibold text-cream/80 hover:text-cream"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-charcoal/5" />
            ))}
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-charcoal/5">
              <UsersIcon className="h-6 w-6 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">No users found</p>
            <p className="mt-1 text-sm text-warm-gray">Try changing your search or filters.</p>
            <AdminButton variant="secondary" className="mt-5" onClick={clearFilters}>
              Clear all filters
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-beige/40 text-[11px] uppercase tracking-wider text-warm-gray">
                  <th className="w-12 py-3 pl-5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelected(allSelected ? new Set() : new Set(selectableIds))
                      }
                      className="h-4 w-4 accent-[#e63946]"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">
                    <SortButton
                      label="User"
                      active={sortKey === 'name'}
                      onClick={() => toggleSort('name')}
                    />
                  </th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Verification</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">
                    <SortButton
                      label="Joined"
                      active={sortKey === 'createdAt'}
                      onClick={() => toggleSort('createdAt')}
                    />
                  </th>
                  <th className="py-3 pl-3 pr-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => {
                  const verification = getVerification(user)
                  const isSelected = selected.has(user._id)

                  return (
                    <tr
                      key={user._id}
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className={cn(
                        'cursor-pointer border-b border-charcoal/5 transition-colors last:border-0 hover:bg-beige/30',
                        isSelected && 'bg-tomato/[0.04]'
                      )}
                    >
                      <td className="py-3 pl-5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(user._id)}
                          className="h-4 w-4 accent-[#e63946]"
                          aria-label={`Select ${user.name}`}
                        />
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold',
                              user.role === 'admin'
                                ? 'bg-tomato text-cream'
                                : 'bg-tomato/10 text-tomato'
                            )}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-charcoal">{user.name}</p>
                            <p className="truncate text-xs text-warm-gray">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="capitalize">
                          <Badge variant={roleBadgeVariants[user.role] || 'neutral'}>
                            {user.role}
                          </Badge>
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        {verification ? (
                          <span className="capitalize">
                            <Badge variant={verificationVariants[verification]}>
                              {verification}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-warm-gray">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                            user.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              user.isActive ? 'bg-green-500' : 'bg-red-500'
                            )}
                          />
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3 text-charcoal/80">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-3 pl-3 pr-5" onClick={(e) => e.stopPropagation()}>
                        {/* fixed 4 slots so icons always line up */}
                        <div className="ml-auto flex w-[136px] items-center justify-end gap-1">
                          <AdminButton
                            size="icon"
                            variant="ghost"
                            title="View details"
                            aria-label="View details"
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </AdminButton>
                          <AdminButton
                            size="icon"
                            variant="ghost"
                            title="Send email"
                            aria-label="Send email"
                            onClick={() => (window.location.href = `mailto:${user.email}`)}
                          >
                            <Mail className="h-4 w-4" />
                          </AdminButton>
                          {user.phone ? (
                            <AdminButton
                              size="icon"
                              variant="ghost"
                              title="Call"
                              aria-label="Call"
                              onClick={() => (window.location.href = `tel:${user.phone}`)}
                            >
                              <Phone className="h-4 w-4" />
                            </AdminButton>
                          ) : (
                            <span className="h-8 w-8" />
                          )}
                          {user.role !== 'admin' ? (
                            <AdminButton
                              size="icon"
                              variant="ghost"
                              title={user.isActive ? 'Block user' : 'Activate user'}
                              aria-label={user.isActive ? 'Block user' : 'Activate user'}
                              className={
                                user.isActive
                                  ? 'hover:bg-red-50 hover:text-red-600'
                                  : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                              }
                              onClick={() => setBlockTarget(user)}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </AdminButton>
                          ) : (
                            <span className="h-8 w-8" />
                          )}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 px-5 py-3">
            <p className="text-xs text-warm-gray">
              Page {data.page} of {data.totalPages} · {data.total} total
            </p>
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
                        p === page
                          ? 'bg-tomato text-cream'
                          : 'text-charcoal/70 hover:bg-beige'
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
          </div>
        )}
      </div>

      {/* Block / Activate modal */}
      <Modal
        isOpen={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        title={blockTarget?.isActive ? 'Block User' : 'Activate User'}
      >
        <p className="text-sm text-warm-gray">
          Are you sure you want to {blockTarget?.isActive ? 'block' : 'activate'}{' '}
          <strong className="text-charcoal">{blockTarget?.name}</strong>?
          {blockTarget?.isActive && ' They will not be able to log in.'}
        </p>
        <div className="mt-6 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            onClick={() => setBlockTarget(null)}
            className="flex-1"
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant={blockTarget?.isActive ? 'danger' : 'success'}
            size="md"
            onClick={confirmToggle}
            disabled={toggleStatus.isPending}
            className="flex-1"
          >
            {toggleStatus.isPending
              ? 'Processing...'
              : blockTarget?.isActive
                ? 'Block user'
                : 'Activate user'}
          </AdminButton>
        </div>
      </Modal>
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

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 uppercase tracking-wider hover:text-charcoal',
        active && 'text-charcoal'
      )}
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', active ? 'text-tomato' : 'text-charcoal/25')} />
    </button>
  )
}
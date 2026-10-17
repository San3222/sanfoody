// src/apps/admin/pages/RestaurantApprovals.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Store,
  MapPin,
  Star,
  BadgeCheck,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import {
  useAdminRestaurants,
  useVerifyRestaurant,
  useUnverifyRestaurant,
  useToggleRestaurantOpen,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'verified' | 'pending'

const PAGE_SIZE = 20
const num = (n: number) => (n || 0).toLocaleString('en-IN')

export function AdminRestaurantApprovals() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [filter, setFilter] = useState<FilterType>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // State for Custom Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const verifiedFilter = filter === 'all' ? undefined : filter === 'verified' ? 'true' : 'false'

  const { data, isLoading, refetch, isRefetching } = useAdminRestaurants(
    search,
    verifiedFilter as 'true' | 'false' | undefined,
    page,
    PAGE_SIZE
  ) as any
  const verify = useVerifyRestaurant()
  const unverify = useUnverifyRestaurant()
  const toggleOpen = useToggleRestaurantOpen()

  const restaurants: any[] = data?.restaurants ?? []
  const stats = data?.stats
  const verifiedCount = stats?.verified ?? 0
  const pendingCount = stats?.pending ?? 0
  const totalCount = verifiedCount + pendingCount

  const isSearching = search.length > 0

  // ---------- Handlers ----------
  const openOwner = (r: any) => {
    const ownerId = r.owner?._id
    if (ownerId) navigate(`/admin/users/${ownerId}`)
    else showToast('error', 'Owner information not available')
  }

  const handleVerify = (id: string, name: string) => {
    verify.mutate(id, {
      onSuccess: () => showToast('success', `${name} verified`),
      onError: (err: any) => showToast('error', err.message || 'Could not verify'),
    })
  }

  // Trigger Custom Modal
  const handleUnverifyClick = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, id, name })
  }

  // Actual API Call from Modal
  const confirmUnverify = () => {
    unverify.mutate(confirmModal.id, {
      onSuccess: () => {
        showToast('success', `${confirmModal.name} unverified`)
        setConfirmModal({ isOpen: false, id: '', name: '' }) // Close modal
      },
      onError: (err: any) => {
        showToast('error', err.message || 'Could not unverify')
      },
    })
  }

  const handleToggleOpen = (id: string, name: string) => {
    toggleOpen.mutate(id, {
      onSuccess: (result: any) => showToast('success', `${name} ${result.isOpen ? 'opened' : 'closed'}`),
      onError: (err: any) => showToast('error', err.message || 'Could not update status'),
    })
  }

  const clearAll = () => {
    setSearchInput('')
    setSearch('')
    setFilter('all')
    setPage(1)
  }

  return (
    <div className="pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Restaurant approvals</h1>
          <p className="mt-1 text-sm text-warm-gray">Review new restaurants and manage their status</p>
        </div>
        <ActionButton
          onClick={() => refetch()}
          disabled={isRefetching}
          label="Refresh"
          iconOnly
          icon={<RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />}
        />
      </div>

      {/* ================= Stats ================= */}
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile icon={Store} tone="bg-blue-100 text-blue-600" label="Total" value={num(totalCount)} loading={isLoading && !stats} />
        <StatTile icon={BadgeCheck} tone="bg-green-100 text-green-600" label="Verified" value={num(verifiedCount)} loading={isLoading && !stats} />
        <StatTile icon={Clock} tone="bg-gold/10 text-gold" label="Pending" value={num(pendingCount)} loading={isLoading && !stats} />
      </div>

      {/* ================= Pending banner ================= */}
      {pendingCount > 0 && filter !== 'pending' && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gold" />
            <p className="text-sm text-charcoal">
              <b>{pendingCount}</b> {pendingCount === 1 ? 'restaurant is' : 'restaurants are'} waiting for your review
            </p>
          </div>
          <button
            onClick={() => {
              setFilter('pending')
              setPage(1)
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-tomato px-4 text-sm font-semibold text-cream transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
          >
            Review now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================= Search + filters ================= */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 shadow-sm transition focus-within:border-tomato/60 focus-within:ring-2 focus-within:ring-tomato/20">
          <Search className="h-4 w-4 shrink-0 text-warm-gray" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by restaurant or owner name"
            className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal/40"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-warm-gray hover:bg-charcoal/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 gap-1 rounded-full bg-charcoal/5 p-1">
          {(
            [
              ['all', 'All', totalCount],
              ['verified', 'Verified', verifiedCount],
              ['pending', 'Pending', pendingCount],
            ] as [FilterType, string, number][]
          ).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key)
                setPage(1)
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
                filter === key ? 'bg-tomato text-cream shadow-sm' : 'text-charcoal/60 hover:text-charcoal'
              )}
            >
              {label}
              {stats && (
                <span
                  className={cn(
                    'grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold',
                    filter === key ? 'bg-white/25 text-cream' : 'bg-charcoal/10 text-charcoal/60'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= List ================= */}
      <div className="mt-5 space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="h-24 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : restaurants.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-charcoal/5">
              <Store className="h-8 w-8 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">
              {isSearching ? 'No matches found' : filter === 'pending' ? 'Nothing to review' : 'No restaurants yet'}
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-warm-gray">
              {isSearching
                ? `We couldn't find any restaurant for "${search}".`
                : filter === 'pending'
                  ? 'All restaurants have been reviewed. New applications will show up here.'
                  : 'Restaurants that sign up will appear here.'}
            </p>
            {(isSearching || filter !== 'all') && (
              <button
                onClick={clearAll}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-5 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
              >
                Clear filters
              </button>
            )}
          </Card>
        ) : (
          restaurants.map((r) => (
            <RestaurantCard
              key={r._id}
              restaurant={r}
              onOpenOwner={() => openOwner(r)}
              onVerify={() => handleVerify(r._id, r.name)}
              onUnverify={() => handleUnverifyClick(r._id, r.name)} // Passes ID to open modal
              onToggleOpen={() => handleToggleOpen(r._id, r.name)}
              verifying={verify.isPending && verify.variables === r._id}
              unverifying={unverify.isPending && unverify.variables === r._id}
              toggling={toggleOpen.isPending && toggleOpen.variables === r._id}
            />
          ))
        )}
      </div>

      {/* ================= Pagination ================= */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-warm-gray">
            Page {data.page} of {data.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} label="Previous">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </PageButton>
            <PageButton
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              label="Next"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </PageButton>
          </div>
        </div>
      )}

      {/* ================= CUSTOM CONFIRM MODAL ================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-charcoal">Unverify Restaurant?</h3>
              <p className="mt-2 text-sm text-warm-gray leading-relaxed">
                Are you sure you want to unverify <b className="text-charcoal">{confirmModal.name}</b>? 
                It will go back to pending status and customers may stop seeing it.
              </p>
            </div>
            
            <div className="mt-6 flex gap-3 w-full">
              <button
                onClick={() => setConfirmModal({ isOpen: false, id: '', name: '' })}
                disabled={unverify.isPending}
                className="flex-1 rounded-xl border border-charcoal/10 bg-white py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnverify}
                disabled={unverify.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-70"
              >
                {unverify.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Unverifying...
                  </>
                ) : (
                  'Yes, Unverify'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Restaurant card (Same Design)
// ============================================

function RestaurantCard({
  restaurant: r,
  onOpenOwner,
  onVerify,
  onUnverify,
  onToggleOpen,
  verifying,
  unverifying,
  toggling,
}: {
  restaurant: any
  onOpenOwner: () => void
  onVerify: () => void
  onUnverify: () => void
  onToggleOpen: () => void
  verifying: boolean
  unverifying: boolean
  toggling: boolean
}) {
  const [imgError, setImgError] = useState(false)
  const pending = !r.isVerified
  const rating = Number(r.rating)

  return (
    <Card className={cn('p-4 transition-shadow hover:shadow-warm sm:p-5', pending && 'ring-1 ring-gold/40')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Image */}
        <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-beige sm:h-24 sm:w-24">
          {r.image && !imgError ? (
            <img src={r.image} alt={r.name} onError={() => setImgError(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Store className="h-8 w-8 text-warm-gray" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-charcoal">{r.name}</h3>
            {pending ? (
              <Pill tone="bg-gold/15 text-charcoal">
                <Clock className="h-3 w-3 text-gold" />
                Pending review
              </Pill>
            ) : (
              <Pill tone="bg-green-100 text-green-700">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Pill>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-warm-gray">{r.description || 'No description provided'}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-warm-gray">
            {r.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {r.address}
              </span>
            )}
            {!Number.isNaN(rating) && r.rating != null && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                <b className="text-charcoal">{rating.toFixed(1)}</b>
                {r.reviewCount != null && <>({num(r.reviewCount)})</>}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {r.owner?.name || 'Owner not available'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-charcoal/10 pt-4 sm:w-44 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          {/* Open / closed switch */}
          <div className="flex items-center justify-between gap-3">
            <span className={cn('text-sm font-semibold', r.isOpen ? 'text-green-600' : 'text-warm-gray')}>
              {r.isOpen ? 'Open now' : 'Closed'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={!!r.isOpen}
              aria-label={`${r.name} is ${r.isOpen ? 'open' : 'closed'}. Toggle`}
              onClick={onToggleOpen}
              disabled={toggling}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:opacity-50',
                r.isOpen ? 'bg-green-500' : 'bg-charcoal/20'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                  r.isOpen ? 'translate-x-[22px]' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          {pending ? (
            <button
              onClick={onVerify}
              disabled={verifying}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {verifying ? 'Verifying…' : 'Verify'}
            </button>
          ) : (
            <button
              onClick={onUnverify}
              disabled={unverifying}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
            >
              {unverifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              {unverifying ? 'Updating…' : 'Unverify'}
            </button>
          )}

          <button
            onClick={onOpenOwner}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white px-4 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
          >
            <User className="h-4 w-4" />
            View owner
          </button>
        </div>
      </div>
    </Card>
  )
}

// ============================================
// Small components
// ============================================

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', tone)}>
      {children}
    </span>
  )
}

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
  loading,
}: {
  icon: React.ElementType
  tone: string
  label: string
  value: string
  loading: boolean
}) {
  return (
    <Card className="p-4">
      <div className={cn('grid h-9 w-9 place-items-center rounded-xl', tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-charcoal">
        {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-charcoal/10 align-middle" /> : value}
      </p>
      <p className="text-xs text-warm-gray">{label}</p>
    </Card>
  )
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-charcoal/15 bg-white px-4 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  iconOnly,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-charcoal/15 bg-white text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        iconOnly ? 'w-10' : 'px-4'
      )}
    >
      {icon}
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
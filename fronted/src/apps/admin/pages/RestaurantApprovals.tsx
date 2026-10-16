// src/apps/admin/pages/RestaurantApprovals.tsx
import { useState } from 'react'
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Store,
  MapPin,
  Star,
  Eye,
  EyeOff,
  BadgeCheck,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useNavigate } from 'react-router-dom'
import {
  useAdminRestaurants,
  useVerifyRestaurant,
  useUnverifyRestaurant,
  useToggleRestaurantOpen,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'verified' | 'pending'

export function AdminRestaurantApprovals() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const verifiedFilter =
    filter === 'all' ? undefined : filter === 'verified' ? 'true' : 'false'

  const { data, isLoading, refetch, isRefetching } = useAdminRestaurants(
    search,
    verifiedFilter as 'true' | 'false' | undefined,
    page,
    20
  )
  const verify = useVerifyRestaurant()
  const unverify = useUnverifyRestaurant()
  const toggleOpen = useToggleRestaurantOpen()
  const { showToast } = useToast()

  const restaurants = data?.restaurants ?? []
  const stats = data?.stats

  // 🔥 Click card → owner detail page
  const handleCardClick = (restaurant: any) => {
    const ownerId = restaurant.owner?._id
    if (ownerId) {
      navigate(`/admin/users/${ownerId}`)
    } else {
      showToast('error', 'Owner information not available')
    }
  }

  const handleVerify = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    verify.mutate(id, {
      onSuccess: () => showToast('success', `${name} verified`),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleUnverify = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!confirm(`Unverify ${name}?`)) return
    unverify.mutate(id, {
      onSuccess: () => showToast('success', `${name} unverified`),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleToggleOpen = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    toggleOpen.mutate(id, {
      onSuccess: (result) => {
        showToast('success', `${name} ${result.isOpen ? 'opened' : 'closed'}`)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">
            Restaurant Approvals
          </h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage restaurant verifications · Click any card to view owner details
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

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-charcoal">
                  {stats.verified}
                </p>
                <p className="text-sm text-warm-gray">Verified</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-charcoal">
                  {stats.pending}
                </p>
                <p className="text-sm text-warm-gray">Pending Verification</p>
              </div>
            </div>
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search restaurants..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'verified', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setPage(1)
              }}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors',
                filter === f
                  ? 'bg-tomato text-cream'
                  : 'bg-white text-charcoal/70 hover:bg-beige'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-24 animate-pulse rounded-xl bg-charcoal/5" />
            </Card>
          ))
        ) : restaurants.length === 0 ? (
          <Card className="p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm text-warm-gray">No restaurants found</p>
          </Card>
        ) : (
          restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              onClick={() => handleCardClick(restaurant)}
            >
              <Card className="cursor-pointer p-5 transition-all hover:border-tomato/30 hover:shadow-warm">
                <div className="flex flex-wrap items-start gap-4">
                {/* Image */}
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-charcoal">
                      {restaurant.name}
                    </h3>
                    {restaurant.isVerified ? (
                      <Badge variant="success">
                        <span className="flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      </Badge>
                    )}
                    <Badge variant={restaurant.isOpen ? 'success' : 'neutral'}>
                      {restaurant.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm text-warm-gray line-clamp-1">
                    {restaurant.description}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-warm-gray">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {restaurant.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      {restaurant.rating} ({restaurant.reviewCount} reviews)
                    </span>
                    <span className="font-medium text-charcoal">
                      Owner: {restaurant.owner?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex flex-wrap items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) =>
                      handleToggleOpen(e, restaurant._id, restaurant.name)
                    }
                    disabled={toggleOpen.isPending}
                  >
                    {restaurant.isOpen ? (
                      <>
                        <EyeOff className="mr-1 h-3.5 w-3.5" />
                        Close
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        Open
                      </>
                    )}
                  </Button>

                  {!restaurant.isVerified ? (
                    <Button
                      size="sm"
                      onClick={(e) =>
                        handleVerify(e, restaurant._id, restaurant.name)
                      }
                      disabled={verify.isPending}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Verify
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) =>
                        handleUnverify(e, restaurant._id, restaurant.name)
                      }
                      disabled={unverify.isPending}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5 text-tomato" />
                      Unverify
                    </Button>
                  )}

                  <ChevronRight className="hidden h-4 w-4 text-warm-gray sm:block" />
                </div>
                </div>
              </Card>
            </div>
          ))
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-warm-gray">
              Page {data.page} of {data.totalPages}
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
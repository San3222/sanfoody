// src/apps/restaurant/pages/Reviews.tsx
import { useState, useMemo } from 'react'
import { Star, MessageSquare, RefreshCw, Quote, User as UserIcon } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { useRestaurantReviews, useRestaurantStats } from '@/api/restaurantHooks'
import { cn } from '@/lib/utils'

export function RestaurantReviews() {
    const [page, setPage] = useState(1)
    const { data, isLoading, refetch, isRefetching } = useRestaurantReviews(page, 10)
    const { data: stats } = useRestaurantStats()

    const reviews = data?.reviews ?? []
    const totalPages = data?.totalPages ?? 0

    // Rating breakdown (1-5 stars count)
    const ratingBreakdown = useMemo(() => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviews.forEach((r) => {
            const star = Math.min(Math.max(Math.round(r.rating), 1), 5)
            breakdown[star as keyof typeof breakdown]++
        })
        return breakdown
    }, [reviews])

    const avgRating = stats?.reviews?.averageRating ?? 0
    const totalReviews = stats?.reviews?.totalReviews ?? 0

    // Calculate percentages for the breakdown bars
    const totalLoadedReviews = reviews.length

    return (
        <div className="pb-12">
            {/* 🔥 Header & Refresh Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Reviews</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''} from your customers
                    </p>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white px-5 text-sm font-semibold text-charcoal shadow-sm transition-all hover:border-charcoal/30 hover:bg-charcoal/5 disabled:opacity-60"
                >
                    <RefreshCw className={cn('h-4 w-4 text-warm-gray transition-colors group-hover:text-charcoal', isRefetching && 'animate-spin')} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* 🔥 Rating Summary & Breakdown */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Big rating card */}
                <Card className="flex flex-col items-center justify-center p-8 text-center bg-linear-to-b from-white to-beige/30">
                    <p className="font-display text-6xl font-extrabold text-charcoal tracking-tighter">
                        {avgRating.toFixed(1)}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    'h-6 w-6',
                                    star <= Math.round(avgRating)
                                        ? 'fill-gold text-gold'
                                        : 'fill-charcoal/5 text-charcoal/10'
                                )}
                            />
                        ))}
                    </div>
                    <p className="mt-3 text-sm font-medium text-warm-gray">
                        Based on {totalReviews} verified review{totalReviews !== 1 ? 's' : ''}
                    </p>
                </Card>

                {/* Rating breakdown */}
                <Card className="col-span-1 lg:col-span-2 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-lg font-bold text-charcoal">
                            Rating Breakdown
                        </h3>
                        <span className="text-xs font-semibold text-warm-gray">
                            Last 10 reviews shown
                        </span>
                    </div>

                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingBreakdown[star as keyof typeof ratingBreakdown]
                            const pct = totalLoadedReviews > 0 ? (count / totalLoadedReviews) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <span className="flex w-12 shrink-0 items-center gap-1.5 text-sm font-semibold text-charcoal">
                                        {star} <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                                    </span>

                                    {/* Progress Bar Container */}
                                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-charcoal/5">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out",
                                                star >= 4 ? "bg-fresh-green" : star === 3 ? "bg-gold" : "bg-tomato"
                                            )}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>

                                    <span className="w-8 shrink-0 text-right text-sm font-medium text-warm-gray">
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* 🔥 Reviews List */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-tomato" />
                        All Reviews
                    </h2>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-6">
                                <div className="flex gap-4">
                                    <div className="h-12 w-12 animate-pulse rounded-full bg-charcoal/5" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-1/4 animate-pulse rounded bg-charcoal/5" />
                                        <div className="h-4 w-full animate-pulse rounded bg-charcoal/5" />
                                        <div className="h-4 w-2/3 animate-pulse rounded bg-charcoal/5" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center border-dashed border-2 border-charcoal/10 p-16 text-center shadow-none">
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-beige mb-4">
                            <MessageSquare className="h-10 w-10 text-charcoal/20" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-charcoal">No reviews yet</h3>
                        <p className="mt-1 text-sm text-warm-gray max-w-sm">
                            Customer reviews and ratings will appear here automatically once they receive their orders.
                        </p>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review._id} className="p-6 transition-all hover:shadow-warm group">
                                    {/* Top row: User Info & Stars */}
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            {review.userId?.avatar ? (
                                                <img
                                                    src={review.userId.avatar}
                                                    alt={review.userId.name}
                                                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-beige"
                                                />
                                            ) : (
                                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tomato/10 text-lg font-bold text-tomato ring-2 ring-beige">
                                                    {review.userId?.name?.charAt(0)?.toUpperCase() || <UserIcon className="h-5 w-5" />}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-charcoal text-base">
                                                    {review.userId?.name || 'Anonymous'}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={cn(
                                                                    'h-3.5 w-3.5',
                                                                    star <= review.rating
                                                                        ? 'fill-gold text-gold'
                                                                        : 'fill-charcoal/5 text-charcoal/10'
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-warm-gray font-medium">
                                                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <div className="mt-4 relative pl-6">
                                        {/* Decorative Quote Mark */}
                                        <Quote className="absolute left-0 top-0 h-5 w-5 text-tomato/20 -scale-x-100" />

                                        {review.title && (
                                            <h3 className="font-display font-bold text-charcoal text-base mb-1">
                                                {review.title}
                                            </h3>
                                        )}
                                        <p className="text-sm leading-relaxed text-warm-gray">
                                            {review.comment}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-charcoal/10 pt-4">
                                <p className="text-sm text-warm-gray font-medium">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="bg-white"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="bg-white"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
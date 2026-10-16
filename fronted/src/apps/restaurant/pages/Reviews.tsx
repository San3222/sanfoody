// src/apps/restaurant/pages/Reviews.tsx
import { useState, useMemo } from 'react'
import { Star, MessageSquare, RefreshCw, ThumbsUp } from 'lucide-react'
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

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">Reviews</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''} from your customers
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

            {/* Rating Summary */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Big rating */}
                <Card className="flex flex-col items-center justify-center p-6">
                    <p className="font-display text-5xl font-extrabold text-charcoal">
                        {avgRating.toFixed(1)}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    'h-5 w-5',
                                    star <= Math.round(avgRating)
                                        ? 'fill-gold text-gold'
                                        : 'text-charcoal/20'
                                )}
                            />
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-warm-gray">
                        Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </p>
                </Card>

                {/* Rating breakdown */}
                <Card className="col-span-2 p-6">
                    <h3 className="mb-4 font-display text-base font-bold text-charcoal">
                        Rating Breakdown
                    </h3>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingBreakdown[star as keyof typeof ratingBreakdown]
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="flex w-10 shrink-0 items-center gap-1 text-sm font-semibold text-charcoal">
                                        {star} <Star className="h-3 w-3 fill-gold text-gold" />
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal/5">
                                        <div
                                            className="h-full rounded-full bg-linear-to-r from-tomato to-orange transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-warm-gray">
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Reviews List */}
            <div className="mt-6">
                <h2 className="mb-4 font-display text-lg font-bold text-charcoal">
                    All Reviews
                </h2>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-5">
                                <div className="h-20 animate-pulse rounded-xl bg-charcoal/5" />
                            </Card>
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <Card className="p-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-charcoal/20" />
                        <p className="mt-3 text-sm text-warm-gray">No reviews yet</p>
                        <p className="text-xs text-warm-gray">
                            Customer reviews will appear here after they order
                        </p>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <Card key={review._id} className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            {review.userId?.avatar ? (
                                                <img
                                                    src={review.userId.avatar}
                                                    alt={review.userId.name}
                                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato/10 font-bold text-tomato">
                                                    {review.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-charcoal">
                                                    {review.userId?.name || 'Anonymous'}
                                                </p>
                                                <div className="mt-0.5 flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={cn(
                                                                    'h-3 w-3',
                                                                    star <= review.rating
                                                                        ? 'fill-gold text-gold'
                                                                        : 'text-charcoal/20'
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-warm-gray">
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

                                    {review.title && (
                                        <h3 className="mt-3 font-semibold text-charcoal">{review.title}</h3>
                                    )}
                                    <p className="mt-1.5 text-sm leading-relaxed text-warm-gray">
                                        {review.comment}
                                    </p>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-xs text-warm-gray">
                                    Page {page} of {totalPages}
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
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
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
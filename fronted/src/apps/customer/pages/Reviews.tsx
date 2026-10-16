import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Star, Send, User, Calendar, ThumbsUp, Flag, X, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { cn } from '@/lib/utils'

interface Review {
    id: string
    userId: string
    userName: string
    userAvatar: string
    rating: number
    title: string
    comment: string
    images?: string[]
    createdAt: string
    likes: number
    likedBy: string[]
    restaurantId: string
    restaurantName: string
    dishId?: string
    dishName?: string
}

interface ReviewFormData {
    rating: number
    title: string
    comment: string
}

export function Reviews() {
    const { restaurantId, dishId } = useParams<{ restaurantId?: string; dishId?: string }>()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [reviews, setReviews] = useState<Review[]>([])
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [editingReview, setEditingReview] = useState<Review | null>(null)
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: 0,
        title: '',
        comment: ''
    })
    const [hoverRating, setHoverRating] = useState(0)
    const [loading, setLoading] = useState(true)

    // Load reviews from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('sanfoody:reviews')
        if (stored) {
            setReviews(JSON.parse(stored))
        } else {
            // Sample reviews
            const sampleReviews: Review[] = [
                {
                    id: 'rev-001',
                    userId: '1',
                    userName: 'Ananya Rao',
                    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                    rating: 5,
                    title: 'Absolutely delicious!',
                    comment: 'The butter chicken was phenomenal. Perfectly spiced and the naan was fresh and fluffy. Will definitely order again!',
                    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                    likes: 12,
                    likedBy: ['2', '3'],
                    restaurantId: 'bombay-bistro',
                    restaurantName: 'The Bombay Bistro'
                },
                {
                    id: 'rev-002',
                    userId: '2',
                    userName: 'Kabir Malhotra',
                    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                    rating: 4,
                    title: 'Great food, slow delivery',
                    comment: 'The food quality is top notch but delivery took longer than expected. Still worth the wait though!',
                    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                    likes: 5,
                    likedBy: ['1'],
                    restaurantId: 'bombay-bistro',
                    restaurantName: 'The Bombay Bistro'
                },
                {
                    id: 'rev-003',
                    userId: '3',
                    userName: 'Priya Nair',
                    userAvatar: 'https://randomuser.me/api/portraits/women/68.jpg',
                    rating: 5,
                    title: 'Best sushi in town!',
                    comment: 'The salmon sushi platter was fresh and beautifully presented. The dragon roll is a must-try!',
                    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                    likes: 18,
                    likedBy: ['1', '2', '4'],
                    restaurantId: 'sakura-house',
                    restaurantName: 'Sakura House',
                    dishId: 'sh-salmon-platter',
                    dishName: 'Salmon Sushi Platter'
                }
            ]
            setReviews(sampleReviews)
            localStorage.setItem('sanfoody:reviews', JSON.stringify(sampleReviews))
        }
        setLoading(false)
    }, [])

    // Filter reviews by restaurant or dish
    const filteredReviews = reviews.filter(r => {
        if (restaurantId && r.restaurantId === restaurantId) return true
        if (dishId && r.dishId === dishId) return true
        if (!restaurantId && !dishId) return true
        return false
    })

    const sortedReviews = [...filteredReviews].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const averageRating = filteredReviews.length > 0
        ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
        : 0

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
        const count = filteredReviews.filter(r => r.rating === stars).length
        return { stars, count, percentage: filteredReviews.length > 0 ? (count / filteredReviews.length) * 100 : 0 }
    })

    const handleSubmitReview = () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } })
            return
        }

        if (formData.rating === 0) {
            alert('Please select a rating')
            return
        }

        const newReview: Review = {
            id: `rev-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=orange&color=fff`,
            rating: formData.rating,
            title: formData.title || 'Great experience!',
            comment: formData.comment,
            createdAt: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            restaurantId: restaurantId || 'bombay-bistro',
            restaurantName: 'The Bombay Bistro'
        }

        const updatedReviews = [newReview, ...reviews]
        setReviews(updatedReviews)
        localStorage.setItem('sanfoody:reviews', JSON.stringify(updatedReviews))
        setShowReviewForm(false)
        setFormData({ rating: 0, title: '', comment: '' })
    }

    const handleLike = (reviewId: string) => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } })
            return
        }

        const updatedReviews = reviews.map(r => {
            if (r.id === reviewId) {
                const liked = r.likedBy.includes(user.id)
                return {
                    ...r,
                    likes: liked ? r.likes - 1 : r.likes + 1,
                    likedBy: liked ? r.likedBy.filter(id => id !== user.id) : [...r.likedBy, user.id]
                }
            }
            return r
        })
        setReviews(updatedReviews)
        localStorage.setItem('sanfoody:reviews', JSON.stringify(updatedReviews))
    }

    const handleDeleteReview = (reviewId: string) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            const updatedReviews = reviews.filter(r => r.id !== reviewId)
            setReviews(updatedReviews)
            localStorage.setItem('sanfoody:reviews', JSON.stringify(updatedReviews))
        }
    }

    const StarRating = ({ rating, size = 'md', interactive = false, onRatingChange, onHoverChange }: {
        rating: number
        size?: 'sm' | 'md' | 'lg'
        interactive?: boolean
        onRatingChange?: (rating: number) => void
        onHoverChange?: (rating: number) => void
    }) => {
        const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }
        const sizeClass = sizes[size]

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onRatingChange?.(star)}
                        onMouseEnter={() => interactive && onHoverChange?.(star)}
                        onMouseLeave={() => interactive && onHoverChange?.(0)}
                        disabled={!interactive}
                        className={cn(
                            'transition-colors',
                            interactive && 'cursor-pointer hover:scale-110',
                            !interactive && 'cursor-default'
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClass,
                                star <= (hoverRating || rating)
                                    ? 'fill-gold text-gold'
                                    : 'text-charcoal/20'
                            )}
                        />
                    </button>
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
                    <div className="h-32 rounded-3xl bg-charcoal/8"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-3xl bg-charcoal/8"></div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                            Reviews & Ratings
                        </h1>
                        {restaurantId && (
                            <p className="mt-1 text-sm text-warm-gray">
                                {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} for this restaurant
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="rounded-full bg-gradient-to-r from-tomato to-orange px-6 py-2.5 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Write a Review
                    </button>
                </div>

                {/* Rating Summary */}
                {filteredReviews.length > 0 && (
                    <div className="mb-8 rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-center sm:text-left">
                                <p className="font-display text-5xl font-extrabold text-charcoal">
                                    {averageRating.toFixed(1)}
                                </p>
                                <StarRating rating={Math.round(averageRating)} size="md" />
                                <p className="mt-1 text-sm text-warm-gray">
                                    Based on {filteredReviews.length} reviews
                                </p>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                {ratingDistribution.map(({ stars, count, percentage }) => (
                                    <div key={stars} className="flex items-center gap-3">
                                        <span className="w-8 text-sm text-charcoal/70">{stars}★</span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal/10">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-gold to-orange"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right text-sm text-warm-gray">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Form */}
                <AnimatePresence>
                    {showReviewForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8 overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft"
                        >
                            <div className="border-b border-charcoal/10 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-display text-lg font-bold text-charcoal">
                                        {editingReview ? 'Edit Your Review' : 'Write a Review'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowReviewForm(false)
                                            setEditingReview(null)
                                            setFormData({ rating: 0, title: '', comment: '' })
                                        }}
                                        className="text-warm-gray hover:text-tomato"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Rating</label>
                                    <StarRating
                                        rating={formData.rating}
                                        size="lg"
                                        interactive
                                        onRatingChange={(r) => setFormData({ ...formData, rating: r })}
                                        onHoverChange={(r) => setHoverRating(r)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Summarize your experience"
                                        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Comment</label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        placeholder="Share your experience in detail..."
                                        rows={4}
                                        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmitReview}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Send className="h-4 w-4" />
                                    {editingReview ? 'Update Review' : 'Submit Review'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews List */}
                {sortedReviews.length === 0 ? (
                    <div className="rounded-3xl border border-charcoal/5 bg-white p-12 text-center shadow-soft">
                        <Star className="mx-auto h-12 w-12 text-charcoal/20" strokeWidth={1.5} />
                        <h3 className="mt-4 font-display text-xl font-bold text-charcoal">No reviews yet</h3>
                        <p className="mt-1 text-warm-gray">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedReviews.map((review, index) => {
                            const isOwnReview = user?.id === review.userId
                            return (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft transition-shadow hover:shadow-warm"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={review.userAvatar}
                                                alt={review.userName}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <p className="font-semibold text-charcoal">{review.userName}</p>
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-xs text-warm-gray">
                                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {isOwnReview && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingReview(review)
                                                        setFormData({
                                                            rating: review.rating,
                                                            title: review.title,
                                                            comment: review.comment
                                                        })
                                                        setShowReviewForm(true)
                                                    }}
                                                    className="rounded-full p-1.5 text-charcoal/40 transition-colors hover:bg-charcoal/5 hover:text-tomato"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="rounded-full p-1.5 text-charcoal/40 transition-colors hover:bg-charcoal/5 hover:text-tomato"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="mt-2 font-display text-base font-bold text-charcoal">
                                        {review.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-charcoal/80">{review.comment}</p>

                                    {review.dishName && (
                                        <p className="mt-2 text-xs font-medium text-tomato">
                                            Dish: {review.dishName}
                                        </p>
                                    )}

                                    <div className="mt-3 flex items-center gap-4">
                                        <button
                                            onClick={() => handleLike(review.id)}
                                            className={cn(
                                                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                                                review.likedBy.includes(user?.id || '')
                                                    ? 'bg-tomato/10 text-tomato'
                                                    : 'bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10'
                                            )}
                                        >
                                            <ThumbsUp className={cn(
                                                'h-4 w-4',
                                                review.likedBy.includes(user?.id || '') && 'fill-tomato text-tomato'
                                            )} />
                                            {review.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-charcoal/40 transition-colors hover:bg-charcoal/5 hover:text-charcoal/60">
                                            <Flag className="h-4 w-4" />
                                            Report
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </motion.div>
        </section>
    )
}
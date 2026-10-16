import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useToast } from '@/context/ToastContext'
import {
  BadgeCheck,
  Bike,
  Calendar,
  Clock,
  Heart,
  Leaf,
  MapPin,
  Package,
  Star,
  ThumbsUp,
  MessageSquare,
  Filter,
  X,
  Pencil,
  Trash2,
  Trophy,
  Check,
} from 'lucide-react'
import { useFavorites } from '@/context/useFavorites'
import { FoodCard } from '@/apps/customer/components/FoodCard'
import { BookTableModal } from '@/apps/customer/components/restaurants/BookTableModal'
import { cn } from '@/lib/utils'
import { useRestaurant, useRestaurantMenu, useRestaurantReviews, useCreateReview, useUpdateReview, useDeleteReview, useOffersByRestaurant } from '@/api/Hooks'
import { useAuth } from '@/context/useAuth'

const TABS = ['Overview', 'Menu', 'Photos', 'Reviews', 'Offers'] as const
type Tab = (typeof TABS)[number]

const COURSE_ORDER = ['Starters', 'Main Course', 'Desserts', 'Beverages'] as const

const RATING_TAGS = [
  { label: 'Great Food', min: 4.5 },
  { label: 'Good Service', min: 4.0 },
  { label: 'Value for Money', min: 3.5 },
  { label: 'Quick Delivery', min: 4.0 },
  { label: 'Ambience', min: 4.5 },
]

const REVIEW_SORT_OPTIONS = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'rating-desc', label: 'Highest Rated' },
  { id: 'rating-asc', label: 'Lowest Rated' },
]

export function RestaurantDetail() {
  const { restaurantId } = useParams<{ restaurantId: string }>()
  const { user } = useAuth()
  const { showToast } = useToast() 
  const { data: restaurant, isLoading, isError } = useRestaurant(restaurantId)
  const { data: menuItems, isLoading: menuLoading } = useRestaurantMenu(restaurantId)
  const { data: reviewsData, isLoading: reviewsLoading } = useRestaurantReviews(restaurantId)
  const { data: offers, isLoading: offersLoading } = useOffersByRestaurant(restaurantId)
  const createReview = useCreateReview()
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const [tab, setTab] = useState<Tab>('Overview')
  const [bookingOpen, setBookingOpen] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewFilter, setReviewFilter] = useState<number | null>(null)
  const [reviewSort, setReviewSort] = useState('recent')
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())
  const favorited = isFavorite(`restaurant:${restaurant?._id || restaurant?.id}`)

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-64 rounded-3xl bg-charcoal/8"></div>
          <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
          <div className="h-64 rounded-3xl bg-charcoal/8"></div>
        </div>
      </section>
    )
  }

  if (isError || !restaurant) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <p className="text-warm-gray">Couldn't load restaurant. Please try again.</p>
      </section>
    )
  }


  // Group menu items by course
  const menuByCourse = COURSE_ORDER.map((course) => ({
    course,
    items: (menuItems || []).filter((item: any) => item.category === course),
  })).filter((group) => group.items.length > 0)

  // Filtered and sorted reviews
  const filteredReviews = reviewsData?.reviews?.filter((review) =>
    reviewFilter === null || review.rating === reviewFilter
  ) || []

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewSort === 'rating-desc') return b.rating - a.rating
    if (reviewSort === 'rating-asc') return a.rating - b.rating
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewsData?.reviews?.filter((r) => r.rating === star).length || 0
    const total = reviewsData?.total || 1
    const percentage = (count / total) * 100
    return { star, count, percentage }
  })

  // 🔥 Edit Review Handler
  const handleEditReview = (review: any) => {
    setEditingReview(review)
    setRating(review.rating)
    setReviewTitle(review.title)
    setReviewComment(review.comment)
    setShowReviewForm(true)
  }

  // 🔥 Delete Review Handler
  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReview.mutate(reviewId, {
        onSuccess: () => {
          showToast('success', 'Review deleted successfully!')
        }
      })
    }
  }

  const handleSubmitReview = () => {
    if (!rating || !reviewTitle.trim() || !reviewComment.trim()) {
       showToast('error', 'Please fill all fields') 
      return
    }

    if (editingReview) {
      // Update existing review
      updateReview.mutate({
        id: editingReview._id,
        data: { rating, title: reviewTitle, comment: reviewComment },
      }, {
        onSuccess: () => {
          setShowReviewForm(false)
          setEditingReview(null)
          setRating(0)
          setReviewTitle('')
          setReviewComment('')
          showToast('success', 'Review updated successfully!') 
        }
      })
    } else {
      // Create new review
      createReview.mutate({
        restaurantId: restaurantId as string,
        rating,
        title: reviewTitle,
        comment: reviewComment,
      }, {
        onSuccess: () => {
          setShowReviewForm(false)
          setRating(0)
          setReviewTitle('')
          setReviewComment('')
          showToast('success', 'Review submitted successfully!') 
        }
      })
    }
  }

  const handleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const next = new Set(prev)
      if (next.has(reviewId)) next.delete(reviewId)
      else next.add(reviewId)
      return next
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="relative h-64 sm:h-80">
        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
        {restaurant.offerLabel && (
          <span className="absolute left-5 top-24 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream shadow-soft sm:top-28">
            🔥 {restaurant.offerLabel}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite(`restaurant:${restaurant?._id || restaurant?.id}`)}
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={favorited}
          className="absolute right-5 top-24 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-charcoal/70 shadow-soft backdrop-blur-sm transition-transform hover:scale-110 sm:top-28"
        >
          <Heart className={cn('h-5 w-5', favorited && 'fill-tomato text-tomato')} />
        </button>

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-6 sm:px-8">
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-cream sm:text-4xl">
            {restaurant.name}
            {restaurant.verified && (
              <BadgeCheck className="h-6 w-6 shrink-0 text-orange" aria-label="Verified restaurant" />
            )}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-cream/90">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {restaurant.rating} ({restaurant.reviewCount.toLocaleString('en-IN')} Reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {restaurant.area || 'Mumbai'}, {restaurant.city || 'Mumbai'}
            </span>
            <span>
              🍛 {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' • ') : restaurant.cuisine || ''}
            </span>
            <span>
              {restaurant.priceRange} · ₹{restaurant.priceForTwo || 500} for two
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-b border-charcoal/10 bg-cream/95 px-5 py-4 backdrop-blur-sm sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setTab('Menu')}
            className="rounded-full bg-linear-to-r from-tomato to-orange px-6 py-2.5 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Order Now
          </button>
          {restaurant.hasTableBooking && (
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-charcoal/15 px-6 py-2.5 text-sm font-bold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato"
            >
              <Calendar className="h-4 w-4" />
              Book Table
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleFavorite(restaurant.id)}
            aria-pressed={favorited}
            className="flex items-center gap-1.5 rounded-full border border-charcoal/15 px-6 py-2.5 text-sm font-bold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato"
          >
            <Heart className={cn('h-4 w-4', favorited && 'fill-tomato text-tomato')} />
            {favorited ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 border-b border-charcoal/10 bg-cream/95 backdrop-blur-sm">
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={cn(
                'shrink-0 border-b-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                tab === t
                  ? 'border-tomato text-tomato'
                  : 'border-transparent text-charcoal/60 hover:text-charcoal',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Overview Tab */}
        {tab === 'Overview' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-2 font-display text-lg font-bold text-charcoal">About</h2>
              <p className="text-warm-gray">
                {restaurant.name} serves {(Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(' and ') : restaurant.cuisine || '')} cuisine in {restaurant.area || 'Mumbai'}. Rated{' '}
                {restaurant.rating} by {restaurant.reviewCount.toLocaleString('en-IN')} diners, it&rsquo;s known
                for a menu that balances comfort classics with a few signature specials.
              </p>

              <h2 className="mb-3 mt-8 font-display text-lg font-bold text-charcoal">Highlights</h2>
              <div className="flex flex-wrap gap-2">
                {(restaurant.features || []).map((feature: string) => (
                  <span
                    key={feature}
                    className="rounded-full bg-beige px-3.5 py-1.5 text-sm font-medium text-charcoal/80"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <h2 className="mb-3 mt-8 font-display text-lg font-bold text-charcoal">Amenities</h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <AmenityItem icon={Bike} label="Delivery" active={restaurant.hasDelivery} />
                <AmenityItem icon={Package} label="Takeaway" active={restaurant.hasTakeaway} />
                <AmenityItem icon={Calendar} label="Table booking" active={restaurant.hasTableBooking} />
                <AmenityItem icon={Leaf} label="Pure veg" active={restaurant.isVeg} />
              </ul>
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg font-bold text-charcoal">Opening Hours</h2>
              <div className="rounded-2xl border border-charcoal/10 bg-white p-5">
                <p
                  className={cn(
                    'flex items-center gap-2 text-sm font-semibold',
                    restaurant.isOpen ? 'text-fresh-green' : 'text-tomato',
                  )}
                >
                  <span
                    className={cn('h-2 w-2 rounded-full', restaurant.isOpen ? 'bg-fresh-green' : 'bg-tomato')}
                  />
                  {restaurant.is24Hours ? 'Open 24 hours' : restaurant.isOpen ? 'Open now' : 'Closed now'}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-warm-gray">
                  <Clock className="h-4 w-4" />
                  {restaurant.is24Hours ? 'Always open' : `Closes ${restaurant.closesAt || '10:00 PM'} daily`}
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-warm-gray">
                  <MapPin className="h-4 w-4" />
                  {restaurant.area || 'Mumbai'}, {restaurant.city || 'Mumbai'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Menu Tab */}
        {tab === 'Menu' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {menuLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-3xl bg-charcoal/8 animate-pulse" />
                ))}
              </div>
            ) : menuByCourse.length === 0 ? (
              <p className="py-12 text-center text-warm-gray">This menu is being updated. Please check back soon.</p>
            ) : (
              <div className="space-y-12">
                {menuByCourse.map((group) => (
                  <div key={group.course} className="mb-12 last:mb-0">
                    <h2 className="mb-5 font-display text-xl font-bold text-charcoal">{group.course}</h2>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                      {group.items.map((item) => (
                        <FoodCard key={item.id} food={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Photos Tab */}
        {tab === 'Photos' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          >
            {[
              { label: 'Food', src: (menuItems && menuItems[0]?.image) || restaurant.image },
              { label: 'Interior', src: restaurant.image },
              { label: 'Exterior', src: (menuItems && menuItems[1]?.image) || restaurant.image },
              { label: 'Food', src: (menuItems && menuItems[2]?.image) || restaurant.image },
              { label: 'Interior', src: restaurant.image },
              { label: 'Food', src: (menuItems && menuItems[3]?.image) || restaurant.image },
            ].map((photo, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl">
                <img
                  src={photo.src}
                  alt={`${photo.label} at ${restaurant.name}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-charcoal/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                  {photo.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {tab === 'Reviews' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
              {/* Rating Summary */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-charcoal/10 bg-white p-6">
                  <div className="text-center">
                    <p className="font-display text-5xl font-extrabold text-charcoal">{restaurant.rating}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-5 w-5',
                            i < Math.round(restaurant.rating) ? 'fill-gold text-gold' : 'text-charcoal/20'
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-warm-gray">{restaurant.reviewCount.toLocaleString('en-IN')} ratings</p>
                  </div>

                  {/* Rating Distribution */}
                  <div className="mt-6 space-y-2">
                    {ratingDistribution.map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-6 text-xs text-warm-gray">{star}★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal/10">
                          <div
                            className="h-full rounded-full bg-gold"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-warm-gray">{Math.round(percentage)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Tags */}
                <div className="rounded-2xl border border-charcoal/10 bg-white p-6">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
                    <Trophy className="h-5 w-5 text-tomato" />
                    What people love
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RATING_TAGS.map((tag) => (
                      <span
                        key={tag.label}
                        className="rounded-full bg-beige px-3 py-1 text-xs font-semibold text-charcoal/80"
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Write Review Button */}
                <button
                  onClick={() => {
                    setEditingReview(null)
                    setRating(0)
                    setReviewTitle('')
                    setReviewComment('')
                    setShowReviewForm(true)
                  }}
                  className="w-full rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              <div>
                {/* Filters & Sort */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-warm-gray" />
                    <div className="flex flex-wrap gap-2">
                      {[null, 5, 4, 3, 2, 1].map((filter) => (
                        <button
                          key={filter ?? 'all'}
                          onClick={() => setReviewFilter(filter)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-semibold',
                            reviewFilter === filter
                              ? 'border-tomato bg-tomato text-cream'
                              : 'border-charcoal/10 text-charcoal/70 hover:border-tomato/40'
                          )}
                        >
                          {filter === null ? 'All' : `${filter}★`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-warm-gray">Sort by:</label>
                    <select
                      value={reviewSort}
                      onChange={(e) => setReviewSort(e.target.value)}
                      className="rounded-full border border-charcoal/15 px-3 py-1 text-xs font-semibold outline-none"
                    >
                      {REVIEW_SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Review Cards */}
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 rounded-2xl bg-charcoal/8 animate-pulse" />
                    ))}
                  </div>
                ) : sortedReviews.length === 0 ? (
                  <p className="py-8 text-center text-warm-gray">No reviews found for this filter.</p>
                ) : (
                  <div className="space-y-4">
                    {sortedReviews.map((review) => {
                      const isOwnReview = review.userId?._id === user?.id || review.userId?.id === user?.id
                      return (
                        <div key={review._id} className="rounded-2xl border border-charcoal/10 bg-white p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={review.userId?.avatar || 'https://ui-avatars.com/api/?name=U&background=random'}
                                alt={review.userId?.name || 'User'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-sm font-semibold text-charcoal">{review.userId?.name || 'Anonymous'}</p>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3 w-3',
                                        i < review.rating ? 'fill-gold text-gold' : 'text-charcoal/10'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isOwnReview && (
                                <>
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="text-warm-gray hover:text-tomato"
                                    aria-label="Edit review"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="text-warm-gray hover:text-tomato"
                                    aria-label="Delete review"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              <span className="text-xs text-warm-gray">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-charcoal">{review.title}</p>
                          <p className="mt-1 text-sm text-charcoal/80">{review.comment}</p>

                          <div className="mt-3 flex items-center gap-4">
                            <button
                              onClick={() => handleHelpful(review._id)}
                              className={cn(
                                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                                helpfulReviews.has(review._id)
                                  ? 'bg-tomato/10 text-tomato'
                                  : 'bg-charcoal/5 text-charcoal/60 hover:bg-charcoal/10'
                              )}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Helpful ({review.helpful || 0})
                            </button>
                            <button className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-charcoal/40 hover:bg-charcoal/5">
                              <MessageSquare className="h-3 w-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Offers Tab */}
        {tab === 'Offers' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {offersLoading ? (
              <p className="text-warm-gray">Loading offers...</p>
            ) : !offers || offers.length === 0 ? (
              <p className="py-12 text-center text-warm-gray">No active offers at this restaurant right now.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => (
                  <div key={offer._id} className="rounded-2xl border border-charcoal/10 bg-white p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream">
                      🔥 {offer.title}
                    </span>
                    <p className="mt-3 text-sm text-charcoal/80">{offer.description}</p>
                    <p className="mt-2 text-xs text-warm-gray">
                      {offer.minOrder > 0 ? `Min order: ₹${offer.minOrder}` : 'No minimum order'}
                    </p>
                    <p className="mt-1 text-xs text-warm-gray">
                      Valid until: {new Date(offer.validUntil).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="mt-3 rounded-lg bg-beige px-3 py-2 text-center">
                      <span className="font-mono text-sm font-bold text-charcoal">{offer.couponCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Review Form Modal (Create/Edit) */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-warm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-charcoal">
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </h3>
              <button onClick={() => setShowReviewForm(false)} className="text-warm-gray hover:text-tomato">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl ${star <= rating ? 'text-gold' : 'text-charcoal/20'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-tomato"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-charcoal">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Share your experience in detail..."
                className="w-full rounded-xl border border-charcoal/15 px-4 py-2.5 text-sm outline-none focus:border-tomato"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewForm(false)}
                className="flex-1 rounded-full border border-charcoal/15 py-2.5 text-sm font-semibold text-charcoal/70"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-2.5 text-sm font-bold text-cream"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BookTableModal
        restaurantName={restaurant.name}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  )
}

function AmenityItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType
  label: string
  active: boolean
}) {
  return (
    <li className={cn('flex items-center gap-2 text-sm', active ? 'text-charcoal' : 'text-charcoal/30')}>
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </li>
  )
}
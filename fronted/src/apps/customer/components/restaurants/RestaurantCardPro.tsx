import { Link } from 'react-router-dom'
import { Heart, MapPin, Star, BadgeCheck } from 'lucide-react'
import type { Restaurant } from '@/data/restaurants'
import { useFavorites } from '@/context/useFavorites'
import { cn } from '@/lib/utils'

function formatReviewCount(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K`
  return String(count)
}

export function RestaurantCardPro({ restaurant }: { restaurant: Restaurant }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(`restaurant:${restaurant._id || restaurant.id}`)  // 🔥 Format: restaurant:itemId

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm">
      {/* Image */}
      <Link to={`/restaurants/${restaurant._id || restaurant.id}`} className="relative block aspect-16/10 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          width={800}
          height={500}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {restaurant.offerLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream shadow-soft">
            🔥 {restaurant.offerLabel}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => toggleFavorite(`restaurant:${restaurant._id || restaurant.id}`)}  // 🔥 Backend favorite toggle
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-charcoal/60 shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
      >
        <Heart className={cn('h-4 w-4', favorited && 'fill-tomato text-tomato')} strokeWidth={2} />
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/restaurants/${restaurant._id || restaurant.id}`}
            className="flex items-center gap-1.5 font-display text-base font-bold text-charcoal hover:text-tomato"
          >
            {restaurant.name}
            {restaurant.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-tomato" aria-label="Verified restaurant" />
            )}
          </Link>
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-charcoal/80">
          <span className="flex items-center gap-1 font-semibold text-charcoal">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            {restaurant.rating}
          </span>
          <span className="text-warm-gray">· {formatReviewCount(restaurant.reviewCount)} Reviews</span>
        </div>

        <p className="mt-1.5 line-clamp-1 text-sm text-warm-gray">🍛 {restaurant.cuisine}</p>

        <p className="mt-1 text-sm text-charcoal/70">
          {restaurant.priceRange} · ₹{restaurant.priceForTwo} for two
        </p>

        <p className="mt-2 flex items-center gap-1 text-xs text-warm-gray">
          <MapPin className="h-3.5 w-3.5" />
          {restaurant.distance} · {restaurant.area}
        </p>

        <p className={cn(
          'mt-1.5 flex items-center gap-1.5 text-xs font-semibold',
          restaurant.isOpen ? 'text-fresh-green' : 'text-tomato',
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', restaurant.isOpen ? 'bg-fresh-green' : 'bg-tomato')} />
          {restaurant.is24Hours
            ? 'Open 24 hours'
            : restaurant.isOpen
              ? `Open · Closes ${restaurant.closesAt || '10:00 PM'}`
              : `Closed · Opens tomorrow`}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Link
            to={`/restaurants/${restaurant._id || restaurant.id}`}
            className="flex-1 rounded-full border border-charcoal/15 py-2.5 text-center text-xs font-semibold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato"
          >
            View Menu
          </Link>
          {restaurant.hasTableBooking && (
            <Link
              to={`/restaurants/${restaurant._id || restaurant.id}/book-table`}
              className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-2.5 text-center text-xs font-semibold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Book Table
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
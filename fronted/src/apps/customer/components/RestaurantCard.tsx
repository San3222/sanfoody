import { Heart, MapPin, Star, Clock } from 'lucide-react'
import type { Restaurant } from '@/data/restaurants'
import { useFavorites } from '@/context/useFavorites'
import { cn } from '@/lib/utils'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(`restaurant:${restaurant._id || restaurant.id}`)  // 🔥 Format: restaurant:itemId

  return (
    <div className="group overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm">
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {restaurant.hasOffer && (
          <span className="absolute left-3 top-3 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream shadow-soft">
            40% OFF
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite(`restaurant:${restaurant._id || restaurant.id}`)}  // 🔥 Backend favorite toggle
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorited}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-charcoal/60 shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart className={cn('h-4 w-4', favorited && 'fill-tomato text-tomato')} strokeWidth={2} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-charcoal">{restaurant.name}</h3>
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-beige px-2 py-1 text-xs font-semibold text-charcoal">
            <Star className="h-3 w-3 fill-gold text-gold" />
            {restaurant.rating}
          </div>
        </div>
        <p className="mt-1 text-sm text-warm-gray">{restaurant.cuisine}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-gray">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {restaurant.distance}
          </span>
          <span className="font-semibold text-charcoal/70">{restaurant.priceRange}</span>
        </div>
      </div>
    </div>
  )
}
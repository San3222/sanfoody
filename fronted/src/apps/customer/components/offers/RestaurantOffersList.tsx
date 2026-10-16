import { Link } from 'react-router-dom'
import type { Offer } from '@/data/offers'
import type { Restaurant } from '@/data/restaurants'

const TYPE_EMOJI = (offer: Offer) => {
  if (offer.title.toLowerCase().includes('buy 1')) return '🎁'
  if (offer.title.toLowerCase().includes('free delivery')) return '🚚'
  if (offer.title.includes('₹')) return '💰'
  return '🔥'
}

export function RestaurantOffersList({ offers }: { offers: (Offer & { restaurant: Restaurant })[] }) {
  return (
    <div className="divide-y divide-charcoal/8 overflow-hidden rounded-3xl border border-charcoal/10 bg-white">
      {offers.map((offer) => (
        <Link
          key={offer.id}
          to={`/offers/${offer.id}`}
          className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-beige/50"
        >
          <div className="flex items-center gap-3">
            <img
              src={offer.restaurant.image}
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <span className="font-semibold text-charcoal">{offer.restaurant.name}</span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-tomato">
            {TYPE_EMOJI(offer)} {offer.title}
          </span>
        </Link>
      ))}
    </div>
  )
}
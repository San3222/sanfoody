import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Offer } from '@/data/offers'
import type { Restaurant } from '@/data/restaurants'

export function OfferCard({ offer }: { offer: Offer & { restaurant: Restaurant } }) {
  const savingsLine =
    offer.maxDiscount > 0
      ? `Up to ₹${offer.maxDiscount} off`
      : offer.title === 'Free Delivery'
        ? 'On every order'
        : 'Applied at checkout'

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={offer.restaurant.image}
          alt={offer.restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute left-3 top-3 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream shadow-soft">
          🔥 {offer.title}
        </span>
        {offer.isExclusive && (
          <span className="absolute right-3 top-3 rounded-full bg-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-cream shadow-soft">
            Exclusive
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold text-charcoal">{offer.restaurant.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-charcoal/80">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          {offer.restaurant.rating}
        </p>
        <p className="mt-1 text-sm text-warm-gray">{offer.restaurant.cuisine}</p>
        <p className="mt-2 text-sm font-semibold text-fresh-green">{savingsLine}</p>

        <Link
          to={`/offers/${offer.id}`}
          className="mt-auto pt-4 block rounded-full bg-linear-to-r from-tomato to-orange py-2.5 text-center text-xs font-semibold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Get Offer
        </Link>
      </div>
    </div>
  )
}
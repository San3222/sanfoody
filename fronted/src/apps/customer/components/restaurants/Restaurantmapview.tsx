import { useState } from 'react'
import { MapPin, Star } from 'lucide-react'
import type { Restaurant } from '@/data/restaurants'

export function RestaurantMapView({ restaurants }: { restaurants: Restaurant[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = restaurants.find((r) => r.id === activeId) ?? null

  return (
    <div className="relative h-[520px] overflow-hidden rounded-3xl border border-charcoal/10 bg-beige">
      {/* Stylized street-grid backdrop — a real map API can replace this later */}
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1F2937" strokeOpacity="0.15" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {restaurants.map((restaurant) => {
        if (!restaurant.mapPosition) return null

        return (
          <button
            key={restaurant.id}
            type="button"
            onClick={() => setActiveId(restaurant.id === activeId ? null : restaurant.id)}
            style={{ left: `${restaurant.mapPosition.x}%`, top: `${restaurant.mapPosition.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full"
            aria-label={`Show ${restaurant.name} on map`}
          >
            <MapPin
              className={`h-8 w-8 drop-shadow-md transition-colors ${
                activeId === restaurant.id ? 'fill-tomato text-tomato' : 'fill-charcoal text-charcoal'
              }`}
            />
          </button>
        )
      })}

      {active && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-warm sm:left-4 sm:right-auto sm:w-80">
          <img src={active.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-charcoal">{active.name}</p>
            <p className="flex items-center gap-1 text-xs text-warm-gray">
              <Star className="h-3 w-3 fill-gold text-gold" />
              {active.rating} · {active.area}
            </p>
          </div>
        </div>
      )}

      {!active && (
        <p className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-warm-gray shadow-soft">
          Tap a pin to preview
        </p>
      )}
    </div>
  )
}
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SlidersHorizontal } from 'lucide-react'
import type { Restaurant } from '@/data/restaurants'
import { filterOptions } from '@/data/restaurants'
import { RestaurantCard } from '@/apps/customer/components/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/shared/Skeleton'
import { cn } from '@/lib/utils'

interface RestaurantsProps {
  restaurants?: Restaurant[]
  isLoading?: boolean
}

type FilterGroup = keyof typeof filterOptions

const groupLabels: Record<FilterGroup, string> = {
  rating: 'Rating',
  deliveryTime: 'Delivery time',
  cuisine: 'Cuisine',
  price: 'Price',
  dietary: 'Dietary',
}

function parseMinutes(range: string) {
  const match = range.match(/\d+/g)
  return match ? Number(match[match.length - 1]) : 0
}

export function Restaurants({ restaurants, isLoading }: RestaurantsProps) {
  const [active, setActive] = useState<Record<string, boolean>>({})

  const toggle = (value: string) => setActive((prev) => ({ ...prev, [value]: !prev[value] }))

  const activeValues = useMemo(() => Object.keys(active).filter((k) => active[k]), [active])

  const filtered = useMemo(() => {
    if (!restaurants) return []
    if (activeValues.length === 0) return restaurants
    return restaurants.filter((r) => {
      return activeValues.every((value) => {
        if (value === 'Veg only') return r.isVeg
        if (value === 'Offers') return r.hasOffer
        if (value.endsWith('+')) return r.rating >= parseFloat(value)
        if (value.startsWith('Under')) return parseMinutes(r.deliveryTime) <= parseMinutes(value)
        if (value === '₹' || value === '₹₹' || value === '₹₹₹') return r.priceRange === value
        return r.cuisine.toLowerCase().includes(value.toLowerCase())
      })
    })
  }, [restaurants, activeValues])

  return (
    <section id="restaurants" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Nearby</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
            Restaurants around you
          </h2>
        </div>
        {restaurants && (
          <span className="flex items-center gap-1.5 text-sm text-warm-gray">
            <SlidersHorizontal className="h-4 w-4" />
            {filtered.length} of {restaurants.length} shown
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-col gap-4">
        {(Object.keys(filterOptions) as FilterGroup[]).map((group) => (
          <div key={group} className="flex flex-wrap items-center gap-2">
            <span className="mr-1 w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-warm-gray">
              {groupLabels[group]}
            </span>
            {filterOptions[group].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => toggle(value)}
                aria-pressed={!!active[value]}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active[value]
                    ? 'border-tomato bg-tomato text-cream'
                    : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((restaurant, index) => (
              <motion.div
                 key={index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <RestaurantCard restaurant={restaurant} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="py-12 text-center text-warm-gray">No restaurants match those filters — try clearing one.</p>
      )}
    </section>
  )
}
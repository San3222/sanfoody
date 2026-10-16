import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, MapPin, List, Map as MapIcon, X } from 'lucide-react'
import {
  categoryPills,
  collectionDefs,
  filterGroups,
  matchesFilterValue,
  sortOptions,
  sortRestaurants,
} from '@/data/restaurants'
import { useRestaurants } from '@/api/Hooks'
import { RestaurantCardPro } from '@/apps/customer/components/restaurants/RestaurantCardPro'
import { RestaurantScrollSection } from '@/apps/customer/components/Restaurantscrollsection'
import { RestaurantFilters } from '@/apps/customer/components/restaurants/Restaurantfilters'
import { CollectionsGrid } from '@/apps/customer/components/restaurants/Collectionsgrid'
import { RestaurantMapView } from '@/apps/customer/components/restaurants/Restaurantmapview'
import { RestaurantCardSkeleton } from '@/components/shared/Skeleton'
import { cn } from '@/lib/utils'
import { useCity } from '@/hooks/useCity'

// Every value across every filter group, flattened, so we can tell which
// active[] keys belong to the sidebar (vs. category pill / collection state).
const ALL_FILTER_VALUES = new Set(Object.values(filterGroups).flat() as string[])

export function RestaurantsPage() {
  const { city } = useCity()
  const { data: restaurants, isLoading } = useRestaurants({ city })

  const [query, setQuery] = useState('')
  const [pill, setPill] = useState<(typeof categoryPills)[number]['id']>('all')
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]['id']>('recommended')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')


  const toggleFilter = (value: string) => setActive((prev) => ({ ...prev, [value]: !prev[value] }))
  const clearFilters = () => setActive({})

  const activeFilterValues = useMemo(
    () => Object.keys(active).filter((k) => active[k] && ALL_FILTER_VALUES.has(k)),
    [active],
  )

  const trending = useMemo(
    () => (restaurants ? [...restaurants].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6) : []),
    [restaurants],
  )
  const topRated = useMemo(
    () => (restaurants ? restaurants.filter((r) => r.rating >= 4.7).sort((a, b) => b.rating - a.rating) : []),
    [restaurants],
  )
  const nearYou = useMemo(
    () =>
      restaurants ? restaurants.filter((r) => r.distanceKm <= 1.5).sort((a, b) => a.distanceKm - b.distanceKm) : [],
    [restaurants],
  )
  const newlyAdded = useMemo(() => (restaurants ? restaurants.filter((r) => r.isNew) : []), [restaurants])

  const filteredResults = useMemo(() => {
    if (!restaurants) return []
    const q = query.trim().toLowerCase()
    const base = restaurants.filter((r) => {
      const matchesPill = pill === 'all' || (r.categoryTags || []).includes(pill as (typeof r.categoryTags)[number])
      const matchesQuery =
        q === '' ||
        r.name.toLowerCase().includes(q) ||
        (Array.isArray(r.cuisine) ? r.cuisine : [r.cuisine]).some((c) => c.toLowerCase().includes(q)) ||
        (r.area || '').toLowerCase().includes(q)
      const matchesFilters = activeFilterValues.every((value) => matchesFilterValue(r, value))
      const matchesCollection = !selectedCollection || (r.collections || []).includes(selectedCollection)
      return matchesPill && matchesQuery && matchesFilters && matchesCollection
    })

    // ✅ ab base (filtered) use ho raha hai, aur id mapping bhi yahi ho rahi hai
    return sortRestaurants(
      base.map((r) => ({ ...r, id: r._id || r.id })),
      sortBy,
    )
  }, [restaurants, query, pill, activeFilterValues, selectedCollection, sortBy])

  const selectedCollectionTitle = collectionDefs.find((c) => c.id === selectedCollection)?.title

  const scrollToResults = () => {
    document.getElementById('restaurant-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* Hero search */}
      <section className="border-b border-charcoal/5 bg-linear-to-b from-beige/60 to-cream px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl lg:text-5xl">
            Find Your Perfect Restaurant
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-warm-gray">
            Discover the best restaurants, cafes &amp; food spots around you.
          </p>

          <div className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 rounded-2xl border border-charcoal/10 bg-white p-2 shadow-soft sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal/80 sm:border-r sm:border-charcoal/10">
              <MapPin className="h-4 w-4 shrink-0 text-tomato" />
              Mumbai, Maharashtra
            </div>
            <div className="flex flex-1 items-center gap-2 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-warm-gray" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines…"
                aria-label="Search restaurants, cuisines"
                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
              />
            </div>
            <button
              type="button"
              onClick={scrollToResults}
              className="shrink-0 rounded-xl bg-linear-to-r from-tomato to-orange px-6 py-2.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Search
            </button>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-warm-gray">Popular near you</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {categoryPills.map((p) => (
              <button
                key={`${p.id}-${p.label}`}  // 🔥 UNIQUE KEY
                type="button"
                onClick={() => setPill(p.id)}
                aria-pressed={pill === p.id}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  pill === p.id
                    ? 'border-tomato bg-tomato text-cream'
                    : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCardSkeleton key={`restaurant-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <>
            <RestaurantScrollSection icon="🔥" eyebrow="Trending near you" title="Trending Restaurants" items={trending} />
            <RestaurantScrollSection
              icon="⭐"
              eyebrow="4.7+ rated"
              title="Top Rated"
              subtitle="Top rated restaurants around Mumbai"
              items={topRated}
            />

            {/* Filters + sortable/viewable grid */}
            <div id="restaurant-results" className="scroll-mt-24">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
                <aside className="hidden lg:block">
                  <div className="sticky top-24">
                    <RestaurantFilters active={active} onToggle={toggleFilter} onClear={clearFilters} />
                  </div>
                </aside>

                <div>
                  {/* Mobile filters */}
                  <details className="mb-6 lg:hidden">
                    <summary className="cursor-pointer list-none rounded-full border border-charcoal/15 px-4 py-2.5 text-sm font-semibold text-charcoal">
                      Filters {activeFilterValues.length > 0 ? `(${activeFilterValues.length})` : ''}
                    </summary>
                    <div className="mt-3">
                      <RestaurantFilters active={active} onToggle={toggleFilter} onClear={clearFilters} />
                    </div>
                  </details>

                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-bold text-charcoal">Restaurants</h2>
                      <p className="text-sm text-warm-gray">{filteredResults.length} places found</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-warm-gray">
                        Sort by:
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                          className="rounded-full border border-charcoal/15 bg-white px-3 py-1.5 text-sm font-medium text-charcoal outline-none focus:border-tomato"
                        >
                          {sortOptions.map((opt) => (
                            <option key={`sort-${opt.id}`} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="flex items-center gap-1 rounded-full border border-charcoal/15 p-1">
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          aria-pressed={viewMode === 'list'}
                          aria-label="List view"
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-full transition-colors',
                            viewMode === 'list' ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:bg-beige',
                          )}
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('map')}
                          aria-pressed={viewMode === 'map'}
                          aria-label="Map view"
                          className={cn(
                            'grid h-8 w-8 place-items-center rounded-full transition-colors',
                            viewMode === 'map' ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:bg-beige',
                          )}
                        >
                          <MapIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedCollection && (
                    <div className="mb-5 flex items-center gap-2 rounded-full bg-tomato/5 px-4 py-2 text-sm text-tomato">
                      Showing collection: <strong>{selectedCollectionTitle}</strong>
                      <button
                        type="button"
                        onClick={() => setSelectedCollection(null)}
                        aria-label="Clear collection filter"
                        className="ml-auto grid h-5 w-5 place-items-center rounded-full hover:bg-tomato/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {viewMode === 'map' ? (
                    <RestaurantMapView restaurants={filteredResults} />
                  ) : filteredResults.length === 0 ? (
                    <p className="py-16 text-center text-warm-gray">
                      No restaurants match your filters — try clearing a few.
                    </p>
                  ) : (
                    <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      <AnimatePresence mode="popLayout">
                        {filteredResults.map((restaurant, index) => (
                          <motion.div
                            key={`${restaurant.id}-${index}`}  // 🔥 UNIQUE KEY
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.25 }}
                          >
                            <RestaurantCardPro restaurant={restaurant} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-16">
              <RestaurantScrollSection
                icon="📍"
                eyebrow="Near you"
                title="Restaurants Near You"
                subtitle="Within 2 km"
                items={nearYou}
              />
            </div>

            <CollectionsGrid
              onSelect={(id) => {
                setSelectedCollection(id)
                scrollToResults()
              }}
            />

            <RestaurantScrollSection
              icon="🆕"
              eyebrow="Just listed"
              title="Newly Added"
              subtitle="Discover recently listed restaurants"
              items={newlyAdded}
            />
          </>
        )}
      </div>
    </div>
  )
}
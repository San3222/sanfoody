import { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  X,
  SlidersHorizontal,
  Star,
  Leaf,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  LayoutGrid,
  Rows3,
  Plus,
} from 'lucide-react'
import { useCategories, useMenuItems } from '@/api/Hooks'
import { FoodCard } from '@/apps/customer/components/FoodCard'
import { FoodCardSkeleton, CategorySkeleton } from '@/components/shared/Skeleton'
import { cn } from '@/lib/utils'
import type { FoodItem } from '@/data/foods'

type SortKey = 'relevance' | 'rating' | 'price-low' | 'price-high'
type ViewMode = 'grid' | 'list'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'rating', label: 'Rating: High to low' },
  { key: 'price-low', label: 'Price: Low to high' },
  { key: 'price-high', label: 'Price: High to low' },
]

const POPULAR_SEARCHES = ['Pizza', 'Biryani', 'Burger', 'Momos', 'Rolls', 'Dessert']

// ---------------------------------------------------------------------------
// Horizontal scroller with fade edges + arrow controls
// ---------------------------------------------------------------------------

function useScrollArrows() {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.75, behavior: 'smooth' })
  }

  return { ref, canLeft, canRight, scrollBy, update }
}

// ---------------------------------------------------------------------------
// Landscape (list) card — compact horizontal layout
// ---------------------------------------------------------------------------

function FoodListItem({ food, index }: { food: FoodItem; index: number }) {
  const item = food as any
  const image = item.image as string | undefined
  const price = item.price as number | undefined
  const rating = item.rating as number | undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.03, ease: 'easeOut' }}
      className="group flex items-center gap-4 rounded-2xl border border-charcoal/6 bg-white p-3 shadow-soft transition-shadow hover:shadow-warm sm:p-4"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-beige" />
        )}
        <span
          className={cn(
            'absolute left-1.5 top-1.5 grid h-3.5 w-3.5 place-items-center border',
            food.isVeg ? 'border-fresh-green' : 'border-tomato',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', food.isVeg ? 'bg-fresh-green' : 'bg-tomato')} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-base font-bold text-charcoal">{food.name}</h3>
          {typeof rating === 'number' && rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-fresh-green/10 px-1.5 py-0.5 text-xs font-semibold text-fresh-green">
              <Star className="h-3 w-3 fill-current" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-warm-gray">{food.description}</p>
        <div className="mt-2 flex items-center justify-between">
          {typeof price === 'number' && (
            <span className="font-display text-sm font-bold text-charcoal">₹{price}</span>
          )}
          <button
            type="button"
            className="ml-auto flex items-center gap-1 rounded-full bg-tomato/10 px-3 py-1.5 text-xs font-bold text-tomato transition-colors hover:bg-tomato hover:text-cream"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Explore page
// ---------------------------------------------------------------------------

export function Explore() {
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: menuItems, isLoading: menuLoading } = useMenuItems()

  const [query, setQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [ratingFilter, setRatingFilter] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('relevance')
  const [sortOpen, setSortOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('sanfoody:exploreView') as ViewMode) || 'grid',
  )
  const searchRef = useRef<HTMLInputElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)
  const categoryScroll = useScrollArrows()

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // re-check arrow visibility once categories finish loading (content width changes)
  useEffect(() => {
    if (!categoriesLoading) categoryScroll.update()
  }, [categoriesLoading, categoryScroll])

  const setViewModePersist = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('sanfoody:exploreView', mode)
  }

  const filteredItems = useMemo(() => {
    if (!menuItems) return []
    const q = query.trim().toLowerCase()

    const filtered = menuItems.filter((item: FoodItem) => {
      const matchesQuery =
        q === '' || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      const matchesVeg = !vegOnly || item.isVeg
      const rating = Number((item as any).rating ?? 0)
      const matchesRating = !ratingFilter || rating >= 4
      return matchesQuery && matchesVeg && matchesRating
    })

    const sorted = [...filtered]
    if (sortKey === 'rating') {
      sorted.sort((a, b) => Number((b as any).rating ?? 0) - Number((a as any).rating ?? 0))
    } else if (sortKey === 'price-low') {
      sorted.sort((a, b) => Number((a as any).price ?? 0) - Number((b as any).price ?? 0))
    } else if (sortKey === 'price-high') {
      sorted.sort((a, b) => Number((b as any).price ?? 0) - Number((a as any).price ?? 0))
    }
    return sorted
  }, [menuItems, query, vegOnly, ratingFilter, sortKey])

  const activeFilterCount = [vegOnly, ratingFilter, sortKey !== 'relevance'].filter(Boolean).length

  const clearAllFilters = () => {
    setQuery('')
    setVegOnly(false)
    setRatingFilter(false)
    setSortKey('relevance')
  }

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'Relevance'

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
      {/* ---- Header ---- */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Explore</span>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
          Everything SanFoody has to offer
        </h1>
        <p className="mt-2 max-w-xl text-warm-gray">
          Browse by category, or search the full menu across every restaurant on the platform.
        </p>
      </div>

      {/* ---- Search ---- */}
      <div className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-warm-gray" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dishes, cuisines…"
            aria-label="Search dishes"
            className="w-full rounded-2xl border border-charcoal/12 bg-white py-4 pl-12 pr-11 text-sm text-charcoal shadow-soft outline-none transition-shadow focus:border-tomato focus:shadow-warm sm:text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-gray hover:text-charcoal"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {!query && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-warm-gray">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="rounded-full border border-charcoal/10 bg-white px-3 py-1 text-xs font-medium text-charcoal/70 transition-colors hover:border-tomato/40 hover:text-tomato"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Category quick-nav (with scroll arrows + fade edges) ---- */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Categories</h2>
        <div className="group/rail relative">
          {/* left fade + arrow */}
          <AnimatePresence>
            {categoryScroll.canLeft && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute -left-1 top-0 z-10 hidden h-full w-16 bg-linear-to-r from-cream via-cream/80 to-transparent sm:block"
              >
                <button
                  type="button"
                  onClick={() => categoryScroll.scrollBy(-1)}
                  aria-label="Scroll categories left"
                  className="pointer-events-auto absolute left-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-soft opacity-0 transition-opacity duration-200 hover:text-tomato group-hover/rail:opacity-100"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* right fade + arrow */}
          <AnimatePresence>
            {categoryScroll.canRight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute -right-1 top-0 z-10 hidden h-full w-16 bg-linear-to-l from-cream via-cream/80 to-transparent sm:block"
              >
                <button
                  type="button"
                  onClick={() => categoryScroll.scrollBy(1)}
                  aria-label="Scroll categories right"
                  className="pointer-events-auto absolute right-0 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-soft opacity-0 transition-opacity duration-200 hover:text-tomato group-hover/rail:opacity-100"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            ref={categoryScroll.ref}
            className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 sm:mx-0 sm:px-0"
          >
            {categoriesLoading ? (
              Array.from({ length: 9 }).map((_, i) => <CategorySkeleton key={`cat-skeleton-${i}`} />)
            ) : (
              categories?.map((category) => (
                <Link
                  key={category._id || category.id}
                  to={`/explore/${category._id || category.id}`}
                  className="group flex w-24 shrink-0 snap-start flex-col items-center gap-3 sm:w-28"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-transparent shadow-soft transition-all duration-300 group-hover:border-tomato/40 group-hover:shadow-warm sm:h-24 sm:w-24">
                    <img
                      src={category.image}
                      alt=""
                      loading="lazy"
                      width={96}
                      height={96}
                      className="h-full w-full scale-105 object-cover transition-transform duration-500 group-hover:scale-125"
                    />
                    <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-base shadow-soft transition-transform duration-300 group-hover:scale-110">
                      {category.emoji}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-charcoal/80 transition-colors group-hover:text-tomato">
                    {category.name}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ---- Filter / sort / view bar ---- */}
      <div className="mb-6 flex flex-col gap-4 border-y border-charcoal/8 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-charcoal">
          Full menu {!menuLoading && <span className="font-normal text-warm-gray">· {filteredItems.length} dishes</span>}
        </h2>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setVegOnly((v) => !v)}
            aria-pressed={vegOnly}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
              vegOnly
                ? 'border-fresh-green bg-fresh-green text-cream'
                : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-fresh-green/50 hover:text-fresh-green',
            )}
          >
            <Leaf className="h-3.5 w-3.5" />
            Veg only
          </button>

          <button
            type="button"
            onClick={() => setRatingFilter((v) => !v)}
            aria-pressed={ratingFilter}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
              ratingFilter
                ? 'border-tomato bg-tomato text-cream'
                : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
            )}
          >
            <Star className="h-3.5 w-3.5" />
            4.0+ rating
          </button>

          <div className="relative" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                sortKey !== 'relevance'
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-charcoal/15 bg-white text-charcoal/70 hover:border-charcoal/40',
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {currentSortLabel}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', sortOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-charcoal/8 bg-white p-1.5 shadow-warm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSortKey(opt.key)
                        setSortOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                        sortKey === opt.key ? 'bg-tomato/8 font-semibold text-tomato' : 'text-charcoal/80 hover:bg-charcoal/5',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="shrink-0 text-xs font-semibold text-warm-gray underline-offset-2 hover:text-tomato hover:underline"
            >
              Clear all
            </button>
          )}

          {/* Grid / list (portrait / landscape) view toggle */}
          <div className="ml-auto flex shrink-0 items-center rounded-full border border-charcoal/12 bg-white p-1 sm:ml-0">
            <button
              type="button"
              onClick={() => setViewModePersist('grid')}
              aria-pressed={viewMode === 'grid'}
              aria-label="Portrait grid view"
              className={cn(
                'grid h-7 w-8 place-items-center rounded-full transition-colors',
                viewMode === 'grid' ? 'bg-charcoal text-cream' : 'text-charcoal/40 hover:text-charcoal',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewModePersist('list')}
              aria-pressed={viewMode === 'list'}
              aria-label="Landscape list view"
              className={cn(
                'grid h-7 w-8 place-items-center rounded-full transition-colors',
                viewMode === 'list' ? 'bg-charcoal text-cream' : 'text-charcoal/40 hover:text-charcoal',
              )}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Results ---- */}
      {menuLoading ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4'
              : 'flex flex-col gap-3',
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <FoodCardSkeleton key={`food-skeleton-${i}`} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-charcoal/5">
            <Flame className="h-7 w-7 text-charcoal/25" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-charcoal">No dishes found</p>
            <p className="mt-1 text-warm-gray">
              {query ? `Nothing matches "${query}"` : 'Try adjusting your filters'}
              {vegOnly || ratingFilter ? ' with the current filters.' : '.'}
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="rounded-full bg-charcoal px-6 py-2.5 text-sm font-semibold text-cream transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item, i) => (
            <motion.div
              key={`food-${item.id || i}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: (i % 8) * 0.04, ease: 'easeOut' }}
            >
              <FoodCard food={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredItems.map((item, i) => (
            <FoodListItem key={`food-list-${item.id || i}`} food={item} index={i} />
          ))}
        </div>
      )}

      {/* ---- Sticky mobile filter shortcut ---- */}
      <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-5 sm:hidden">
        <button
          onClick={() => searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream shadow-warm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Search & filter'}
        </button>
      </div>
    </section>
  )
}
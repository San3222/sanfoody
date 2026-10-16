import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, List, Map as MapIcon } from 'lucide-react'
import { resolveCollection } from '@/data/collections'
import { sortOptions, sortRestaurants } from '@/data/restaurants'
import { RestaurantCardPro } from '@/apps/customer/components/restaurants/RestaurantCardPro'
import { RestaurantMapView } from '@/apps/customer/components/restaurants/Restaurantmapview'
import { cn } from '@/lib/utils'
import { useRestaurants } from '@/api/Hooks'   // 🔥 add

export function CollectionDetail() {
    const { collectionId } = useParams<{ collectionId: string }>()
    const { data: liveRestaurants, isLoading } = useRestaurants()
    const collection = useMemo(
        () => (collectionId && liveRestaurants ? resolveCollection(collectionId, liveRestaurants) : undefined),
        [collectionId, liveRestaurants],
    )

    const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]['id']>('recommended')
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

    const sorted = useMemo(
        () => (collection ? sortRestaurants(collection.restaurants, sortBy) : []),
        [collection, sortBy],
    )


    if (isLoading) {
        return (
            <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
                <p className="text-warm-gray">Loading collection…</p>
            </section>
        )
    }

    if (!collection) {
        return <Navigate to="/collections" replace />
    }


    return (
        <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
            <Link
                to="/collections"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-warm-gray hover:text-tomato"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Collections
            </Link>

            <h1 className="font-display text-3xl font-extrabold uppercase text-charcoal sm:text-4xl">
                {collection.emoji} {collection.title}
            </h1>
            <p className="mt-3 max-w-2xl text-warm-gray">{collection.description}</p>

            <div className="mt-4 flex items-center gap-4 text-sm font-medium text-charcoal/70">
                <span>⭐ {collection.restaurants.length} Restaurants</span>
                <span>📍 Mumbai</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-6">
                <div className="flex items-center gap-1 rounded-full border border-charcoal/15 p-1">
                    <button
                        type="button"
                        onClick={() => setViewMode('map')}
                        aria-pressed={viewMode === 'map'}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                            viewMode === 'map' ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:bg-beige',
                        )}
                    >
                        <MapIcon className="h-3.5 w-3.5" />
                        Map View
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        aria-pressed={viewMode === 'list'}
                        className={cn(
                            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                            viewMode === 'list' ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:bg-beige',
                        )}
                    >
                        <List className="h-3.5 w-3.5" />
                        List View
                    </button>
                </div>

                <label className="flex items-center gap-2 text-sm text-warm-gray">
                    Sort:
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="rounded-full border border-charcoal/15 bg-white px-3 py-1.5 text-sm font-medium text-charcoal outline-none focus:border-tomato"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-8">
                {viewMode === 'map' ? (
                    <RestaurantMapView restaurants={sorted} />
                ) : (
                    <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {sorted.map((restaurant) => (
                                <motion.div
                                    key={restaurant.id}
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
        </section>
    )
}
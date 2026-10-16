import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { motion } from 'motion/react'
import type { ResolvedCollection } from '@/data/collections'
import { useFavorites } from '@/context/useFavorites'
import { cn } from '@/lib/utils'

// Collections are saved into the same favorites store as dishes/restaurants,
// just under a prefixed key so the id spaces never collide.
const favKey = (collectionId: string) => `collection:${collectionId}`

export function CollectionCard({ collection }: { collection: ResolvedCollection }) {
    const { isFavorite, toggleFavorite } = useFavorites()
    const saved = isFavorite(favKey(collection.id))

    return (
        <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="h-full">
            <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm">
                <Link to={`/collections/${collection.id}`} className="relative block aspect-4/3 overflow-hidden">
                    <img
                        src={collection.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-charcoal/60 via-transparent to-transparent" />
                </Link>

                <button
                    type="button"
                    onClick={() => toggleFavorite(favKey(collection.id))}  // 🔥 Backend favorite toggle
                    aria-label={saved ? 'Remove collection from favorites' : 'Save collection to favorites'}
                    aria-pressed={saved}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-charcoal/60 shadow-soft backdrop-blur-sm transition-transform hover:scale-110"
                >
                    <Heart className={cn('h-4 w-4', saved && 'fill-tomato text-tomato')} strokeWidth={2} />
                </button>

                <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-bold text-charcoal">
                        {collection.emoji} {collection.title}
                    </h3>
                    <p className="mt-1 text-sm text-warm-gray">Handpicked by SanFoody</p>
                    <p className="mt-2 text-sm font-medium text-charcoal/70">
                        {collection.restaurants.length} Restaurant{collection.restaurants.length === 1 ? '' : 's'} · Mumbai
                    </p>

                    <Link
                        to={`/collections/${collection.id}`}
                        className="mt-auto pt-4 text-sm font-semibold text-tomato transition-transform hover:translate-x-0.5"
                    >
                        Explore →
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}
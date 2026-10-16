import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { collectionDefs, restaurants } from '@/data/restaurants'

const COLLECTION_IMAGES: Record<string, string> = {
  'date-night': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&h=400&q=80',
  family: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=400&q=80',
  'late-night': 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=500&h=400&q=80',
  rooftop: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&h=400&q=80',
  'best-cafes': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&h=400&q=80',
  'best-value': 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&h=400&q=80',
}

export function CollectionsGrid({ onSelect }: { onSelect: (collectionId: string) => void }) {
  return (
    <div className="mb-16">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">❤️ Curated for you</span>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
            SanFoody Collections
          </h2>
        </div>
        <Link
          to="/collections"
          className="hidden shrink-0 text-sm font-semibold text-tomato hover:underline sm:block"
        >
          See all collections →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
        {collectionDefs.map((collection, i) => {
          const count = restaurants.filter((r) => r.collections.includes(collection.id)).length
          return (
            <motion.button
              key={collection.id}
              type="button"
              onClick={() => onSelect(collection.id)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
              className="group relative aspect-4/3 overflow-hidden rounded-3xl text-left shadow-soft"
            >
              <img
                src={COLLECTION_IMAGES[collection.id]}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-display text-base font-bold text-cream sm:text-lg">{collection.title}</p>
                <p className="mt-0.5 text-xs text-cream/75">{count} places</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
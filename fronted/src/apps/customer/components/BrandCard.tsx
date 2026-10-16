import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Star, Clock } from 'lucide-react'
import type { Brand } from '@/data/menu'

export function BrandCard({ categoryId, brand }: { categoryId: string; brand: Brand }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}>
      <Link
        to={`/explore/${categoryId}/${brand.id}`}
        className="group block overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft transition-shadow hover:shadow-warm"
      >
        <div className="relative aspect-4/3 overflow-hidden">
          <img
            src={brand.image}
            alt={brand.name}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold text-charcoal">{brand.name}</h3>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-beige px-2 py-1 text-xs font-semibold text-charcoal">
              <Star className="h-3 w-3 fill-gold text-gold" />
              {brand.rating}
            </div>
          </div>
          <p className="mt-1 text-sm text-warm-gray">{brand.tagline}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-warm-gray">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {brand.deliveryTime}
            </span>
            <span className="font-semibold text-charcoal/70">{brand.priceRange}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

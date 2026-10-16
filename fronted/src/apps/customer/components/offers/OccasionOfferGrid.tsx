import { motion } from 'motion/react'
import { occasionOffers } from '@/data/offers'
import { cn } from '@/lib/utils'

export function OccasionOfferGrid({
  active,
  onSelect,
}: {
  active: string | null
  onSelect: (id: string | null) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {occasionOffers.map((occasion, i) => (
        <motion.button
          key={occasion.id}
          type="button"
          onClick={() => onSelect(active === occasion.id ? null : occasion.id)}
          aria-pressed={active === occasion.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, delay: i * 0.05, ease: 'easeOut' }}
          className={cn(
            'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors',
            active === occasion.id
              ? 'border-tomato bg-tomato/5'
              : 'border-charcoal/10 bg-white hover:border-tomato/30',
          )}
        >
          <span className="text-2xl">{occasion.emoji}</span>
          <span
            className={cn(
              'text-xs font-semibold',
              active === occasion.id ? 'text-tomato' : 'text-charcoal/80',
            )}
          >
            {occasion.title}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
import { motion } from 'motion/react'
import type { Restaurant } from '@/data/restaurants'
import { RestaurantCardPro } from '@/apps/customer/components/restaurants/RestaurantCardPro'

export function RestaurantScrollSection({
  icon,
  eyebrow,
  title,
  subtitle,
  items,
}: {
  icon: string
  eyebrow: string
  title: string
  subtitle?: string
  items: Restaurant[]
}) {
  if (items.length === 0) return null

  return (
    <div className="mb-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">
            {icon} {eyebrow}
          </span>
          <h2 className="mt-1.5 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-warm-gray">{subtitle}</p>}
        </div>
      </div>

      <div className="scrollbar-none -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {items.map((restaurant, i) => (
          <motion.div
            key={`${restaurant.id}-${i}`}  // 🔥 UNIQUE KEY
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            className="w-70 shrink-0 sm:w-[320px]"
          >
            <RestaurantCardPro restaurant={restaurant} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
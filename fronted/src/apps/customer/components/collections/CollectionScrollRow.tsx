import { motion } from 'motion/react'
import type { ResolvedCollection } from '@/data/collections'
import { CollectionCard } from '@/apps/customer/components/collections/CollectionCard'

export function CollectionScrollRow({
  icon,
  title,
  subtitle,
  collections,
}: {
  icon: string
  title: string
  subtitle?: string
  collections: ResolvedCollection[]
}) {
  if (collections.length === 0) return null

  return (
    <div className="mb-14">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
          {icon} {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-warm-gray">{subtitle}</p>}
      </div>

      <div className="scrollbar-none -mx-5 flex gap-5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
        {collections.map((collection, i) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
            className="w-65 shrink-0 sm:w-75"
          >
            <CollectionCard collection={collection} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
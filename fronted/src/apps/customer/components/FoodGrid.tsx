import { motion } from 'motion/react'
import type { FoodItem } from '@/data/foods'
import { FoodCard } from '@/apps/customer/components/FoodCard'
import { FoodCardSkeleton } from '@/components/shared/Skeleton'

interface PopularFoodProps {
  foods?: FoodItem[]
  isLoading?: boolean
}

export function PopularFood({ foods, isLoading }: PopularFoodProps) {
  return (
    <section className="bg-beige/40 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Popular right now</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
            What&rsquo;s craving?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-warm-gray">Your favorites, made fresh.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <FoodCardSkeleton key={i} />)
          ) : (
            foods?.slice(0, 8).map((food, i) => (
              <motion.div
                 key={food.id || i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.08, ease: 'easeOut' }}
              >
                <FoodCard food={food} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
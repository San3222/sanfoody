import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { FoodCategory } from '@/data/categories'
import { CategorySkeleton } from '@/components/shared/Skeleton'

interface FoodCategoriesProps {
  categories?: FoodCategory[]
  isLoading?: boolean
}

export function FoodCategories({ categories, isLoading }: FoodCategoriesProps) {
  return (
    <section id="explore" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Browse</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
            What are you in the mood for?
          </h2>
        </div>
      </div>

      <div className="scrollbar-none -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => <CategorySkeleton key={i} />)
        ) : (
          categories?.map((category, i) => (
            <motion.div
               key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className="w-24 shrink-0 sm:w-28"
            >
              <Link to={`/explore/${category.id}`} className="group flex flex-col items-center gap-3">
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
            </motion.div>
          ))
        )}
      </div>
    </section>
  )
}
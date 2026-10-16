import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Star, Clock } from 'lucide-react'
import { categories } from '@/data/categories'
import { useBrand, useFlavorsByBrand } from '@/api/Hooks'
import { FoodCard } from '@/apps/customer/components/FoodCard'
import { FoodCardSkeleton, Skeleton } from '@/components/shared/Skeleton'

export function BrandPage() {
  const { categoryId, brandId } = useParams<{ categoryId: string; brandId: string }>()
  const category = categories.find((c) => c.id === categoryId)
  const { data: brand, isLoading: brandLoading, isError: brandError } = useBrand(brandId)
  const { data: flavorList, isLoading: flavorsLoading, isError: flavorsError } = useFlavorsByBrand(brandId)

  if (!category) {
    return <Navigate to="/" replace />
  }

  if (!brandLoading && (!brand || brand.categoryId !== category.id)) {
    return <Navigate to="/" replace />
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-warm-gray" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-tomato">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to={`/explore/${category.id}`} className="hover:text-tomato">
          {category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium text-charcoal" aria-current="page">
          {brand?.name ?? '…'}
        </span>
      </nav>

      {/* Brand header */}
      {brandLoading || !brand ? (
        <div className="mb-10 overflow-hidden rounded-3xl">
          <Skeleton className="h-48 w-full rounded-3xl sm:h-64" />
        </div>
      ) : (
        <div className="mb-10 overflow-hidden rounded-3xl">
          <div className="relative h-48 sm:h-64">
            <img src={brand.image} alt={brand.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <h1 className="font-display text-3xl font-extrabold text-cream sm:text-4xl">{brand.name}</h1>
              <p className="mt-1 text-cream/85">{brand.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-cream/90">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  {brand.rating}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {brand.deliveryTime}
                </span>
                <span className="font-semibold">{brand.priceRange}</span>
                <span>{brand.cuisine}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-6 font-display text-2xl font-bold text-charcoal">Full menu</h2>

      {brandError || flavorsError ? (
        <p className="py-12 text-center text-warm-gray">Couldn&rsquo;t load the menu right now — please refresh.</p>
      ) : flavorsLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      ) : flavorList && flavorList.length === 0 ? (
        <p className="py-12 text-center text-warm-gray">This menu is being updated — check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {flavorList?.map((flavor, i) => (
            <motion.div
              key={flavor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: 'easeOut' }}
            >
              <FoodCard food={flavor} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
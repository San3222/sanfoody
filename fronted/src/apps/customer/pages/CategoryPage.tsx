import { useState, useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Star, Clock, MapPin } from 'lucide-react'
import { useRestaurants } from '@/api/Hooks'
import { RestaurantCardPro } from '@/apps/customer/components/restaurants/RestaurantCardPro'
import { RestaurantCardSkeleton } from '@/components/shared/Skeleton'

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const { data: restaurants, isLoading, isError } = useRestaurants()
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    // Fetch category name from API
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/v1/categories`)
        const data = await res.json()
        const category = data.data.find((c: any) => c._id === categoryId || c.name.toLowerCase() === categoryId?.toLowerCase())
        if (category) {
          setCategoryName(category.name)
        }
      } catch (error) {
        console.error('Failed to fetch category:', error)
      }
    }
    fetchCategory()
  }, [categoryId])

  // Filter restaurants by category
  const filteredRestaurants = restaurants?.filter((r) => {
    if (!categoryId) return true
    // Check if restaurant cuisine matches category
        const category = categoryId.toLowerCase()
        return (Array.isArray(r.cuisine) && r.cuisine.some((c) => c.toLowerCase().includes(category))) ||
          (Array.isArray(r.cuisines) && r.cuisines.some((c) => c.toLowerCase().includes(category)))
  })

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-charcoal">Loading...</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <p className="text-warm-gray">Couldn't load restaurants. Please try again.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-warm-gray" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-tomato">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/explore" className="hover:text-tomato">Explore</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-charcoal">{categoryName || categoryId}</span>
      </nav>

      <div className="mb-10">
        <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
          {categoryName || categoryId} Restaurants
        </h1>
        <p className="mt-2 text-sm text-warm-gray">
          {filteredRestaurants?.length || 0} restaurants available
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRestaurants?.map((restaurant, index) => (
          <motion.div
            key={`${restaurant.id}-${index}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <RestaurantCardPro restaurant={restaurant} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
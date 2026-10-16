import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { useFavoritesList } from '@/api/Hooks'
import { FoodCard } from '@/apps/customer/components/FoodCard'
import { RestaurantCardPro } from '@/apps/customer/components/restaurants/RestaurantCardPro'

export function Favorites() {
  const { data: favorites, isLoading, isError } = useFavoritesList()

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-charcoal/8"></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-charcoal/8"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <div className="rounded-3xl border border-charcoal/10 bg-white p-12 text-center shadow-soft">
          <p className="text-warm-gray">Couldn't load favorites. Please try again.</p>
        </div>
      </section>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
        <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">Your favorites</h1>
        <p className="mt-2 text-warm-gray">Everything you've hearted, in one place.</p>
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Heart className="h-10 w-10 text-warm-gray" strokeWidth={1.5} />
          <p className="text-warm-gray">Nothing here yet — tap the heart on any dish or restaurant to save it.</p>
          <Link to="/" className="mt-2 font-semibold text-tomato hover:underline">Start exploring</Link>
        </div>
      </section>
    )
  }

  const favoriteRestaurants = favorites.filter((fav: any) => fav.itemType === 'restaurant')
  const favoriteFoods = favorites.filter((fav: any) => fav.itemType === 'food')

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
      <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">Your favorites</h1>
      <p className="mt-2 text-warm-gray">Everything you've hearted, in one place.</p>

      {favoriteRestaurants.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 font-display text-xl font-bold text-charcoal">Restaurants</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteRestaurants.map((fav: any) => (
              <motion.div key={fav._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <RestaurantCardPro restaurant={fav.data} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {favoriteFoods.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 font-display text-xl font-bold text-charcoal">Dishes</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {favoriteFoods.map((fav: any) => (
              <motion.div key={fav._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <FoodCard food={fav.data} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
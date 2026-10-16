// import { Hero } from '@/apps/customer/components/Hero'
// import { FoodCategories } from '@/apps/customer/components/FoodCategories'
// import { PopularFood } from '@/apps/customer/components/FoodGrid'
// import { OfferBanner } from '@/apps/customer/components/OfferBanner'
// import { HowItWorks } from '@/apps/customer/components/HowItWorks'
// import { Restaurants } from '@/apps/customer/components/Restaurants'
// import { Testimonials } from '@/apps/customer/components/Testimonials'
// import { AppPromo } from '@/apps/customer/components/AppPromo'

// export function Home() {
//   return (
//     <>
//       <Hero />
//       <FoodCategories />
//       <PopularFood />
//       <OfferBanner />
//       <HowItWorks />
//       <Restaurants />
//       <Testimonials />
//       <AppPromo />
//     </>
//   )
// }

import { useCategories, useRestaurants, useMenuItems } from '@/api/Hooks'
import { Hero } from '@/apps/customer/components/Hero'
import { FoodCategories } from '@/apps/customer/components/FoodCategories'
import { PopularFood } from '@/apps/customer/components/FoodGrid'
import { OfferBanner } from '@/apps/customer/components/OfferBanner'
import { HowItWorks } from '@/apps/customer/components/HowItWorks'
import { Restaurants } from '@/apps/customer/components/Restaurants'
import { Testimonials } from '@/apps/customer/components/Testimonials'
import { AppPromo } from '@/apps/customer/components/AppPromo'
import { useCity } from '@/hooks/useCity'

export function Home() {
  const { city } = useCity()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants({ city })
  const { data: menuItems, isLoading: menuLoading } = useMenuItems()

  return (
    <>
      <Hero />
      <FoodCategories categories={categories} isLoading={categoriesLoading} />
      <PopularFood foods={menuItems} isLoading={menuLoading} />
      <OfferBanner />
      <HowItWorks />
      <Restaurants restaurants={restaurants} isLoading={restaurantsLoading} />
      <Testimonials />
      <AppPromo />
    </>
  )
}

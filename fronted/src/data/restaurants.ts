export interface Restaurant {
  description: string
  address: string
  deliveryFee: number
  minOrderValue: number
  prepTimeMinutes: number
  availability: any
   _id?: string 
  id: string
  name: string
  image: string

  // Existing fields — kept so the homepage teaser section, Favorites page,
  // and the simple RestaurantCard keep working unchanged.
  cuisine: string
  rating: number
  deliveryTime: string
  priceRange: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹'
  distance: string
  isVeg: boolean
  hasOffer: boolean

  // Extended fields for the professional /restaurants page
  cuisines: string[]
  reviewCount: number
  priceForTwo: number
  distanceKm: number
  area: string
  city: string
  type: 'Restaurant' | 'Cafe' | 'Bakery' | 'Bar & Lounge' | 'Cloud Kitchen'
  categoryTags: ('restaurants' | 'cafes' | 'bakery' | 'fast-food' | 'fine-dining')[]
  isOpen: boolean
  closesAt: string
  is24Hours: boolean
  offerLabel: string | null
  offerTags: ('Discount' | 'Buy 1 Get 1' | 'Free Delivery' | 'Special Deals')[]
  features: string[]
  hasDelivery: boolean
  hasTakeaway: boolean
  hasTableBooking: boolean
  verified: boolean
  isNew: boolean
  collections?: string[]
  mapPosition?: { x: number; y: number } // percent position for the mock map view
}

export const restaurants: Restaurant[] = [
  {
    id: 'bombay-bistro',
    name: 'The Bombay Bistro',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'North Indian · Chinese',
    rating: 4.7,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '1.2 km',
    isVeg: false,
    hasOffer: true,
    cuisines: ['North Indian', 'Chinese'],
    reviewCount: 1200,
    priceForTwo: 800,
    distanceKm: 1.2,
    area: 'Wadala',
    city: 'Mumbai',
    type: 'Restaurant',
    categoryTags: ['restaurants'],
    isOpen: true,
    closesAt: '11:30 PM',
    is24Hours: false,
    offerLabel: '20% OFF',
    offerTags: ['Discount'],
    features: ['Family Friendly', 'Outdoor Seating'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: true,
    verified: true,
    isNew: false,
    collections: ['date-night', 'family'],
    mapPosition: { x: 38, y: 42 },
  },
  {
    id: 'sakura-house',
    name: 'Sakura House',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Japanese · Sushi',
    rating: 4.9,
    deliveryTime: '30–35 min',
    priceRange: '₹₹₹',
    distance: '2.1 km',
    isVeg: false,
    hasOffer: true,
    cuisines: ['Japanese', 'Continental'],
    reviewCount: 940,
    priceForTwo: 2200,
    distanceKm: 2.1,
    area: 'Bandra',
    city: 'Mumbai',
    type: 'Restaurant',
    categoryTags: ['restaurants', 'fine-dining'],
    isOpen: true,
    closesAt: '12:00 AM',
    is24Hours: false,
    offerLabel: 'Free Delivery',
    offerTags: ['Free Delivery'],
    features: ['Rooftop', 'Live Music'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: true,
    verified: true,
    isNew: false,
    collections: ['date-night', 'rooftop'],
    mapPosition: { x: 68, y: 30 },
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl Kitchen',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Healthy · Salads',
    rating: 4.5,
    deliveryTime: '15–20 min',
    priceRange: '₹',
    distance: '0.5 km',
    isVeg: true,
    hasOffer: false,
    cuisines: ['Continental', 'South Indian'],
    reviewCount: 410,
    priceForTwo: 450,
    distanceKm: 0.5,
    area: 'Wadala',
    city: 'Mumbai',
    type: 'Cafe',
    categoryTags: ['cafes'],
    isOpen: true,
    closesAt: '10:00 PM',
    is24Hours: false,
    offerLabel: null,
    offerTags: [],
    features: ['Pure Veg', 'Vegan', 'Family Friendly'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: false,
    verified: false,
    isNew: false,
    collections: ['best-value'],
    mapPosition: { x: 30, y: 55 },
  },
  {
    id: 'smoke-grill-co',
    name: 'Smoke & Grill Co.',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'American · Burgers',
    rating: 4.6,
    deliveryTime: '20–25 min',
    priceRange: '₹₹',
    distance: '0.8 km',
    isVeg: false,
    hasOffer: true,
    cuisines: ['Continental', 'Mexican'],
    reviewCount: 680,
    priceForTwo: 700,
    distanceKm: 0.8,
    area: 'Dadar',
    city: 'Mumbai',
    type: 'Restaurant',
    categoryTags: ['restaurants', 'fast-food'],
    isOpen: true,
    closesAt: '11:00 PM',
    is24Hours: false,
    offerLabel: 'Buy 1 Get 1',
    offerTags: ['Buy 1 Get 1'],
    features: ['Family Friendly'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: false,
    verified: true,
    isNew: false,
    collections: ['late-night'],
    mapPosition: { x: 45, y: 22 },
  },
  {
    id: 'ramen-lab',
    name: 'Ramen Lab',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Japanese · Ramen',
    rating: 4.9,
    deliveryTime: '30–35 min',
    priceRange: '₹₹',
    distance: '1.8 km',
    isVeg: false,
    hasOffer: false,
    cuisines: ['Japanese', 'Chinese'],
    reviewCount: 512,
    priceForTwo: 900,
    distanceKm: 1.8,
    area: 'Andheri',
    city: 'Mumbai',
    type: 'Restaurant',
    categoryTags: ['restaurants'],
    isOpen: false,
    closesAt: '11:00 PM',
    is24Hours: false,
    offerLabel: null,
    offerTags: [],
    features: ['Family Friendly'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: true,
    verified: true,
    isNew: true,
    collections: [],
    mapPosition: { x: 20, y: 70 },
  },
  {
    id: 'sugar-and-smoke',
    name: 'Sugar & Smoke',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Desserts · Bakery',
    rating: 4.9,
    deliveryTime: '15–20 min',
    priceRange: '₹₹',
    distance: '1.0 km',
    isVeg: true,
    hasOffer: true,
    cuisines: ['Bakery', 'Desserts'],
    reviewCount: 388,
    priceForTwo: 400,
    distanceKm: 1.0,
    area: 'Bandra',
    city: 'Mumbai',
    type: 'Bakery',
    categoryTags: ['bakery'],
    isOpen: true,
    closesAt: '10:30 PM',
    is24Hours: false,
    offerLabel: 'Special Deals',
    offerTags: ['Special Deals'],
    features: ['Pure Veg', 'Family Friendly'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: false,
    verified: false,
    isNew: true,
    collections: ['best-cafes'],
    mapPosition: { x: 72, y: 48 },
  },
  {
    id: 'brew-and-bloom',
    name: 'Brew & Bloom',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Coffee · Beverages',
    rating: 4.6,
    deliveryTime: '12–18 min',
    priceRange: '₹',
    distance: '0.6 km',
    isVeg: true,
    hasOffer: false,
    cuisines: ['Continental'],
    reviewCount: 265,
    priceForTwo: 350,
    distanceKm: 0.6,
    area: 'Powai',
    city: 'Mumbai',
    type: 'Cafe',
    categoryTags: ['cafes'],
    isOpen: true,
    closesAt: '11:00 PM',
    is24Hours: false,
    offerLabel: null,
    offerTags: [],
    features: ['Pure Veg', 'Outdoor Seating'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: false,
    verified: false,
    isNew: false,
    collections: ['best-cafes', 'best-value'],
    mapPosition: { x: 55, y: 65 },
  },
  {
    id: 'el-fuego',
    name: 'El Fuego',
    image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Mexican',
    rating: 4.5,
    deliveryTime: '25–30 min',
    priceRange: '₹₹',
    distance: '3.4 km',
    isVeg: false,
    hasOffer: true,
    cuisines: ['Mexican'],
    reviewCount: 322,
    priceForTwo: 750,
    distanceKm: 3.4,
    area: 'Andheri',
    city: 'Mumbai',
    type: 'Bar & Lounge',
    categoryTags: ['restaurants', 'fine-dining'],
    isOpen: true,
    closesAt: '1:00 AM',
    is24Hours: false,
    offerLabel: 'Discount',
    offerTags: ['Discount'],
    features: ['Rooftop', 'Live Music'],
    hasDelivery: false,
    hasTakeaway: false,
    hasTableBooking: true,
    verified: true,
    isNew: false,
    collections: ['date-night', 'late-night', 'rooftop'],
    mapPosition: { x: 15, y: 35 },
  },
  {
    id: 'flame-feathers',
    name: 'Flame & Feathers',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Portuguese · Grilled Chicken',
    rating: 4.6,
    deliveryTime: '22–28 min',
    priceRange: '₹₹',
    distance: '1.5 km',
    isVeg: false,
    hasOffer: false,
    cuisines: ['Continental', 'North Indian'],
    reviewCount: 198,
    priceForTwo: 650,
    distanceKm: 1.5,
    area: 'Dadar',
    city: 'Mumbai',
    type: 'Cloud Kitchen',
    categoryTags: ['fast-food'],
    isOpen: true,
    closesAt: '11:30 PM',
    is24Hours: false,
    offerLabel: null,
    offerTags: [],
    features: ['Jain Food'],
    hasDelivery: true,
    hasTakeaway: false,
    hasTableBooking: false,
    verified: false,
    isNew: true,
    collections: [],
    mapPosition: { x: 48, y: 75 },
  },
  {
    id: 'juice-theory',
    name: 'Juice Theory',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&h=600&q=80',
    cuisine: 'Juices · Smoothies',
    rating: 4.5,
    deliveryTime: '15–20 min',
    priceRange: '₹',
    distance: '0.3 km',
    isVeg: true,
    hasOffer: false,
    cuisines: ['Continental'],
    reviewCount: 140,
    priceForTwo: 300,
    distanceKm: 0.3,
    area: 'Wadala',
    city: 'Mumbai',
    type: 'Cafe',
    categoryTags: ['cafes'],
    isOpen: true,
    closesAt: '11:59 PM',
    is24Hours: true,
    offerLabel: null,
    offerTags: [],
    features: ['Pure Veg', 'Vegan'],
    hasDelivery: true,
    hasTakeaway: true,
    hasTableBooking: false,
    verified: false,
    isNew: false,
    collections: ['best-value', 'late-night'],
    mapPosition: { x: 33, y: 48 },
  },
]

// ---------------------------------------------------------------------------
// Legacy filter shape — still used by the homepage teaser section
// (src/components/Restaurants.tsx). Kept separate from filterGroups below so
// that component doesn't need to change.
// ---------------------------------------------------------------------------
export const filterOptions = {
  rating: ['4.5+', '4.0+', '3.5+'],
  deliveryTime: ['Under 20 min', 'Under 30 min', 'Under 45 min'],
  cuisine: ['Italian', 'American', 'Japanese', 'Healthy'],
  price: ['₹', '₹₹', '₹₹₹'],
  dietary: ['Veg only', 'Offers'],
} as const

// ---------------------------------------------------------------------------
// Filter option groups for the professional /restaurants page sidebar.
// ---------------------------------------------------------------------------

export const filterGroups = {
  location: ['Near Me', 'Wadala', 'Dadar', 'Andheri', 'Bandra', 'Powai'],
  cuisine: ['Indian', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Mughlai', 'Continental', 'Japanese', 'Bakery', 'Desserts'],
  price: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
  rating: ['4.5+', '4.0+', '3.5+'],
  type: ['Restaurant', 'Cafe', 'Bakery', 'Bar & Lounge', 'Cloud Kitchen'],
  features: ['Pure Veg', 'Vegan', 'Jain Food', 'Family Friendly', 'Outdoor Seating', 'Rooftop', 'Live Music'],
  offers: ['Discount', 'Buy 1 Get 1', 'Free Delivery', 'Special Deals'],
  availability: ['Open Now', 'Open 24 Hours'],
} as const

export type FilterGroupKey = keyof typeof filterGroups

export const filterGroupLabels: Record<FilterGroupKey, string> = {
  location: 'Location',
  cuisine: 'Cuisine',
  price: 'Price',
  rating: 'Rating',
  type: 'Restaurant Type',
  features: 'Features',
  offers: 'Offers',
  availability: 'Availability',
}

export const categoryPills = [
  { id: 'all', label: 'All' },
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'cafes', label: 'Cafes' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'fast-food', label: 'Fast Food' },
  { id: 'fine-dining', label: 'Fine Dining' },
] as const

export const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest' },
] as const

export const collectionDefs = [
  { id: 'date-night', title: 'Perfect for Date Night' },
  { id: 'family', title: 'Best Family Restaurants' },
  { id: 'late-night', title: 'Late Night Eats' },
  { id: 'rooftop', title: 'Rooftop Restaurants' },
  { id: 'best-cafes', title: 'Best Cafes' },
  { id: 'best-value', title: 'Best Food Under ₹500' },
] as const

function parseMinDeliveryMinutes(range: string) {
  const match = range.match(/\d+/g)
  return match ? Number(match[0]) : 0
}

/** Does this restaurant satisfy one selected filter value, whichever group it belongs to? */
export function matchesFilterValue(restaurant: Restaurant, value: string): boolean {
  if (value === 'Near Me') return restaurant.distanceKm <= 1.5
  if ((filterGroups.location as readonly string[]).includes(value)) return restaurant.area === value
  if ((filterGroups.cuisine as readonly string[]).includes(value)) return (restaurant.cuisines || []).includes(value)
  if ((filterGroups.price as readonly string[]).includes(value)) return restaurant.priceRange === value
  if (value.endsWith('+')) return restaurant.rating >= parseFloat(value)
  if ((filterGroups.type as readonly string[]).includes(value)) return restaurant.type === value
  if ((filterGroups.features as readonly string[]).includes(value)) return (restaurant.features || []).includes(value)
  if ((filterGroups.offers as readonly string[]).includes(value))
    return (restaurant.offerTags || []).includes(value as Restaurant['offerTags'][number])
  if (value === 'Open Now') return restaurant.isOpen
  if (value === 'Open 24 Hours') return restaurant.is24Hours
  return true
}

export function sortRestaurants(list: Restaurant[], sortBy: string): Restaurant[] {
  const sorted = [...list]
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'popular':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount)
    case 'nearest':
      return sorted.sort((a, b) => a.distanceKm - b.distanceKm)
    case 'price-asc':
      return sorted.sort((a, b) => a.priceForTwo - b.priceForTwo)
    case 'price-desc':
      return sorted.sort((a, b) => b.priceForTwo - a.priceForTwo)
    case 'newest':
      return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew))
    default:
      return sorted.sort(
        (a, b) =>
          b.rating * b.reviewCount - a.rating * a.reviewCount ||
          parseMinDeliveryMinutes(a.deliveryTime) - parseMinDeliveryMinutes(b.deliveryTime),
      )
  }
}
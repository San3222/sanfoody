import { restaurants } from '@/data/restaurants'
import type { Restaurant } from '@/data/restaurants'

export type CollectionGroupId = 'trending' | 'mood' | 'cuisine' | 'occasion' | 'location' | 'picks'

export const collectionGroups: { id: CollectionGroupId; label: string; icon: string }[] = [
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'mood', label: 'By Mood', icon: '😋' },
  { id: 'cuisine', label: 'By Cuisine', icon: '🍕' },
  { id: 'occasion', label: 'By Occasion', icon: '❤️' },
  { id: 'location', label: 'By Location', icon: '📍' },
  { id: 'picks', label: 'SanFoody Picks', icon: '⭐' },
]

export interface CollectionDef {
  id: string
  title: string
  emoji: string
  groupId: CollectionGroupId
  description: string
  image: string
  match: (r: Restaurant) => boolean
}

export interface ResolvedCollection extends CollectionDef {
  restaurants: Restaurant[]
}

const IMG = {
  biryani: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=400&q=80',
  cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&h=400&q=80',
  loved: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&h=400&q=80',
  trending: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&h=400&q=80',
  dateNight: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&h=400&q=80',
  family: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=400&q=80',
  party: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=500&h=400&q=80',
  lateNight: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=500&h=400&q=80',
  business: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=400&q=80',
  peaceful: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&h=400&q=80',
  birthday: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&h=400&q=80',
  editors: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&h=400&q=80',
  gems: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=500&h=400&q=80',
  mustTry: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=500&h=400&q=80',
  newSpots: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&h=400&q=80',
  insta: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&h=400&q=80',
  awards: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=400&q=80',
  budget: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&h=400&q=80',
  luxury: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&h=400&q=80',
  offers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&h=400&q=80',
}

const byIds = (ids: string[]) => (r: Restaurant) => ids.includes(r.id)

const handCurated: CollectionDef[] = [
  // Trending
  {
    id: 'best-biryani-mumbai',
    title: "Mumbai's Best Biryani Spots",
    emoji: '🍛',
    groupId: 'trending',
    description: 'Handpicked biryani-and-more joints worth the trip.',
    image: IMG.biryani,
    match: byIds(['bombay-bistro', 'flame-feathers', 'ramen-lab']),
  },
  {
    id: 'best-cafes-coffee',
    title: 'Best Cafes for Coffee Lovers',
    emoji: '☕',
    groupId: 'trending',
    description: 'Where the coffee is always right.',
    image: IMG.cafe,
    match: byIds(['brew-and-bloom', 'green-bowl', 'juice-theory']),
  },
  {
    id: 'most-loved',
    title: 'Most Loved Places',
    emoji: '❤️',
    groupId: 'trending',
    description: 'The restaurants everyone keeps coming back to.',
    image: IMG.loved,
    match: (r) => r.reviewCount >= 500,
  },
  {
    id: 'trending-restaurants',
    title: 'Trending Restaurants',
    emoji: '📈',
    groupId: 'trending',
    description: 'What Mumbai is ordering right now.',
    image: IMG.trending,
    match: (r) => r.reviewCount >= 300,
  },

  // Mood
  {
    id: 'date-night',
    title: 'Date Night',
    emoji: '❤️',
    groupId: 'mood',
    description: 'Romantic restaurants for your next special evening.',
    image: IMG.dateNight,
    match: byIds(['sakura-house', 'el-fuego', 'bombay-bistro']),
  },
  {
    id: 'family-time',
    title: 'Family Time',
    emoji: '👨\u200d👩\u200d👧',
    groupId: 'mood',
    description: 'Great for a relaxed meal with the whole family.',
    image: IMG.family,
    match: byIds(['bombay-bistro', 'smoke-grill-co', 'green-bowl']),
  },
  {
    id: 'party-mood',
    title: 'Party',
    emoji: '🎉',
    groupId: 'mood',
    description: 'Loud music, good drinks, better company.',
    image: IMG.party,
    match: byIds(['el-fuego', 'smoke-grill-co']),
  },
  {
    id: 'chill-coffee',
    title: 'Chill & Coffee',
    emoji: '☕',
    groupId: 'mood',
    description: 'Slow mornings and good conversation.',
    image: IMG.cafe,
    match: byIds(['brew-and-bloom', 'juice-theory', 'green-bowl']),
  },
  {
    id: 'late-night-mood',
    title: 'Late Night Eats',
    emoji: '🌙',
    groupId: 'mood',
    description: 'For when the cravings hit after midnight.',
    image: IMG.lateNight,
    // 'late-night-mood' collection
    match: (r) => r.is24Hours || (r.closesAt || '').includes('AM'),
  },
  {
    id: 'business-lunch',
    title: 'Business Lunch',
    emoji: '💼',
    groupId: 'mood',
    description: 'Quiet enough to talk shop.',
    image: IMG.business,
    match: byIds(['bombay-bistro', 'sakura-house']),
  },
  {
    id: 'peaceful-quiet',
    title: 'Peaceful & Quiet',
    emoji: '🌿',
    groupId: 'mood',
    description: 'Calm spaces to slow down.',
    image: IMG.peaceful,
    match: byIds(['green-bowl', 'sugar-and-smoke']),
  },

  // Occasion
  {
    id: 'birthday',
    title: 'Birthday Celebrations',
    emoji: '🎂',
    groupId: 'occasion',
    description: 'Make the day feel special.',
    image: IMG.birthday,
    match: byIds(['bombay-bistro', 'smoke-grill-co', 'sugar-and-smoke']),
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    emoji: '💍',
    groupId: 'occasion',
    description: 'Celebrate another year, done right.',
    image: IMG.dateNight,
    match: byIds(['sakura-house', 'el-fuego']),
  },
  {
    id: 'family-dinner',
    title: 'Family Dinner',
    emoji: '👨\u200d👩\u200d👧',
    groupId: 'occasion',
    description: 'A table big enough for everyone.',
    image: IMG.family,
    match: byIds(['bombay-bistro', 'green-bowl']),
  },
  {
    id: 'business-meeting',
    title: 'Business Meeting',
    emoji: '👔',
    groupId: 'occasion',
    description: 'Professional settings, great food.',
    image: IMG.business,
    match: byIds(['bombay-bistro', 'sakura-house']),
  },
  {
    id: 'party-occasion',
    title: 'Party',
    emoji: '🎉',
    groupId: 'occasion',
    description: 'Bring the whole crew.',
    image: IMG.party,
    match: byIds(['el-fuego', 'smoke-grill-co']),
  },
  {
    id: 'casual-hangout',
    title: 'Casual Hangout',
    emoji: '☕',
    groupId: 'occasion',
    description: 'No occasion needed.',
    image: IMG.cafe,
    match: byIds(['brew-and-bloom', 'juice-theory']),
  },

  // SanFoody Picks
  {
    id: 'editors-choice',
    title: "Editor's Choice",
    emoji: '👑',
    groupId: 'picks',
    description: 'Handpicked by the SanFoody team.',
    image: IMG.editors,
    match: byIds(['sakura-house', 'sugar-and-smoke', 'bombay-bistro']),
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    emoji: '💎',
    groupId: 'picks',
    description: 'Small spots, big flavor — before everyone finds out.',
    image: IMG.gems,
    match: byIds(['juice-theory', 'flame-feathers']),
  },
  {
    id: 'must-try',
    title: 'Must Try',
    emoji: '🔥',
    groupId: 'picks',
    description: 'If you only try a few places, make it these.',
    image: IMG.mustTry,
    match: byIds(['ramen-lab', 'el-fuego', 'sakura-house']),
  },
  {
    id: 'new-noteworthy',
    title: 'New & Noteworthy',
    emoji: '🆕',
    groupId: 'picks',
    description: 'Freshly added to SanFoody.',
    image: IMG.newSpots,
    match: (r) => r.isNew,
  },
  {
    id: 'instagram-worthy',
    title: 'Instagram Worthy',
    emoji: '📸',
    groupId: 'picks',
    description: 'As good to look at as it is to eat.',
    image: IMG.insta,
    match: byIds(['sugar-and-smoke', 'sakura-house', 'el-fuego']),
  },
  {
    id: 'sanfoody-awards',
    title: 'SanFoody Awards',
    emoji: '🏆',
    groupId: 'picks',
    description: 'Our top-rated, most-reviewed winners.',
    image: IMG.awards,
    match: (r) => r.verified && r.rating >= 4.7,
  },
]

// Cuisine collections — generated from whatever cuisines actually exist in
// the data, so the page never links to an empty collection.
const cuisineImageFallback = IMG.mustTry
const uniqueCuisines = Array.from(new Set(restaurants.flatMap((r) => r.cuisines))).sort()
// cuisineCollections — thoda neeche
const cuisineCollections: CollectionDef[] = uniqueCuisines.map((cuisine) => ({
  id: `cuisine-${cuisine.toLowerCase().replace(/\s+/g, '-')}`,
  title: `Best ${cuisine} Restaurants`,
  emoji: '🍽️',
  groupId: 'cuisine',
  description: `Top-rated ${cuisine.toLowerCase()} spots on SanFoody.`,
  image: cuisineImageFallback,
  match: (r) => (r.cuisines || []).includes(cuisine),   // 🔥 guard
}))

// Location collections — generated from areas present in the data.
const uniqueAreas = Array.from(new Set(restaurants.map((r) => r.area))).sort()
const locationCollections: CollectionDef[] = uniqueAreas.map((area) => ({
  id: `area-${area.toLowerCase().replace(/\s+/g, '-')}`,
  title: `Best of ${area}`,
  emoji: '📍',
  groupId: 'location',
  description: `Everything worth eating in ${area}.`,
  image: IMG.trending,
  match: (r) => r.area === area,
}))

const allCollectionDefs: CollectionDef[] = [
  ...handCurated,
  ...cuisineCollections,
  ...locationCollections,
]

/** Every collection with its matching restaurants resolved, empty ones dropped. */
// export function resolveCollections(): ResolvedCollection[] {
//   return allCollectionDefs
//     .map((def) => ({ ...def, restaurants: restaurants.filter(def.match) }))
//     .filter((c) => c.restaurants.length > 0)
// }

// export function resolveCollection(id: string): ResolvedCollection | undefined {
//   const def = allCollectionDefs.find((c) => c.id === id)
//   if (!def) return undefined
//   return { ...def, restaurants: restaurants.filter(def.match) }
// }

/** Every collection with its matching restaurants resolved, empty ones dropped. */
export function resolveCollections(liveRestaurants: Restaurant[] = restaurants): ResolvedCollection[] {
  return allCollectionDefs
    .map((def) => ({ ...def, restaurants: liveRestaurants.filter(def.match) }))
    .filter((c) => c.restaurants.length > 0)
}

export function resolveCollection(id: string, liveRestaurants: Restaurant[] = restaurants): ResolvedCollection | undefined {
  const def = allCollectionDefs.find((c) => c.id === id)
  if (!def) return undefined
  return { ...def, restaurants: liveRestaurants.filter(def.match) }
}

// ---------------------------------------------------------------------------
// Bonus rows shown at the bottom of the Collections page — Budget & Offers —
// computed straight from restaurant fields, no curation needed.
// ---------------------------------------------------------------------------

export interface BonusCollection {
  id: string
  title: string
  restaurants: Restaurant[]
}

export function budgetCollections(liveRestaurants: Restaurant[] = restaurants): BonusCollection[] {
  return [
    { id: 'under-300', title: 'Under ₹300', restaurants: liveRestaurants.filter((r) => r.priceForTwo <= 300) },
    { id: 'under-500', title: 'Under ₹500', restaurants: liveRestaurants.filter((r) => r.priceForTwo <= 500) },
    { id: 'under-750', title: 'Under ₹750', restaurants: liveRestaurants.filter((r) => r.priceForTwo <= 750) },
    {
      id: 'best-value',
      title: 'Best Value',
      restaurants: liveRestaurants.filter((r) => r.priceForTwo <= 500 && r.rating >= 4.5),
    },
  ].filter((c) => c.restaurants.length > 0)
}

// offerCollections — chaaron jagah guard karo
export function offerCollections(liveRestaurants: Restaurant[] = restaurants): BonusCollection[] {
  return [
    { id: 'discount', title: '🔥 Discount Offers', restaurants: liveRestaurants.filter((r) => (r.offerTags || []).includes('Discount')) },
    { id: 'bogo', title: '🎁 Buy 1 Get 1', restaurants: liveRestaurants.filter((r) => (r.offerTags || []).includes('Buy 1 Get 1')) },
    {
      id: 'free-delivery',
      title: '🚚 Free Delivery',
      restaurants: liveRestaurants.filter((r) => (r.offerTags || []).includes('Free Delivery')),
    },
    {
      id: 'sanfoody-exclusive',
      title: '🎟️ SanFoody Exclusive',
      restaurants: liveRestaurants.filter((r) => (r.offerTags || []).includes('Special Deals')),
    },
  ].filter((c) => c.restaurants.length > 0)
}
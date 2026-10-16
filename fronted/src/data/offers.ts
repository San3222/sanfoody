import { restaurants } from '@/data/restaurants'
import type { Restaurant } from '@/data/restaurants'

export interface Offer {
  id: string
  restaurantId: string
  title: string // "40% OFF"
  discountPercent: number
  maxDiscount: number
  minOrder: number
  couponCode: string
  validUntil: string // display date
  countdownHours: number | null // if set, this offer is "Ending Soon"
  isExclusive: boolean // SanFoody Exclusive
  isNew: boolean
  dineIn: boolean
  takeaway: boolean
  onlineOrder: boolean
  discountTags: ('50-plus' | 'flat-100' | 'under-299' | 'bogo' | 'free-delivery' | 'no-min')[]
  occasionTags: ('birthday' | 'date-night' | 'family' | 'weekend' | 'late-night' | 'breakfast')[]
  terms: string[]
}

// endsAt is computed once at module load, relative to "now" — keeps the
// countdown demo evergreen no matter when the app is actually opened.
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()

const rawOffers: Offer[] = [
  {
    id: 'off-bombay-bistro-40',
    restaurantId: 'bombay-bistro',
    title: '40% OFF',
    discountPercent: 40,
    maxDiscount: 150,
    minOrder: 499,
    couponCode: 'SANFOODY40',
    validUntil: '15 Sep 2026',
    countdownHours: null,
    isExclusive: false,
    isNew: false,
    dineIn: true,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['flat-100'],
    occasionTags: ['family', 'weekend'],
    terms: ['Valid once per user', 'Not combinable with other offers', 'Applicable on food items only'],
  },
  {
    id: 'off-sakura-house-25',
    restaurantId: 'sakura-house',
    title: '25% OFF',
    discountPercent: 25,
    maxDiscount: 300,
    minOrder: 999,
    couponCode: 'SAKURA25',
    validUntil: '30 Sep 2026',
    countdownHours: null,
    isExclusive: true,
    isNew: false,
    dineIn: true,
    takeaway: false,
    onlineOrder: true,
    discountTags: ['flat-100'],
    occasionTags: ['date-night'],
    terms: ['Valid on dine-in and online orders', 'Excludes alcoholic beverages'],
  },
  {
    id: 'off-green-bowl-freedelivery',
    restaurantId: 'green-bowl',
    title: 'Free Delivery',
    discountPercent: 0,
    maxDiscount: 0,
    minOrder: 0,
    couponCode: 'GREENFREE',
    validUntil: '31 Oct 2026',
    countdownHours: null,
    isExclusive: false,
    isNew: false,
    dineIn: false,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['free-delivery', 'no-min'],
    occasionTags: ['breakfast'],
    terms: ['No minimum order value', 'Applicable on delivery orders only'],
  },
  {
    id: 'off-smoke-grill-bogo',
    restaurantId: 'smoke-grill-co',
    title: 'Buy 1 Get 1',
    discountPercent: 50,
    maxDiscount: 250,
    minOrder: 399,
    couponCode: 'SMOKEBOGO',
    validUntil: '20 Sep 2026',
    countdownHours: 26,
    isExclusive: false,
    isNew: false,
    dineIn: true,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['bogo'],
    occasionTags: ['weekend', 'late-night'],
    terms: ['Applicable on burgers only', 'Lower-priced item free'],
  },
  {
    id: 'off-ramen-lab-new20',
    restaurantId: 'ramen-lab',
    title: '20% OFF',
    discountPercent: 20,
    maxDiscount: 200,
    minOrder: 599,
    couponCode: 'RAMENNEW20',
    validUntil: '25 Sep 2026',
    countdownHours: null,
    isExclusive: false,
    isNew: true,
    dineIn: true,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['under-299'],
    occasionTags: ['late-night'],
    terms: ['New restaurant launch offer', 'Valid for first two weeks'],
  },
  {
    id: 'off-sugar-smoke-30',
    restaurantId: 'sugar-and-smoke',
    title: '30% OFF',
    discountPercent: 30,
    maxDiscount: 120,
    minOrder: 299,
    couponCode: 'SUGAR30',
    validUntil: '10 Sep 2026',
    countdownHours: 6,
    isExclusive: true,
    isNew: true,
    dineIn: false,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['50-plus', 'under-299'],
    occasionTags: ['birthday'],
    terms: ['Only on SanFoody app', 'Valid on desserts and bakery items'],
  },
  {
    id: 'off-brew-bloom-flat100',
    restaurantId: 'brew-and-bloom',
    title: 'Flat ₹100 OFF',
    discountPercent: 0,
    maxDiscount: 100,
    minOrder: 349,
    couponCode: 'BREW100',
    validUntil: '30 Sep 2026',
    countdownHours: null,
    isExclusive: false,
    isNew: false,
    dineIn: true,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['flat-100'],
    occasionTags: ['breakfast', 'weekend'],
    terms: ['Minimum order ₹349', 'Valid all day'],
  },
  {
    id: 'off-el-fuego-exclusive',
    restaurantId: 'el-fuego',
    title: 'FLAT 30% OFF',
    discountPercent: 30,
    maxDiscount: 400,
    minOrder: 799,
    couponCode: 'FUEGOEXCL',
    validUntil: '18 Sep 2026',
    countdownHours: 50,
    isExclusive: true,
    isNew: false,
    dineIn: true,
    takeaway: false,
    onlineOrder: false,
    discountTags: ['50-plus'],
    occasionTags: ['date-night', 'late-night'],
    terms: ['Only on SanFoody', 'Dine-in reservation required'],
  },
  {
    id: 'off-flame-feathers-200',
    restaurantId: 'flame-feathers',
    title: '₹200 OFF',
    discountPercent: 0,
    maxDiscount: 200,
    minOrder: 599,
    couponCode: 'FLAME200',
    validUntil: '22 Sep 2026',
    countdownHours: null,
    isExclusive: false,
    isNew: true,
    dineIn: false,
    takeaway: false,
    onlineOrder: true,
    discountTags: ['flat-100'],
    occasionTags: ['family'],
    terms: ['Delivery orders only', 'Minimum order ₹599'],
  },
  {
    id: 'off-juice-theory-bogo',
    restaurantId: 'juice-theory',
    title: 'Buy 1 Get 1',
    discountPercent: 50,
    maxDiscount: 150,
    minOrder: 199,
    couponCode: 'JUICEBOGO',
    validUntil: '28 Sep 2026',
    countdownHours: 14,
    isExclusive: false,
    isNew: false,
    dineIn: true,
    takeaway: true,
    onlineOrder: true,
    discountTags: ['bogo', 'under-299'],
    occasionTags: ['breakfast', 'late-night'],
    terms: ['Applicable on all juices and smoothies'],
  },
]

export function getOffers(): (Offer & { endsAt: string | null; restaurant: Restaurant })[] {
  return rawOffers
    .map((o) => {
      const restaurant = restaurants.find((r) => r.id === o.restaurantId)
      if (!restaurant) return null
      return { ...o, endsAt: o.countdownHours ? hoursFromNow(o.countdownHours) : null, restaurant }
    })
    .filter((o): o is Offer & { endsAt: string | null; restaurant: Restaurant } => o !== null)
}

export function getOfferById(id: string) {
  return getOffers().find((o) => o.id === id)
}

export const discountFilterChips: { id: string; label: string }[] = [
  { id: '50-plus', label: '50%+ OFF' },
  { id: 'flat-100', label: 'Flat ₹100 OFF' },
  { id: 'under-299', label: 'Under ₹299' },
  { id: 'bogo', label: 'Buy 1 Get 1' },
  { id: 'free-delivery', label: 'Free Delivery' },
  { id: 'no-min', label: 'No Minimum Order' },
]

export const quickCategories: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'best-deals', label: '🔥 Best Deals' },
  { id: 'coupons', label: '🎟️ Coupons' },
  { id: 'new', label: '🆕 New' },
  { id: 'restaurants', label: '🍽️ Restaurants' },
  { id: 'bank', label: '💳 Bank Offers' },
  { id: 'exclusive', label: '⭐ SanFoody Exclusive' },
]

export const occasionOffers: { id: string; title: string; emoji: string }[] = [
  { id: 'birthday', title: 'Birthday Offers', emoji: '🎂' },
  { id: 'date-night', title: 'Date Night Deals', emoji: '❤️' },
  { id: 'family', title: 'Family Deals', emoji: '👨\u200d👩\u200d👧' },
  { id: 'weekend', title: 'Weekend Offers', emoji: '🎉' },
  { id: 'late-night', title: 'Late Night Deals', emoji: '🌙' },
  { id: 'breakfast', title: 'Breakfast Deals', emoji: '☀️' },
]

export interface BankOffer {
  id: string
  bank: string
  method: 'Credit Card' | 'UPI' | 'Bank Offer' | 'Wallet'
  discountLabel: string
  maxDiscount: number
  minTransaction: number
}

export const bankOffers: BankOffer[] = [
  { id: 'hdfc-card', bank: 'HDFC Bank', method: 'Credit Card', discountLabel: '10% instant discount', maxDiscount: 250, minTransaction: 999 },
  { id: 'icici-upi', bank: 'ICICI Bank', method: 'UPI', discountLabel: '5% cashback', maxDiscount: 100, minTransaction: 499 },
  { id: 'sbi-card', bank: 'SBI Card', method: 'Credit Card', discountLabel: '₹150 instant discount', maxDiscount: 150, minTransaction: 799 },
  { id: 'paytm-wallet', bank: 'Paytm Wallet', method: 'Wallet', discountLabel: '15% cashback', maxDiscount: 75, minTransaction: 299 },
  { id: 'gpay-upi', bank: 'Google Pay', method: 'UPI', discountLabel: 'Flat ₹50 off', maxDiscount: 50, minTransaction: 249 },
]
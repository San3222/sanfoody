// pages/OffersPage.tsx
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
    Search, MapPin, Flame, Ticket, Sparkles,
    CreditCard, Store, Heart, Clock,
    ChevronRight, Copy, Check, Star,
    Percent, Gift, Zap, Coffee,
    Calendar, Users, PartyPopper
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Types
interface Offer {
    id: string
    title: string
    description: string
    discount: string
    discountType: 'percentage' | 'flat' | 'bogo' | 'free-delivery'
    image: string
    restaurantName: string
    restaurantRating: number
    cuisine: string
    location: string
    code: string
    minOrder: number
    maxDiscount: number
    validUntil: string
    category: 'best-deals' | 'coupons' | 'bank' | 'exclusive' | 'restaurant' | 'near-you' | 'personalized' | 'new' | 'limited' | 'occasion'
    isNew?: boolean
    isLimited?: boolean
    isExclusive?: boolean
    applicableFor: ('dine-in' | 'takeaway' | 'online')[]
    terms: string[]
}

// Sample offers data
const OFFERS: Offer[] = [
    {
        id: '1',
        title: '40% OFF on Your Order',
        description: 'Enjoy 40% off on your total bill',
        discount: '40% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/the bombey.png',
        restaurantName: 'The Bombay Bistro',
        restaurantRating: 4.7,
        cuisine: 'North Indian',
        location: 'Wadala',
        code: 'SANFOODY40',
        minOrder: 499,
        maxDiscount: 150,
        validUntil: '2026-09-15',
        category: 'best-deals',
        isNew: true,
        applicableFor: ['dine-in', 'takeaway', 'online'],
        terms: ['Valid on orders above ₹499', 'Maximum discount ₹150', 'Cannot be combined with other offers']
    },
    {
        id: '2',
        title: 'Flat ₹100 OFF',
        description: 'Get flat ₹100 discount on your order',
        discount: '₹100 OFF',
        discountType: 'flat',
        image: '/public/images/offers/pizza casa.png',
        restaurantName: 'Pizza Casa',
        restaurantRating: 4.5,
        cuisine: 'Italian',
        location: 'Bandra',
        code: 'FLAT100',
        minOrder: 299,
        maxDiscount: 100,
        validUntil: '2026-08-30',
        category: 'coupons',
        isExclusive: true,
        applicableFor: ['online'],
        terms: ['Minimum order ₹299', 'Valid for online orders only']
    },
    {
        id: '3',
        title: 'Buy 1 Get 1 Free',
        description: 'Buy one item and get another free',
        discount: 'BOGO',
        discountType: 'bogo',
        image:'/public/images/offers/cafe aroma.png',
        restaurantName: 'Cafe Aroma',
        restaurantRating: 4.8,
        cuisine: 'Cafe',
        location: 'Andheri',
        code: 'BOGO1',
        minOrder: 0,
        maxDiscount: 0,
        validUntil: '2026-09-01',
        category: 'best-deals',
        isNew: true,
        applicableFor: ['dine-in', 'takeaway'],
        terms: ['Valid on selected items', 'Maximum 2 free items per order']
    },
    {
        id: '4',
        title: 'HDFC Bank 10% Discount',
        description: '10% instant discount with HDFC Bank cards',
        discount: '10% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/All Partner Restaurant.png',
        restaurantName: 'All Partner Restaurants',
        restaurantRating: 0,
        cuisine: 'All Cuisines',
        location: 'Mumbai',
        code: 'HDFC10',
        minOrder: 999,
        maxDiscount: 250,
        validUntil: '2026-12-31',
        category: 'bank',
        applicableFor: ['online'],
        terms: ['Valid on HDFC Bank credit/debit cards', 'Minimum transaction ₹999', 'Maximum discount ₹250']
    },
    {
        id: '5',
        title: '30% OFF Exclusive Deal',
        description: 'Special deal only on SanFoody',
        discount: '30% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/The Terrace Kitchen.png',
        restaurantName: 'The Terrace Kitchen',
        restaurantRating: 4.9,
        cuisine: 'Continental',
        location: 'Bandra',
        code: 'SANFOODY30',
        minOrder: 599,
        maxDiscount: 200,
        validUntil: '2026-09-20',
        category: 'exclusive',
        isExclusive: true,
        isNew: true,
        applicableFor: ['dine-in', 'online'],
        terms: ['SanFoody exclusive offer', 'Valid on minimum order ₹599']
    },
    {
        id: '6',
        title: 'Free Delivery',
        description: 'Free delivery on your first order',
        discount: 'Free Delivery',
        discountType: 'free-delivery',
        image: '/public/images/offers/urban tadka.png',
        restaurantName: 'Urban Tadka',
        restaurantRating: 4.4,
        cuisine: 'Indian',
        location: 'Powai',
        code: 'FREEDEL',
        minOrder: 199,
        maxDiscount: 0,
        validUntil: '2026-08-25',
        category: 'coupons',
        isNew: true,
        applicableFor: ['online'],
        terms: ['First order only', 'Minimum order ₹199']
    },
    {
        id: '7',
        title: '20% OFF at The Bombay Bistro',
        description: 'Exclusive restaurant offer',
        discount: '20% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/the bombay bistro.png',
        restaurantName: 'The Bombay Bistro',
        restaurantRating: 4.7,
        cuisine: 'North Indian',
        location: 'Wadala',
        code: 'BISTRO20',
        minOrder: 399,
        maxDiscount: 100,
        validUntil: '2026-09-10',
        category: 'restaurant',
        applicableFor: ['dine-in', 'takeaway'],
        terms: ['Valid on orders above ₹399', 'Maximum discount ₹100']
    },
    {
        id: '8',
        title: '25% OFF Italian Cuisine',
        description: 'Special offer on Italian restaurants near you',
        discount: '25% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/italian cuisine.png',
        restaurantName: 'Pizza Casa',
        restaurantRating: 4.5,
        cuisine: 'Italian',
        location: 'Bandra',
        code: 'ITALIAN25',
        minOrder: 499,
        maxDiscount: 200,
        validUntil: '2026-09-05',
        category: 'near-you',
        applicableFor: ['dine-in', 'takeaway', 'online'],
        terms: ['Valid on Italian cuisine orders']
    },
    {
        id: '9',
        title: 'Weekend Special: 50% OFF',
        description: 'Limited time weekend offer',
        discount: '50% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/The Bombay Bistro.png',
        restaurantName: 'Party Palace',
        restaurantRating: 4.6,
        cuisine: 'Multi-Cuisine',
        location: 'Juhu',
        code: 'WEEKEND50',
        minOrder: 699,
        maxDiscount: 300,
        validUntil: '2026-09-30',
        category: 'limited',
        isLimited: true,
        isNew: true,
        applicableFor: ['dine-in'],
        terms: ['Weekend only', 'Maximum group of 6']
    },
    {
        id: '10',
        title: 'Birthday Special: 30% OFF',
        description: 'Celebrate your birthday with us',
        discount: '30% OFF',
        discountType: 'percentage',
        image: '/public/images/offers/bombey resturant.png',
        restaurantName: 'Celebration Hall',
        restaurantRating: 4.8,
        cuisine: 'Multi-Cuisine',
        location: 'Lower Parel',
        code: 'BIRTHDAY30',
        minOrder: 499,
        maxDiscount: 200,
        validUntil: '2026-12-31',
        category: 'occasion',
        applicableFor: ['dine-in'],
        terms: ['Valid on birthday', 'ID proof required', 'Minimum order ₹499']
    }
]

// Quick filter categories
const QUICK_FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'best-deals', label: '🔥 Best Deals' },
    { id: 'coupons', label: '🎟️ Coupons' },
    { id: 'new', label: '🆕 New' },
    { id: 'restaurant', label: '🍽️ Restaurants' },
    { id: 'bank', label: '💳 Bank Offers' },
    { id: 'exclusive', label: '⭐ SanFoody Exclusive' }
]

// Discount filter chips
const DISCOUNT_CHIPS = [
    { id: '50plus', label: '50%+ OFF', value: 50 },
    { id: 'flat100', label: 'Flat ₹100 OFF', value: 100 },
    { id: 'under299', label: 'Under ₹299', value: 299 },
    { id: 'bogo', label: 'Buy 1 Get 1', value: 0 },
    { id: 'free-delivery', label: 'Free Delivery', value: 0 },
    { id: 'no-min', label: 'No Minimum Order', value: 0 }
]

// Occasion filters
const OCCASION_FILTERS = [
    { id: 'birthday', label: '🎂 Birthday Offers', icon: '🎂' },
    { id: 'date-night', label: '❤️ Date Night Deals', icon: '❤️' },
    { id: 'family', label: '👨‍👩‍👧 Family Deals', icon: '👨‍👩‍👧' },
    { id: 'weekend', label: '🎉 Weekend Offers', icon: '🎉' },
    { id: 'late-night', label: '🌙 Late Night Deals', icon: '🌙' },
    { id: 'breakfast', label: '☀️ Breakfast Deals', icon: '☀️' }
]

export function OffersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null)
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    // Timer for limited offers
    const [timeLeft, setTimeLeft] = useState({
        hours: 2,
        minutes: 34,
        seconds: 18
    })

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev
                seconds--
                if (seconds < 0) {
                    seconds = 59
                    minutes--
                    if (minutes < 0) {
                        minutes = 59
                        hours--
                        if (hours < 0) {
                            return { hours: 0, minutes: 0, seconds: 0 }
                        }
                    }
                }
                return { hours, minutes, seconds }
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Filter offers
    const filteredOffers = useMemo(() => {
        let filtered = OFFERS

        // Filter by category
        if (activeFilter !== 'all') {
            filtered = filtered.filter(offer => offer.category === activeFilter)
        }

        // Filter by discount type
        if (selectedDiscount) {
            if (selectedDiscount === '50plus') {
                filtered = filtered.filter(offer =>
                    offer.discountType === 'percentage' &&
                    parseInt(offer.discount) >= 50
                )
            } else if (selectedDiscount === 'flat100') {
                filtered = filtered.filter(offer =>
                    offer.discountType === 'flat' &&
                    parseInt(offer.discount) >= 100
                )
            } else if (selectedDiscount === 'under299') {
                filtered = filtered.filter(offer => offer.minOrder <= 299)
            } else if (selectedDiscount === 'bogo') {
                filtered = filtered.filter(offer => offer.discountType === 'bogo')
            } else if (selectedDiscount === 'free-delivery') {
                filtered = filtered.filter(offer => offer.discountType === 'free-delivery')
            } else if (selectedDiscount === 'no-min') {
                filtered = filtered.filter(offer => offer.minOrder === 0)
            }
        }

        // Filter by occasion
        if (selectedOccasion) {
            // In real app, filter by occasion tags
            filtered = filtered.filter(offer =>
                offer.title.toLowerCase().includes(selectedOccasion)
            )
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim()
            filtered = filtered.filter(offer =>
                offer.title.toLowerCase().includes(query) ||
                offer.restaurantName.toLowerCase().includes(query) ||
                offer.description.toLowerCase().includes(query) ||
                offer.cuisine.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [activeFilter, searchQuery, selectedDiscount, selectedOccasion])

    // Get today's best deals
    const bestDeals = useMemo(() =>
        OFFERS.filter(offer => offer.category === 'best-deals').slice(0, 4),
        []
    )

    // Get exclusive offers
    const exclusiveOffers = useMemo(() =>
        OFFERS.filter(offer => offer.isExclusive),
        []
    )

    // Get new offers
    const newOffers = useMemo(() =>
        OFFERS.filter(offer => offer.isNew).slice(0, 4),
        []
    )

    // Get limited offers
    const limitedOffers = useMemo(() =>
        OFFERS.filter(offer => offer.isLimited),
        []
    )

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 3000)
    }

    return (
        <div className="min-h-screen bg-cream">
            {/* Hero Section */}
            <section className="border-b border-charcoal/5 bg-linear-to-b from-beige/60 to-cream px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl lg:text-5xl">
                        🔥 Delicious Deals, Better Prices
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-warm-gray">
                        Save more on your favourite restaurants with exclusive SanFoody offers.
                    </p>

                    {/* Search Bar */}
                    <div className="mx-auto mt-7 flex max-w-2xl flex-col gap-3 rounded-2xl border border-charcoal/10 bg-white p-2 shadow-soft sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal/80 sm:border-r sm:border-charcoal/10">
                            <MapPin className="h-4 w-4 shrink-0 text-tomato" />
                            Mumbai, Maharashtra
                        </div>
                        <div className="flex flex-1 items-center gap-2 px-3 py-2">
                            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search offers..."
                                aria-label="Search offers"
                                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
                            />
                        </div>
                    </div>

                    {/* Quick Filter Categories */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {QUICK_FILTERS.map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => {
                                    setActiveFilter(filter.id)
                                    setSelectedDiscount(null)
                                    setSelectedOccasion(null)
                                }}
                                aria-pressed={activeFilter === filter.id}
                                className={cn(
                                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                    activeFilter === filter.id
                                        ? 'border-tomato bg-tomato text-cream'
                                        : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
                {/* Today's Best Deals */}
                {activeFilter === 'all' && (
                    <>
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-charcoal">
                                    <Flame className="h-6 w-6 text-orange" />
                                    Today's Best Deals
                                </h2>
                                <p className="text-sm text-warm-gray">Don't miss out on these amazing offers</p>
                            </div>
                            <button className="flex items-center gap-1 text-sm font-semibold text-tomato hover:underline">
                                View All <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {bestDeals.map((offer) => (
                                <OfferCard
                                    key={offer.id}
                                    offer={offer}
                                    onView={() => setSelectedOffer(offer)}
                                />
                            ))}
                        </div>

                        {/* Discount Filter Chips */}
                        <div className="mt-8 flex flex-wrap gap-2">
                            {DISCOUNT_CHIPS.map((chip) => (
                                <button
                                    key={chip.id}
                                    onClick={() => setSelectedDiscount(selectedDiscount === chip.id ? null : chip.id)}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors',
                                        selectedDiscount === chip.id
                                            ? 'border-tomato bg-tomato text-cream'
                                            : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato'
                                    )}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        {/* Exclusive Coupons Section */}
                        <div className="mt-16">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-charcoal">
                                        <Ticket className="h-6 w-6 text-tomato" />
                                        Exclusive Coupons
                                    </h2>
                                    <p className="text-sm text-warm-gray">Save more with these special coupons</p>
                                </div>
                                <button className="flex items-center gap-1 text-sm font-semibold text-tomato hover:underline">
                                    View All <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {OFFERS.filter(o => o.category === 'coupons').slice(0, 3).map((offer) => (
                                    <CouponCard
                                        key={offer.id}
                                        offer={offer}
                                        onCopy={handleCopyCode}
                                        copied={copiedCode === offer.code}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bank & Payment Offers */}
                        <div className="mt-16">
                            <h2 className="mb-6 font-display text-2xl font-bold text-charcoal">
                                💳 Payment Offers
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {OFFERS.filter(o => o.category === 'bank').slice(0, 4).map((offer) => (
                                    <BankOfferCard key={offer.id} offer={offer} />
                                ))}
                            </div>
                        </div>

                        {/* SanFoody Exclusive */}
                        <div className="mt-16">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-charcoal">
                                        <Sparkles className="h-6 w-6 text-gold" />
                                        Exclusive on SanFoody
                                    </h2>
                                    <p className="text-sm text-warm-gray">Special deals you won't find elsewhere</p>
                                </div>
                                <button className="flex items-center gap-1 text-sm font-semibold text-tomato hover:underline">
                                    View All <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {exclusiveOffers.slice(0, 3).map((offer) => (
                                    <ExclusiveOfferCard key={offer.id} offer={offer} />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Filtered Results */}
                {activeFilter !== 'all' && (
                    <div>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-display text-xl font-bold text-charcoal">
                                    {QUICK_FILTERS.find(f => f.id === activeFilter)?.label}
                                </h2>
                                <p className="text-sm text-warm-gray">
                                    {filteredOffers.length} offers found
                                </p>
                            </div>

                            {/* Clear filters */}
                            {(selectedDiscount || selectedOccasion) && (
                                <button
                                    onClick={() => {
                                        setSelectedDiscount(null)
                                        setSelectedOccasion(null)
                                    }}
                                    className="flex items-center gap-1 text-sm text-tomato hover:underline"
                                >
                                    <span>Clear Filters</span>
                                </button>
                            )}
                        </div>

                        {/* Occasion filters */}
                        {activeFilter === 'occasion' && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {OCCASION_FILTERS.map((occasion) => (
                                    <button
                                        key={occasion.id}
                                        onClick={() => setSelectedOccasion(selectedOccasion === occasion.id ? null : occasion.id)}
                                        className={cn(
                                            'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                            selectedOccasion === occasion.id
                                                ? 'border-tomato bg-tomato text-cream'
                                                : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato'
                                        )}
                                    >
                                        {occasion.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Results grid */}
                        {filteredOffers.length === 0 ? (
                            <div className="py-16 text-center">
                                <p className="text-warm-gray">No offers found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedDiscount(null)
                                        setSelectedOccasion(null)
                                        setActiveFilter('all')
                                    }}
                                    className="mt-4 text-sm font-semibold text-tomato hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <AnimatePresence mode="popLayout">
                                    {filteredOffers.map((offer) => (
                                        <motion.div
                                            key={offer.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <OfferCard
                                                offer={offer}
                                                onView={() => setSelectedOffer(offer)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* Limited-Time Deals */}
                {activeFilter === 'all' && limitedOffers.length > 0 && (
                    <div className="mt-16">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-charcoal">
                                    <Zap className="h-6 w-6 text-tomato" />
                                    Ending Soon
                                </h2>
                                <p className="text-sm text-warm-gray">Grab these deals before they're gone</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {limitedOffers.slice(0, 3).map((offer) => (
                                <LimitedOfferCard
                                    key={offer.id}
                                    offer={offer}
                                    timeLeft={timeLeft}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Offer Detail Modal */}
            {selectedOffer && (
                <OfferDetailModal
                    offer={selectedOffer}
                    onClose={() => setSelectedOffer(null)}
                    onCopy={handleCopyCode}
                    copied={copiedCode === selectedOffer.code}
                />
            )}
        </div>
    )
}

// Offer Card Component
function OfferCard({ offer, onView }: { offer: Offer; onView: () => void }) {
    return (
        <div className="group overflow-hidden rounded-2xl border border-charcoal/5 bg-white shadow-soft transition-all hover:shadow-warm">
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={offer.image}
                    alt={offer.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-tomato to-orange px-3 py-1 text-xs font-bold text-white shadow-soft">
                    {offer.discount}
                </div>
                {offer.isNew && (
                    <span className="absolute right-3 top-3 rounded-full bg-fresh-green px-3 py-1 text-xs font-bold text-white shadow-soft">
                        🆕 New
                    </span>
                )}
                {offer.isExclusive && (
                    <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white shadow-soft">
                        ⭐ Exclusive
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-display font-bold text-charcoal group-hover:text-tomato transition-colors">
                    {offer.restaurantName}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-warm-gray">
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        {offer.restaurantRating}
                    </span>
                    <span>·</span>
                    <span>{offer.cuisine}</span>
                    <span>·</span>
                    <span>{offer.location}</span>
                </div>
                <p className="mt-2 text-sm text-charcoal/80">{offer.description}</p>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-warm-gray">
                        Up to ₹{offer.maxDiscount} off
                    </span>
                    <button
                        onClick={onView}
                        className="rounded-full bg-tomato px-4 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Get Offer
                    </button>
                </div>
            </div>
        </div>
    )
}

// Coupon Card Component
function CouponCard({ offer, onCopy, copied }: { offer: Offer; onCopy: (code: string) => void; copied: boolean }) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-charcoal/5 bg-white p-5 shadow-soft">
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-tomato/5 to-orange/5" />

            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-display font-bold text-charcoal">{offer.restaurantName}</h3>
                    <p className="mt-1 text-sm text-warm-gray">{offer.description}</p>
                </div>
                <span className="rounded-full bg-tomato/10 px-3 py-1 text-xs font-bold text-tomato">
                    {offer.discount}
                </span>
            </div>

            <div className="mt-4">
                <div className="flex items-center gap-2 rounded-lg border border-charcoal/10 bg-beige/30 px-3 py-2">
                    <span className="flex-1 font-mono text-sm font-bold text-charcoal tracking-wider">
                        {offer.code}
                    </span>
                    <button
                        onClick={() => onCopy(offer.code)}
                        className="flex items-center gap-1 rounded-full bg-tomato px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-tomato/80"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3 w-3" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-3 w-3" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-warm-gray">
                <span>Min. ₹{offer.minOrder}</span>
                <span>·</span>
                <span>Max. ₹{offer.maxDiscount}</span>
                <span>·</span>
                <span>Valid until {offer.validUntil}</span>
            </div>
        </div>
    )
}

// Bank Offer Card
function BankOfferCard({ offer }: { offer: Offer }) {
    return (
        <div className="rounded-2xl border border-charcoal/5 bg-white p-5 shadow-soft transition-all hover:shadow-warm">
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-tomato/10 p-3">
                    <CreditCard className="h-6 w-6 text-tomato" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-charcoal">{offer.restaurantName}</h3>
                    <p className="mt-1 text-sm text-warm-gray">{offer.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="font-bold text-tomato">{offer.discount}</span>
                        <span className="text-warm-gray">·</span>
                        <span className="text-warm-gray">Min ₹{offer.minOrder}</span>
                    </div>
                    <button className="mt-3 text-sm font-semibold text-tomato hover:underline">
                        View Offer →
                    </button>
                </div>
            </div>
        </div>
    )
}

// Exclusive Offer Card
function ExclusiveOfferCard({ offer }: { offer: Offer }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-gradient-to-br from-gold/5 to-tomato/5 p-6 shadow-soft transition-all hover:shadow-warm">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />

            <div className="flex items-start justify-between">
                <div>
                    <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">
                        <Sparkles className="h-3 w-3" />
                        Exclusive
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold text-charcoal">
                        {offer.discount}
                    </h3>
                    <p className="mt-1 text-sm text-warm-gray">{offer.description}</p>
                </div>
                <div className="rounded-full bg-white p-2 shadow-soft">
                    <Store className="h-5 w-5 text-tomato" />
                </div>
            </div>

            <div className="mt-4">
                <p className="font-semibold text-charcoal">{offer.restaurantName}</p>
                <p className="text-sm text-warm-gray">{offer.location}</p>
            </div>

            <button className="mt-4 w-full rounded-full bg-gradient-to-r from-tomato to-orange py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Claim Deal
            </button>
        </div>
    )
}

// Limited Offer Card
function LimitedOfferCard({ offer, timeLeft }: { offer: Offer; timeLeft: { hours: number; minutes: number; seconds: number } }) {
    const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

    return (
        <div className="relative overflow-hidden rounded-2xl border border-charcoal/5 bg-white p-6 shadow-soft">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-tomato/5 blur-2xl" />

            <div className="flex items-start justify-between">
                <div>
                    <span className="flex items-center gap-1 rounded-full bg-tomato px-3 py-1 text-xs font-bold text-white">
                        <Zap className="h-3 w-3" />
                        Limited Time
                    </span>
                    <h3 className="mt-3 font-display text-xl font-bold text-charcoal">
                        {offer.discount}
                    </h3>
                    <p className="text-sm text-warm-gray">{offer.restaurantName}</p>
                </div>
                <span className="rounded-full bg-tomato/10 px-3 py-1 text-xs font-bold text-tomato">
                    {offer.discount}
                </span>
            </div>

            {/* Countdown Timer */}
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-charcoal/5 p-3">
                <Clock className="h-5 w-5 text-tomato" />
                <div className="flex gap-1 font-mono text-lg font-bold text-charcoal">
                    <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-tomato">:</span>
                    <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-tomato">:</span>
                    <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
            </div>

            <button
                disabled={isExpired}
                className={cn(
                    'mt-4 w-full rounded-full py-2.5 text-sm font-semibold transition-all',
                    isExpired
                        ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-tomato to-orange text-white hover:scale-[1.02] active:scale-[0.98]'
                )}
            >
                {isExpired ? 'Expired' : 'Grab Deal'}
            </button>
        </div>
    )
}

// Offer Detail Modal
function OfferDetailModal({
    offer,
    onClose,
    onCopy,
    copied
}: {
    offer: Offer
    onClose: () => void
    onCopy: (code: string) => void
    copied: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full bg-charcoal/5 p-2 text-charcoal/60 hover:bg-charcoal/10"
                >
                    ✕
                </button>

                <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                        src={offer.image}
                        alt={offer.title}
                        className="h-48 w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-tomato to-orange px-4 py-1.5 text-sm font-bold text-white shadow-soft">
                        {offer.discount}
                    </div>
                </div>

                <h2 className="font-display text-2xl font-bold text-charcoal">
                    {offer.restaurantName}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-warm-gray">
                    <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        {offer.restaurantRating}
                    </span>
                    <span>·</span>
                    <span>{offer.cuisine}</span>
                    <span>·</span>
                    <span>{offer.location}</span>
                </div>

                <div className="mt-4 rounded-2xl bg-beige/30 p-4">
                    <p className="text-sm font-semibold text-charcoal">{offer.description}</p>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-charcoal/5 pb-3">
                        <span className="text-sm text-warm-gray">Coupon Code</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-charcoal">{offer.code}</span>
                            <button
                                onClick={() => onCopy(offer.code)}
                                className="flex items-center gap-1 rounded-full bg-tomato px-3 py-1 text-xs font-semibold text-white"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-charcoal/5 pb-3">
                        <span className="text-sm text-warm-gray">Minimum Order</span>
                        <span className="font-semibold text-charcoal">₹{offer.minOrder}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-charcoal/5 pb-3">
                        <span className="text-sm text-warm-gray">Maximum Discount</span>
                        <span className="font-semibold text-charcoal">₹{offer.maxDiscount}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-charcoal/5 pb-3">
                        <span className="text-sm text-warm-gray">Valid Until</span>
                        <span className="font-semibold text-charcoal">{offer.validUntil}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-warm-gray">Applicable For</span>
                        <div className="flex gap-2">
                            {offer.applicableFor.map((type) => (
                                <span key={type} className="rounded-full bg-fresh-green/10 px-2 py-0.5 text-xs font-medium text-fresh-green">
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-charcoal">Terms & Conditions</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-warm-gray">
                        {offer.terms.map((term, index) => (
                            <li key={index}>{term}</li>
                        ))}
                    </ul>
                </div>

                <button className="mt-6 w-full rounded-full bg-gradient-to-r from-tomato to-orange py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    View Restaurant
                </button>
            </motion.div>
        </div>
    )
}
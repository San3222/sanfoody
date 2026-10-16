import { useMemo, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import {
    bankOffers,
    discountFilterChips,
    quickCategories,
} from '@/data/offers'
import { useOffers } from '@/api/Hooks'
import { OfferCard } from '@/apps/customer/components/offers/OfferCard'
import { CouponCard } from '@/apps/customer/components/offers/CouponCard'
import { BankOfferCard } from '@/apps/customer/components/offers/BankofferCard'
import { EndingSoonCard } from '@/apps/customer/components/offers/EndingSoonCard'
import { RestaurantOffersList } from '@/apps/customer/components/offers/RestaurantOffersList'
import { OccasionOfferGrid } from '@/apps/customer/components/offers/OccasionOfferGrid'
import { cn } from '@/lib/utils'
import { PageSkeleton } from '@/components/shared/Skeleton'

const SECTION_ID: Record<string, string> = {
    'best-deals': 'best-deals',
    coupons: 'coupons',
    new: 'best-deals',
    restaurants: 'restaurant-offers',
    bank: 'bank-offers',
    exclusive: 'exclusive',
}

const toOfferCardOffer = (offer: any) => ({
    ...offer,
    id: offer._id,
    countdownHours: offer.countdownHours ?? 0,
    dineIn: offer.dineIn ?? false,
    takeaway: offer.takeaway ?? false,
    delivery: offer.delivery ?? true,
    discountType: offer.discountType ?? 'percentage',
    terms: offer.terms ?? [],
    restaurant: offer.restaurantId,
}) as any

export function Offers() {
    const { data: offers, isLoading, isError } = useOffers()
    const [query, setQuery] = useState('')
    const [activeQuickFilter, setActiveQuickFilter] = useState('all')
    const [activeDiscountChip, setActiveDiscountChip] = useState<string | null>(null)
    const [activeOccasion, setActiveOccasion] = useState<string | null>(null)

    // ✅ ab `offers` backend se aaya data hai
    const allOffers = useMemo(() => offers || [], [offers])

    const q = query.trim().toLowerCase()
    const searchFiltered = useMemo(
        () =>
            q === ''
                ? allOffers
                : allOffers.filter(
                    (o) =>
                        (o.restaurantId?.name || '').toLowerCase().includes(q) ||
                        (o.restaurantId?.cuisine || []).some((c: string) => c.toLowerCase().includes(q)) ||
                        o.title.toLowerCase().includes(q),
                ),
        [allOffers, q],
    )

    const bestDeals = useMemo(() => {
        let list = [...searchFiltered].sort(
            (a, b) => b.discountPercent + b.maxDiscount - (a.discountPercent + a.maxDiscount),
        )
        if (activeQuickFilter === 'new') list = list.filter((o) => o.isNew)
        if (activeQuickFilter === 'exclusive') list = list.filter((o) => o.isExclusive)
        if (activeOccasion) list = list.filter((o) => (o.occasionTags || []).includes(activeOccasion as (typeof o.occasionTags)[number]))
        return list.slice(0, 8)
    }, [searchFiltered, activeQuickFilter, activeOccasion])

    const exclusiveOffers = useMemo(() => searchFiltered.filter((o) => o.isExclusive), [searchFiltered])
    const endingSoon = useMemo(() => searchFiltered.filter((o) => o.validUntil && new Date(o.validUntil) > new Date()), [searchFiltered])
    const nearYou = useMemo(
        () =>
            searchFiltered
                .filter((o) => o.restaurantId?.distanceKm <= 2)
                .sort((a, b) => (a.restaurantId?.distanceKm || 0) - (b.restaurantId?.distanceKm || 0)),
        [searchFiltered],
    )
    const recommended = useMemo(
        () => searchFiltered.filter((o) => (o.restaurantId?.cuisines || []).includes('Japanese')).slice(0, 3),
        [searchFiltered],
    )
    const biggestDiscounts = useMemo(
        () =>
            activeDiscountChip
                ? searchFiltered.filter((o) => (o.discountTags || []).includes(activeDiscountChip as (typeof o.discountTags)[number]))
                : [...searchFiltered].sort((a, b) => b.discountPercent - a.discountPercent),
        [searchFiltered, activeDiscountChip],
    )

    const scrollTo = (id: string) =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })


    if (isLoading) {
        return <PageSkeleton />
    }

    if (isError) {
        return <p className="text-warm-gray">Couldn't load offers. Please try again.</p>
    }

    return (
        <div>
            {/* Hero */}
            <section className="border-b border-charcoal/5 bg-linear-to-b from-beige/60 to-cream px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl lg:text-5xl">
                        🔥 Delicious Deals, Better Prices
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-warm-gray">
                        Save more on your favourite restaurants with exclusive SanFoody offers.
                    </p>

                    <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 rounded-2xl border border-charcoal/10 bg-white p-2 shadow-soft sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal/80 sm:border-r sm:border-charcoal/10">
                            <MapPin className="h-4 w-4 shrink-0 text-tomato" />
                            Mumbai
                        </div>
                        <div className="flex flex-1 items-center gap-2 px-3 py-2">
                            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search offers…"
                                aria-label="Search offers"
                                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {quickCategories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setActiveQuickFilter(cat.id)
                                    if (cat.id !== 'all') scrollTo(SECTION_ID[cat.id])
                                }}
                                aria-pressed={activeQuickFilter === cat.id}
                                className={cn(
                                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                    activeQuickFilter === cat.id
                                        ? 'border-tomato bg-tomato text-cream'
                                        : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
                {/* Today's Best Deals */}
                <div id="best-deals" className="mb-16 scroll-mt-24">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
                        🔥 Today&rsquo;s Best Deals
                    </h2>
                    <p className="mb-6 text-sm text-warm-gray">
                        {activeOccasion ? 'Filtered for the occasion you picked below.' : 'Handpicked, highest-value offers right now.'}
                    </p>
                    {bestDeals.length === 0 ? (
                        <p className="text-warm-gray">No deals match right now — try clearing a filter.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {bestDeals.map((offer) => (
                                <OfferCard key={offer._id} offer={toOfferCardOffer(offer)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Exclusive Coupons */}
                <div id="coupons" className="mb-16 scroll-mt-24">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">🎟️ Exclusive Coupons</h2>
                    <p className="mb-6 text-sm text-warm-gray">Copy a code, apply it at checkout.</p>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {searchFiltered.slice(0, 6).map((offer) => (
                            <CouponCard key={offer._id} offer={toOfferCardOffer(offer)} />
                        ))}
                    </div>
                </div>

                {/* Biggest Discounts */}
                <div className="mb-16">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">💰 Biggest Discounts</h2>
                    <p className="mb-5 text-sm text-warm-gray">Narrow it down by exactly what you&rsquo;re looking for.</p>
                    <div className="mb-6 flex flex-wrap gap-2">
                        {discountFilterChips.map((chip) => (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => setActiveDiscountChip(activeDiscountChip === chip.id ? null : chip.id)}
                                aria-pressed={activeDiscountChip === chip.id}
                                className={cn(
                                    'rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                                    activeDiscountChip === chip.id
                                        ? 'border-tomato bg-tomato text-cream'
                                        : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                                )}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                    {biggestDiscounts.length === 0 ? (
                        <p className="text-warm-gray">No offers match this filter yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {biggestDiscounts.slice(0, 8).map((offer) => (
                                <OfferCard key={offer._id} offer={toOfferCardOffer(offer)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* SanFoody Exclusive */}
                <div id="exclusive" className="mb-16 scroll-mt-24">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">⭐ Exclusive on SanFoody</h2>
                    <p className="mb-6 text-sm text-warm-gray">Special deals you won&rsquo;t find elsewhere.</p>
                    {exclusiveOffers.length === 0 ? (
                        <p className="text-warm-gray">No exclusive deals match your search.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {exclusiveOffers.map((offer) => (
                                <OfferCard key={offer._id} offer={toOfferCardOffer(offer)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Bank & Payment Offers */}
                <div id="bank-offers" className="mb-16 scroll-mt-24">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">💳 Payment Offers</h2>
                    <p className="mb-6 text-sm text-warm-gray">Extra savings from your bank or wallet.</p>
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
                        {bankOffers.map((offer) => (
                            <BankOfferCard key={offer.id} offer={offer} />
                        ))}
                    </div>
                </div>

                {/* Offers Near You */}
                <div className="mb-16">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">📍 Offers Near You</h2>
                    <p className="mb-6 text-sm text-warm-gray">Within 2 km of Mumbai city centre.</p>
                    {nearYou.length === 0 ? (
                        <p className="text-warm-gray">No nearby offers match your search.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {nearYou.map((offer) => (
                                <OfferCard key={offer._id} offer={toOfferCardOffer(offer)} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Restaurant Offers */}
                <div id="restaurant-offers" className="mb-16 scroll-mt-24">
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">🍽️ Restaurant Offers</h2>
                    <p className="mb-6 text-sm text-warm-gray">Browse offers restaurant by restaurant.</p>
                    <RestaurantOffersList offers={searchFiltered.map((o) => toOfferCardOffer(o))} />
                </div>

                {/* Recommended For You */}
                {recommended.length > 0 && (
                    <div className="mb-16">
                        <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">❤️ Picked For You</h2>
                        <p className="mb-6 text-sm text-warm-gray">Because you love Japanese food…</p>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {recommended.map((offer) => (
                                <OfferCard key={offer._id} offer={toOfferCardOffer(offer)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Ending Soon */}
                {endingSoon.length > 0 && (
                    <div className="mb-16">
                        <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">⚡ Ending Soon</h2>
                        <p className="mb-6 text-sm text-warm-gray">Grab these before the clock runs out.</p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {endingSoon.map((offer) => (
                                <EndingSoonCard
                                    key={offer._id}
                                    offer={{ ...toOfferCardOffer(offer), endsAt: offer.validUntil }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Occasion Deals */}
                <div>
                    <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">🎉 Special Occasions</h2>
                    <p className="mb-6 text-sm text-warm-gray">Tap one to filter Today&rsquo;s Best Deals up top.</p>
                    <OccasionOfferGrid
                        active={activeOccasion}
                        onSelect={(id) => {
                            setActiveOccasion(id)
                            scrollTo('best-deals')
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
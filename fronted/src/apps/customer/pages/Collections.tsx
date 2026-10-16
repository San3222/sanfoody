import { useMemo, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { collectionGroups, resolveCollections, budgetCollections, offerCollections } from '@/data/collections'
import type { CollectionGroupId } from '@/data/collections'
import { useRestaurants } from '@/api/Hooks'   // 🔥 add
import { CollectionScrollRow } from '@/apps/customer/components/collections/CollectionScrollRow'
import { CollectionCard } from '@/apps/customer/components/collections/CollectionCard'
import { cn } from '@/lib/utils'

const TABS: { id: 'all' | CollectionGroupId; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '✨' },
    ...collectionGroups.map((g) => ({ id: g.id, label: g.label, icon: g.icon })),
]

export function Collections() {
    const [query, setQuery] = useState('')
    const [tab, setTab] = useState<'all' | CollectionGroupId>('all')

    const { data: liveRestaurants } = useRestaurants()

    const allCollections = useMemo(
        () => resolveCollections(liveRestaurants),
        [liveRestaurants],
    )
    const budget = useMemo(() => budgetCollections(liveRestaurants), [liveRestaurants])
    const offers = useMemo(() => offerCollections(liveRestaurants), [liveRestaurants])

    const q = query.trim().toLowerCase()
    const searching = q.length > 0

    const filteredForSearch = useMemo(
        () => allCollections.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)),
        [allCollections, q],
    )

    const groupItems = (groupId: CollectionGroupId) => allCollections.filter((c) => c.groupId === groupId)

    return (
        <div>
            {/* Hero */}
            <section className="border-b border-charcoal/5 bg-linear-om-beige/60 to-cream px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl lg:text-5xl">
                        Discover Something Delicious
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-warm-gray">
                        Handpicked collections for every mood, occasion and craving.
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
                                placeholder="Search collections…"
                                aria-label="Search collections"
                                className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                aria-pressed={tab === t.id}
                                className={cn(
                                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                                    tab === t.id
                                        ? 'border-tomato bg-tomato text-cream'
                                        : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-tomato/40 hover:text-tomato',
                                )}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
                {searching ? (
                    filteredForSearch.length === 0 ? (
                        <p className="py-16 text-center text-warm-gray">No collections match &ldquo;{query}&rdquo;.</p>
                    ) : (
                        <>
                            <h2 className="mb-6 font-display text-xl font-bold text-charcoal">
                                {filteredForSearch.length} result{filteredForSearch.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
                            </h2>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredForSearch.map((c) => (
                                    <CollectionCard key={c.id} collection={c} />
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    <>
                        {(tab === 'all' || tab === 'trending') && (
                            <CollectionScrollRow icon="🔥" title="Trending on SanFoody" collections={groupItems('trending')} />
                        )}
                        {(tab === 'all' || tab === 'mood') && (
                            <CollectionScrollRow
                                icon="😋"
                                title="What are you in the mood for?"
                                collections={groupItems('mood')}
                            />
                        )}
                        {(tab === 'all' || tab === 'cuisine') && (
                            <CollectionScrollRow icon="🍕" title="Explore by Cuisine" collections={groupItems('cuisine')} />
                        )}
                        {(tab === 'all' || tab === 'occasion') && (
                            <CollectionScrollRow
                                icon="🎉"
                                title="Perfect for Every Occasion"
                                collections={groupItems('occasion')}
                            />
                        )}
                        {(tab === 'all' || tab === 'location') && (
                            <CollectionScrollRow icon="📍" title="Explore Mumbai" collections={groupItems('location')} />
                        )}
                        {(tab === 'all' || tab === 'picks') && (
                            <CollectionScrollRow
                                icon="⭐"
                                title="SanFoody Picks"
                                subtitle="Our editors' handpicked recommendations."
                                collections={groupItems('picks')}
                            />
                        )}

                        {tab === 'all' && budget.length > 0 && (
                            <div className="mb-14">
                                <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
                                    💰 Great Food. Great Price.
                                </h2>
                                <p className="mb-5 text-sm text-warm-gray">Budget-friendly picks that don&rsquo;t skimp on flavor.</p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {budget.map((b) => (
                                        <a
                                            key={b.id}
                                            href="#restaurant-results"
                                            className="rounded-2xl border border-charcoal/10 bg-white p-4 text-center shadow-soft transition-shadow hover:shadow-warm"
                                        >
                                            <p className="font-display text-lg font-bold text-charcoal">{b.title}</p>
                                            <p className="mt-1 text-xs text-warm-gray">{b.restaurants.length} restaurants</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'all' && offers.length > 0 && (
                            <div>
                                <h2 className="mb-1 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
                                    🔥 Eat More, Spend Less
                                </h2>
                                <p className="mb-5 text-sm text-warm-gray">Live offers across SanFoody restaurants.</p>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {offers.map((o) => (
                                        <div
                                            key={o.id}
                                            className="rounded-2xl border border-charcoal/10 bg-white p-4 text-center shadow-soft"
                                        >
                                            <p className="font-display text-lg font-bold text-charcoal">{o.title}</p>
                                            <p className="mt-1 text-xs text-warm-gray">{o.restaurants.length} restaurants</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
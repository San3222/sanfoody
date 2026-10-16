import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X, Clock, TrendingUp, Flame, Star, MapPin } from 'lucide-react'
import { searchData } from '@/data/testimonials'
import { categories } from '@/data/categories'
import { useSearch } from '@/api/Hooks'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { data: searchResults, isLoading } = useSearch(query)

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-20 z-70 mx-auto max-w-2xl overflow-hidden rounded-3xl bg-cream shadow-warm sm:inset-x-0"
          >
            <div className="flex items-center gap-3 border-b border-charcoal/10 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-warm-gray" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search restaurants, dishes, offers..."
                className="w-full bg-transparent text-base text-charcoal placeholder:text-warm-gray focus:outline-none"
              />
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close search"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
              {/* 🔥 Search Results */}
              {query.trim() && (
                <div className="mb-6">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-12 rounded-xl bg-charcoal/8 animate-pulse" />
                      <div className="h-12 rounded-xl bg-charcoal/8 animate-pulse" />
                      <div className="h-12 rounded-xl bg-charcoal/8 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {/* // Restaurants Results */}
                      {(searchResults?.restaurants?.length ?? 0) > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">Restaurants</p>
                          <div className="space-y-2">
                            {searchResults?.restaurants?.map((restaurant: any) => (
                              <Link
                                key={restaurant._id || restaurant.id}
                                to={`/restaurants/${restaurant._id || restaurant.id}`}  // 🔥 Dono handle karo
                                onClick={handleClose}
                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-beige/50"
                              >
                                <img src={restaurant.image} alt={restaurant.name} className="h-10 w-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-sm font-semibold text-charcoal">{restaurant.name}</p>
                                  <p className="text-xs text-warm-gray">
                                    <Star className="inline h-3 w-3 fill-gold text-gold" /> {restaurant.rating} · {restaurant.cuisine?.join(', ')}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* // Menu Items Results */}
                      {(searchResults?.menuItems?.length ?? 0) > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">Dishes</p>
                          <div className="space-y-2">
                            {searchResults?.menuItems?.map((item: any) => (
                              <Link
                                key={item._id}
                                to={`/restaurants/${item.restaurantId?._id || item.restaurantId?.id || item.restaurantId}`}  // 🔥 Dono handle karo
                                onClick={handleClose}
                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-beige/50"
                              >
                                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                                <div>
                                  <p className="text-sm font-semibold text-charcoal">{item.name}</p>
                                  <p className="text-xs text-warm-gray">₹{item.price} · {item.restaurantId?.name}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Offers Results */}
                      {(searchResults?.offers?.length ?? 0) > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">Offers</p>
                          <div className="space-y-2">
                            {searchResults?.offers?.map((offer: any) => (
                              <Link
                                key={offer._id}
                                to={`/offers/${offer._id}`}
                                onClick={handleClose}
                                className="flex items-center gap-3 rounded-xl p-2 hover:bg-beige/50"
                              >
                                <div className="grid h-10 w-10 place-items-center rounded-lg bg-tomato/10">
                                  <Flame className="h-5 w-5 text-tomato" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-charcoal">{offer.title}</p>
                                  <p className="text-xs text-warm-gray">{offer.couponCode} · {offer.restaurantId?.name}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Results */}
                      {!isLoading &&
                        searchResults?.restaurants?.length === 0 &&
                        searchResults?.menuItems?.length === 0 &&
                        searchResults?.offers?.length === 0 && (
                          <p className="py-8 text-center text-warm-gray">
                            No results found for "{query}"
                          </p>
                        )}
                    </>
                  )}
                </div>
              )}

              {/* Popular Searches (Jab query empty ho) */}
              {!query.trim() && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-6"
                  >
                    <SectionLabel icon={Clock} label="Recent searches" />
                    <ChipRow items={searchData.recent} onPick={setQuery} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                  >
                    <SectionLabel icon={Flame} label="Popular searches" />
                    <ChipRow items={searchData.popular} onPick={setQuery} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6"
                  >
                    <SectionLabel icon={TrendingUp} label="Trending now" />
                    <ChipRow items={searchData.trending} onPick={setQuery} />
                  </motion.div>

                  <div>
                    <SectionLabel label="Categories" />
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setQuery(c.name)}
                          className="flex items-center gap-1.5 rounded-full border border-charcoal/10 bg-white px-3.5 py-1.5 text-sm font-medium text-charcoal/80 hover:border-tomato/40 hover:text-tomato"
                        >
                          <span>{c.emoji}</span>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SectionLabel({ icon: Icon, label }: { icon?: React.ElementType; label: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warm-gray">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </div>
  )
}

function ChipRow({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="rounded-full bg-beige px-3.5 py-1.5 text-sm font-medium text-charcoal/80 hover:bg-tomato/10 hover:text-tomato"
        >
          {item}
        </button>
      ))}
    </div>
  )
}
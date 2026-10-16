import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, X, Search, Check } from 'lucide-react'
import { useCity } from '@/hooks/useCity'
import { CITIES } from '@/data/cities'
import { cn } from '@/lib/utils'

export function CitySelector() {
  const { city, setCity } = useCity()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (cityId: string) => {
    setCity(cityId)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-white hover:text-tomato"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">{city}</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-cream shadow-warm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-tomato" />
                  <h2 className="font-display text-lg font-bold text-charcoal">
                    Choose City
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="border-b border-charcoal/10 px-5 py-3">
                <div className="flex items-center gap-2 rounded-xl border border-charcoal/15 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-warm-gray" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search city or state..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                    autoFocus
                  />
                </div>
              </div>

              {/* City List */}
              <div className="max-h-[60vh] overflow-y-auto p-3">
                {/* Popular */}
                {!search && (
                  <div className="mb-4">
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-warm-gray">
                      Popular Cities
                    </p>
                    <div className="space-y-1">
                      {CITIES.filter((c) => c.popular).map((c) => (
                        <CityRow
                          key={c.id}
                          city={c}
                          isSelected={c.id === city}
                          onSelect={() => handleSelect(c.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Cities */}
                <div>
                  {!search && (
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-warm-gray">
                      All Cities
                    </p>
                  )}
                  <div className="space-y-1">
                    {filtered.map((c) => (
                      <CityRow
                        key={c.id}
                        city={c}
                        isSelected={c.id === city}
                        onSelect={() => handleSelect(c.id)}
                      />
                    ))}
                  </div>
                  {filtered.length === 0 && (
                    <div className="py-12 text-center">
                      <MapPin className="mx-auto h-10 w-10 text-charcoal/20" />
                      <p className="mt-3 text-sm text-warm-gray">
                        No cities match "{search}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================
// City Row
// ============================================

function CityRow({
  city,
  isSelected,
  onSelect,
}: {
  city: { id: string; name: string; state: string; emoji: string }
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        isSelected ? 'bg-tomato/10' : 'hover:bg-beige/60'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{city.emoji}</span>
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              isSelected ? 'text-tomato' : 'text-charcoal'
            )}
          >
            {city.name}
          </p>
          <p className="text-xs text-warm-gray">{city.state}</p>
        </div>
      </div>
      {isSelected && (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-tomato text-cream">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  )
}
import { filterGroupLabels, filterGroups } from '@/data/restaurants'
import type { FilterGroupKey } from '@/data/restaurants'
import { cn } from '@/lib/utils'

const GROUP_ICON: Record<FilterGroupKey, string> = {
  location: '📍',
  cuisine: '🍴',
  price: '💰',
  rating: '⭐',
  type: '🍽️',
  features: '✨',
  offers: '🔥',
  availability: '🕐',
}

export function RestaurantFilters({
  active,
  onToggle,
  onClear,
}: {
  active: Record<string, boolean>
  onToggle: (value: string) => void
  onClear: () => void
}) {
  const activeCount = Object.values(active).filter(Boolean).length

  return (
    <div className="rounded-3xl border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-charcoal">Filters</h2>
        {activeCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-tomato hover:underline">
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="flex flex-col divide-y divide-charcoal/8">
        {(Object.keys(filterGroups) as FilterGroupKey[]).map((group) => (
          <details key={group} open className="group py-4 first:pt-0 last:pb-0">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-charcoal">
              <span>
                {GROUP_ICON[group]} {filterGroupLabels[group]}
              </span>
              <span className="text-warm-gray transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 flex flex-col gap-2.5">
              {filterGroups[group].map((value) => (
                <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-charcoal/80">
                  <input
                    type="checkbox"
                    checked={!!active[value]}
                    onChange={() => onToggle(value)}
                    className="h-4 w-4 shrink-0 rounded border-charcoal/25 accent-tomato"
                  />
                  <span className={cn(active[value] && 'font-semibold text-tomato')}>{value}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
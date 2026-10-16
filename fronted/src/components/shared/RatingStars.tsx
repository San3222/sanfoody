import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RatingStars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.round(rating) ? 'fill-gold text-gold' : 'text-charcoal/20'
          )}
        />
      ))}
    </div>
  )
}
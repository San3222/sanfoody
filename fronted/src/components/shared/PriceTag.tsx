import { cn } from '@/lib/utils'

export function PriceTag({ price, className }: { price: number; className?: string }) {
  return (
    <span className={cn('font-display font-bold text-charcoal', className)}>
      ₹{price}
    </span>
  )
}
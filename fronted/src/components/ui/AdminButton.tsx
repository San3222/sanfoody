// src/components/ui/AdminButton.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'soft-danger' | 'danger' | 'success' | 'ghost'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  primary: 'bg-tomato text-cream shadow-sm hover:bg-tomato/90',
  secondary:
    'border border-charcoal/10 bg-white text-charcoal shadow-sm hover:border-charcoal/20 hover:bg-beige/60',
  'soft-danger': 'bg-red-50 text-red-600 hover:bg-red-100',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  success: 'bg-green-600 text-white shadow-sm hover:bg-green-700',
  ghost: 'text-charcoal/70 hover:bg-beige hover:text-charcoal',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 gap-2 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  icon: 'h-8 w-8',
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

/** Always lays icon + label out in a single centred row. */
export const AdminButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'secondary', size = 'sm', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/40',
        'disabled:pointer-events-none disabled:opacity-50',
        size === 'icon' ? 'rounded-lg' : 'rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
)
AdminButton.displayName = 'AdminButton'
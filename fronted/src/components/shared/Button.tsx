import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'  // 🔥 'success' add karo
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-linear-to-r from-tomato to-orange text-cream shadow-warm hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'bg-charcoal text-cream hover:bg-charcoal/80',
  outline: 'border border-charcoal/15 text-charcoal hover:border-tomato/40 hover:text-tomato',
  ghost: 'text-charcoal/70 hover:bg-charcoal/5',
  danger: 'bg-tomato text-cream hover:bg-tomato/80',
  success: 'bg-fresh-green text-cream hover:bg-fresh-green/80',  // 🔥 Success variant add karo
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-full font-semibold transition-all disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
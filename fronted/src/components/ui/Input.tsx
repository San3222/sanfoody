import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-charcoal">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato',
          className,
        )}
        {...props}
      />
    </div>
  )
}
import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl border border-charcoal/5 bg-white p-5 shadow-soft', className)}>
      {children}
    </div>
  )
}
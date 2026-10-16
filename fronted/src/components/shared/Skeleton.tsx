import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('animate-pulse rounded-xl bg-charcoal/8', className)} aria-hidden="true" />
}

export function FoodCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
            <Skeleton className="aspect-square w-full rounded-none rounded-t-3xl" />
            <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function RestaurantCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    )
}

export function CategorySkeleton() {
    return (
        <div className="flex w-24 shrink-0 flex-col items-center gap-3 sm:w-28">
            <Skeleton className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
            <Skeleton className="h-3 w-14" />
        </div>
    )
}

export function PageSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-32">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-6 h-10 w-72" />
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <FoodCardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}
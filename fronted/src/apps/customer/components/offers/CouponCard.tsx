import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import type { Offer } from '@/data/offers'
import type { Restaurant } from '@/data/restaurants'

export function CouponCard({ offer }: { offer: Offer & { restaurant: Restaurant } }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(offer.couponCode)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1800)
        } catch {
            // Clipboard API unavailable — the code is still visible to copy manually
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-tomato/30 bg-white p-5 shadow-soft">
            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" aria-hidden="true" />
            <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" aria-hidden="true" />

            <p className="font-display text-lg font-extrabold text-tomato">
                {offer.discountPercent > 0 ? `${offer.discountPercent}% OFF` : offer.title}
            </p>
            <p className="mt-1 text-sm text-warm-gray">
                {offer.minOrder > 0 ? `On orders above ₹${offer.minOrder}` : 'No minimum order'}
            </p>
            <p className="mt-1 text-xs text-warm-gray">{offer.restaurant.name}</p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-charcoal/10 bg-beige/60 px-4 py-2.5">
                <span className="font-display text-sm font-bold tracking-wide text-charcoal">{offer.couponCode}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-cream transition-transform hover:scale-105 active:scale-95"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Code
                        </>
                    )}
                </button>
            </div>

            <Link
                to={`/offers/${offer.id}`}
                className="mt-3 block text-center text-xs font-semibold text-tomato hover:underline"
            >
                View details
            </Link>
        </div>
    )
}
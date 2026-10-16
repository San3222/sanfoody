import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, MapPin, Star, X } from 'lucide-react'
import { getOfferById } from '@/data/offers'
import { CountdownTimer } from '@/apps/customer/components/offers/CountDownTimer'

export function OfferDetail() {
  const { offerId } = useParams<{ offerId: string }>()
  const offer = offerId ? getOfferById(offerId) : undefined
  const [copied, setCopied] = useState(false)

  if (!offer) {
    return <Navigate to="/offers" replace />
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(offer.couponCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API unavailable — the code is still visible to copy manually
    }
  }

  const savingsLine =
    offer.discountPercent > 0
      ? `${offer.discountPercent}% OFF up to ₹${offer.maxDiscount}`
      : offer.maxDiscount > 0
        ? `Flat ₹${offer.maxDiscount} OFF`
        : 'Free delivery on every order'

  return (
    <section className="mx-auto max-w-2xl px-5 py-28 sm:px-8 sm:py-32">
      <Link
        to="/offers"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-warm-gray hover:text-tomato"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Offers
      </Link>

      <div className="overflow-hidden rounded-3xl border border-charcoal/10 bg-white shadow-soft">
        <div className="relative h-44 sm:h-56">
          <img src={offer.restaurant.image} alt={offer.restaurant.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <span className="inline-block rounded-full bg-tomato px-3 py-1 text-xs font-bold text-cream">
              🔥 {offer.title}
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-cream sm:text-3xl">
              {offer.restaurant.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-cream/90">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {offer.restaurant.rating}
              </span>
              <span>🍛 {offer.restaurant.cuisine}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {offer.restaurant.area}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-charcoal/10 p-6">
          <p className="font-display text-xl font-extrabold text-tomato">{savingsLine}</p>

          <p className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-warm-gray">Coupon</p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-tomato/40 bg-beige/60 px-4 py-3">
            <span className="font-display text-base font-bold tracking-wide text-charcoal">
              {offer.couponCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full bg-charcoal px-3.5 py-2 text-xs font-semibold text-cream transition-transform hover:scale-105 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Coupon
                </>
              )}
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-warm-gray">Minimum Order</dt>
              <dd className="font-semibold text-charcoal">
                {offer.minOrder > 0 ? `₹${offer.minOrder}` : 'None'}
              </dd>
            </div>
            <div>
              <dt className="text-warm-gray">Maximum Discount</dt>
              <dd className="font-semibold text-charcoal">
                {offer.maxDiscount > 0 ? `₹${offer.maxDiscount}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-warm-gray">Valid Until</dt>
              <dd className="font-semibold text-charcoal">{offer.validUntil}</dd>
            </div>
            {offer.endsAt && (
              <div>
                <dt className="text-warm-gray">Ends In</dt>
                <dd className="font-semibold text-tomato">
                  <CountdownTimer endsAt={offer.endsAt} />
                </dd>
              </div>
            )}
          </dl>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-warm-gray">Applicable on</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <li className="flex items-center gap-1.5">
              {offer.dineIn ? (
                <Check className="h-4 w-4 text-fresh-green" />
              ) : (
                <X className="h-4 w-4 text-charcoal/30" />
              )}
              Dine-in
            </li>
            <li className="flex items-center gap-1.5">
              {offer.takeaway ? (
                <Check className="h-4 w-4 text-fresh-green" />
              ) : (
                <X className="h-4 w-4 text-charcoal/30" />
              )}
              Takeaway
            </li>
            <li className="flex items-center gap-1.5">
              {offer.onlineOrder ? (
                <Check className="h-4 w-4 text-fresh-green" />
              ) : (
                <X className="h-4 w-4 text-charcoal/30" />
              )}
              Online Order
            </li>
          </ul>

          {offer.terms.length > 0 && (
            <>
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-warm-gray">Terms</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-warm-gray">
                {offer.terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {copied ? 'Copied!' : 'Copy Coupon'}
            </button>
            <Link
              to="/restaurants"
              className="flex-1 rounded-full border border-charcoal/15 py-3 text-center text-sm font-bold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato"
            >
              View Restaurant
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
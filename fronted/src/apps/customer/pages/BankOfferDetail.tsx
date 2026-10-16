import { useParams, Link, Navigate } from 'react-router-dom'
import { CreditCard, Smartphone, Landmark, Wallet, ArrowLeft, Check, X } from 'lucide-react'
import { bankOffers, type BankOffer } from '@/data/offers'

const METHOD_ICON: Record<BankOffer['method'], typeof CreditCard> = {
  'Credit Card': CreditCard,
  UPI: Smartphone,
  'Bank Offer': Landmark,
  Wallet: Wallet,
}

export function BankOfferDetail() {
  const { offerId } = useParams<{ offerId: string }>()
  const offer = bankOffers.find((o) => o.id === offerId)

  if (!offer) {
    return <Navigate to="/offers" replace />
  }

  const Icon = METHOD_ICON[offer.method]

  return (
    <section className="mx-auto max-w-2xl px-5 py-28 sm:px-8 sm:py-32">
      <Link to="/offers" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-warm-gray hover:text-tomato">
        <ArrowLeft className="h-4 w-4" />
        Back to Offers
      </Link>

      <div className="overflow-hidden rounded-3xl border border-charcoal/10 bg-white shadow-soft">
        <div className="bg-linear-to-r from-tomato to-orange p-6 text-cream">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <Icon className="h-5 w-5" />
            {offer.method}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold">{offer.bank}</h1>
          <p className="mt-1 text-cream/90">{offer.discountLabel}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-warm-gray">Maximum Discount</p>
              <p className="font-semibold text-charcoal">₹{offer.maxDiscount}</p>
            </div>
            <div>
              <p className="text-warm-gray">Minimum Transaction</p>
              <p className="font-semibold text-charcoal">₹{offer.minTransaction}</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-display text-lg font-bold text-charcoal">Terms & Conditions</h2>
            <ul className="space-y-2 text-sm text-warm-gray">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green" />
                Valid on {offer.method} transactions only.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green" />
                Minimum transaction of ₹{offer.minTransaction} required.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-fresh-green" />
                Maximum discount of ₹{offer.maxDiscount} per transaction.
              </li>
              <li className="flex items-start gap-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
                Not valid on cash on delivery.
              </li>
            </ul>
          </div>

          <Link
            to="/restaurants"
            className="mt-6 block w-full rounded-full bg-linear-to-r from-tomato to-orange py-3 text-center text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Restaurants
          </Link>
        </div>
      </div>
    </section>
  )
}
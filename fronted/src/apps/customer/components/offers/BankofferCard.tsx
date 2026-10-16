import { CreditCard, Smartphone, Landmark, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BankOffer } from '@/data/offers'

const METHOD_ICON: Record<BankOffer['method'], typeof CreditCard> = {
  'Credit Card': CreditCard,
  UPI: Smartphone,
  'Bank Offer': Landmark,
  Wallet: Wallet,
}

export function BankOfferCard({ offer }: { offer: BankOffer }) {
  const Icon = METHOD_ICON[offer.method]

  return (
    <div className="rounded-3xl border border-charcoal/10 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-warm-gray">
        <Icon className="h-4 w-4" />
        {offer.method}
      </div>
      <h3 className="mt-2 font-display text-lg font-bold text-charcoal">{offer.bank}</h3>
      <p className="mt-1 text-sm font-semibold text-fresh-green">{offer.discountLabel}</p>
      <p className="mt-1 text-xs text-warm-gray">Up to ₹{offer.maxDiscount}</p>
      <p className="mt-2 text-xs text-warm-gray">Min transaction ₹{offer.minTransaction}</p>

      {/* 🔥 Link Banao */}
      <Link
        to={`/offers/bank/${offer.id}`}
        className="mt-4 block w-full rounded-full border border-charcoal/15 py-2.5 text-center text-xs font-semibold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato"
      >
        View Offer
      </Link>
    </div>
  )
}
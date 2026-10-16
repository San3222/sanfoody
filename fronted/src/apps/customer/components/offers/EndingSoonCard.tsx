import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import type { Offer } from '@/data/offers'
import type { Restaurant } from '@/data/restaurants'
import { CountdownTimer } from '@/apps/customer/components/offers/CountDownTimer'

export function EndingSoonCard({ offer }: { offer: Offer & { restaurant: Restaurant; endsAt: string | null } }) {
  if (!offer.endsAt) return null

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-charcoal to-charcoal/90 p-5 text-cream shadow-warm">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tomato px-3 py-1 text-[10px] font-bold uppercase tracking-wide">
        <Zap className="h-3 w-3" />
        Ending Soon
      </span>

      <p className="mt-3 font-display text-2xl font-extrabold">{offer.title}</p>
      <p className="mt-1 text-sm text-cream/80">{offer.restaurant.name}</p>

      <div className="mt-4 rounded-xl bg-cream/10 px-4 py-3 text-center backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-wide text-cream/60">Ends in</p>
        <CountdownTimer endsAt={offer.endsAt} className="font-display text-lg font-bold" />
      </div>

      <Link
        to={`/offers/${offer.id}`}
        className="mt-4 block rounded-full bg-cream py-2.5 text-center text-xs font-bold text-charcoal transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Grab Deal
      </Link>
    </div>
  )
}
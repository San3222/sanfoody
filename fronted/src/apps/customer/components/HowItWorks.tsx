import { motion } from 'motion/react'
import { UtensilsCrossed, ShoppingBag, ChefHat, PartyPopper } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Choose your food',
    description: 'Browse restaurants and dishes curated to your taste and location.',
    icon: UtensilsCrossed,
  },
  {
    number: '02',
    title: 'Place your order',
    description: 'Customize, add to cart, and check out in a couple of taps.',
    icon: ShoppingBag,
  },
  {
    number: '03',
    title: 'We prepare it',
    description: "Your kitchen starts cooking the moment it's confirmed — fresh, not sitting.",
    icon: ChefHat,
  },
  {
    number: '04',
    title: 'Enjoy your meal',
    description: 'Track it live to your door, and dig in while it&rsquo;s still hot.',
    icon: PartyPopper,
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Simple &amp; fast</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">How it works</h2>
      </div>

      <div className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* Connector line — desktop only, order is real here so it earns the numbering */}
        <div className="pointer-events-none absolute inset-x-0 top-9 hidden h-px bg-charcoal/10 lg:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-start"
          >
            <div className="relative z-10 grid h-18 w-18 place-items-center rounded-2xl bg-white shadow-soft ring-4 ring-cream">
              <step.icon className="h-7 w-7 text-tomato" strokeWidth={1.75} />
            </div>
            <span className="mt-4 font-display text-sm font-bold text-orange">{step.number}</span>
            <h3 className="mt-1 font-display text-lg font-bold text-charcoal">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-warm-gray">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

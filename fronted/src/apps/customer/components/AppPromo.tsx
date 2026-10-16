import { motion } from 'motion/react'
import { Download, Star, ShoppingBag, Search } from 'lucide-react'
import { foods } from '@/data/foods'

export function AppPromo() {
  const preview = foods.slice(0, 3)

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Get the app</span>
          <h2 className="mt-2 font-display text-4xl font-extrabold leading-tight text-charcoal sm:text-5xl">
            Your favorite food.
            <br />
            One tap away.
          </h2>
          <p className="mt-4 max-w-md text-warm-gray">
            Live order tracking, saved addresses, and one-tap reordering — everything's faster in the app.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl bg-charcoal px-5 py-3 text-cream transition-transform hover:scale-105"
            >
              <Download className="h-5 w-5" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] text-cream/70">Download on the</span>
                <span className="block text-sm font-bold">App Store</span>
              </span>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-2xl bg-charcoal px-5 py-3 text-cream transition-transform hover:scale-105"
            >
              <Download className="h-5 w-5" />
              <span className="text-left leading-tight">
                <span className="block text-[10px] text-cream/70">Get it on</span>
                <span className="block text-sm font-bold">Google Play</span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 flex justify-center lg:order-2"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-65 rounded-[2.5rem] border-10 border-charcoal bg-charcoal shadow-warm sm:w-75"
          >
            <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-charcoal" />
            <div className="relative h-135 overflow-hidden rounded-[1.75rem] bg-cream">
              {/* Mini in-app header */}
              <div className="flex items-center justify-between bg-linear-to-br from-tomato to-orange px-5 pb-6 pt-8 text-cream">
                <div>
                  <p className="text-[10px] opacity-80">Deliver to</p>
                  <p className="text-xs font-semibold">Bandra West, Mumbai</p>
                </div>
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="-mt-4 mx-4 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-soft">
                <Search className="h-4 w-4 text-warm-gray" />
                <span className="text-xs text-warm-gray">What are you craving?</span>
              </div>

              {/* Mini food list */}
              <div className="flex flex-col gap-3 px-4 py-4">
                {preview.map((food) => (
                  <div key={food.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-soft">
                    <img
                      src={food.image}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-charcoal">{food.name}</p>
                      <p className="flex items-center gap-1 text-[10px] text-warm-gray">
                        <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                        {food.rating} · {food.deliveryTime}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-charcoal">₹{food.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

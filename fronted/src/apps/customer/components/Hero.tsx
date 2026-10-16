import { motion, useReducedMotion, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useParallax } from '@/hooks/useParallax'

// Video files
const HERO_VIDEO_MP4 = '/videos/Chef_finishing.mp4'
const HERO_VIDEO_WEBM = '/videos/Chef_finishing.webm'

const stats = [
  { value: '4.9', label: 'Average rating' },
  { value: '25 min', label: 'Avg. delivery' },
  { value: '500+', label: 'Local bistros' },
]

export function Hero() {
  const { ref, x, y, onMouseMove, onMouseLeave } = useParallax<HTMLElement>()
  const prefersReducedMotion = useReducedMotion()

  // Video parallax effect
  const videoX = useTransform(x, [-0.5, 0.5], [-18, 18])
  const videoY = useTransform(y, [-0.5, 0.5], [-14, 14])

  return (
    <motion.section
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      id="home"
      className="relative isolate flex min-h-svh w-full flex-col items-center justify-end overflow-hidden pb-16 sm:pb-20"
    >
      {/* Sirf Video Background */}
      <div className="absolute inset-0">
        {prefersReducedMotion ? (
          // Agar user reduced motion prefer karta hai, toh image dikhao
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&h=1200&q=80"
            alt="Fresh food being prepared in the kitchen"
            className="h-full w-full object-cover"
          />
        ) : (
          <motion.div style={{ x: videoX, y: videoY }} className="absolute inset-[-3%]">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label="Fresh food being prepared in the kitchen"
            >
              <source src={HERO_VIDEO_WEBM} type="video/webm" />
              <source src={HERO_VIDEO_MP4} type="video/mp4" />
            </video>
          </motion.div>
        )}

        {/* Cream wash at the top for navbar legibility */}
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-cream/95 via-cream/30 to-transparent" />
        {/* Bottom-weighted scrim for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-charcoal/85 via-charcoal/35 to-transparent" />
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-5 text-center sm:px-8"
      >
        <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-cream sm:text-5xl lg:text-6xl">
          Explore Your <span className="text-orange">Palette</span>.
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-cream/85 sm:text-lg">
          Discover globally-inspired flavors, delivered hot and fresh. A new culinary
          experience, every day.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#explore"
            className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-tomato to-orange px-6 py-3 text-sm font-semibold text-cream shadow-warm transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Order a Flavor Adventure
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#offers"
            className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:border-cream/50 hover:bg-cream/20"
          >
            See Offers
          </a>
        </div>

        <dl className="mt-7 flex items-center justify-center gap-5 rounded-full border border-cream/15 bg-cream/10 px-6 py-3 backdrop-blur-sm sm:gap-8 sm:px-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-5 sm:gap-8">
              {i > 0 && <div className="h-7 w-px bg-cream/25" aria-hidden="true" />}
              <div>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-lg font-bold text-cream sm:text-xl">{stat.value}</dd>
                <div className="text-[11px] text-cream/70 sm:text-xs">{stat.label}</div>
              </div>
            </div>
          ))}
        </dl>
      </motion.div>
    </motion.section>
  )
}
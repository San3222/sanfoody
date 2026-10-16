import { useRef } from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'
import { testimonials } from '@/data/testimonials'

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-tomato">Loved by many</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
            What people are saying
          </h2>
          <p className="mt-2 text-sm text-warm-gray">Drag sideways to browse</p>
        </div>
      </div>

      <motion.div ref={trackRef} className="cursor-grab overflow-hidden active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={{ left: -(testimonials.length * 340), right: 0 }}
          dragElastic={0.12}
          className="flex gap-5 px-5 sm:px-8"
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="w-[300px] shrink-0 select-none rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft sm:w-[340px]"
            >
              <div className="mb-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? 'fill-gold text-gold' : 'text-charcoal/10'}`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-charcoal/80">&ldquo;{t.review}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  draggable={false}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-charcoal">{t.name}</div>
                  <div className="text-xs text-warm-gray">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}

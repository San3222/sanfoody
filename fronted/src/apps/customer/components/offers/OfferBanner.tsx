import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { TomatoIcon, ChiliIcon, BasilIcon, CheeseIcon } from '@/apps/customer/components/ingredients'

export function OfferBanner() {
    return (
        <section id="offers" className="mx-auto max-w-7xl px-5 py-4 sm:px-8 sm:py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-4xl bg-linear-to-br from-deep-red via-tomato to-orange px-6 py-14 sm:px-16 sm:py-20"
            >
                {/* Floating garnish, decorative only */}
                <FloatingDecor className="left-6 top-8 h-10 w-10 sm:left-12" delay={0}>
                    <TomatoIcon className="h-full w-full" />
                </FloatingDecor>
                <FloatingDecor className="right-10 top-14 h-8 w-8 sm:right-24" delay={0.6}>
                    <BasilIcon className="h-full w-full" />
                </FloatingDecor>
                <FloatingDecor className="bottom-10 left-16 h-9 w-9 sm:left-32" delay={1.1}>
                    <ChiliIcon className="h-full w-full" />
                </FloatingDecor>
                <FloatingDecor className="bottom-16 right-8 h-9 w-9 sm:right-16" delay={0.3}>
                    <CheeseIcon className="h-full w-full" />
                </FloatingDecor>

                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />

                <div className="relative mx-auto max-w-xl text-center">
                    <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="inline-block rounded-full bg-cream px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-tomato"
                    >
                        Limited-time offer
                    </motion.span>

                    <h2 className="mt-5 font-display text-4xl font-extrabold leading-tight text-cream sm:text-5xl">
                        Feel the flavor.
                        <br />
                        Get 40% off.
                    </h2>
                    <p className="mt-3 text-cream/85">On your first order — no minimum spend, no fine print.</p>

                    <Link
                        to="/offers"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-8 py-3.5 text-sm font-bold text-tomato shadow-warm transition-transform hover:scale-105 active:scale-95"
                    >
                        Order Now
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </motion.div>
        </section>
    )
}

function FloatingDecor({
    children,
    className,
    delay,
}: {
    children: React.ReactNode
    className: string
    delay: number
}) {
    return (
        <motion.div
            aria-hidden="true"
            animate={{ y: [0, -12, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
            className={`absolute opacity-90 drop-shadow-lg ${className}`}
        >
            {children}
        </motion.div>
    )
}
// src/apps/customer/pages/PartnerRestaurant.tsx
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
    Store,
    ArrowRight,
    TrendingUp,
    Users,
    IndianRupee,
    BarChart3,
    ShieldCheck,
    Clock,
    CheckCircle2,
    Sparkles,
    ChefHat,
    Zap,
    Target,
} from 'lucide-react'
import { SEO } from '@/apps/customer/components/SEO'

const STATS = [
    { icon: Store, value: '10,000+', label: 'Partner Restaurants' },
    { icon: Users, value: '5 Million+', label: 'Monthly Orders' },
    { icon: TrendingUp, value: '₹40L+', label: 'Average Annual Revenue' },
    { icon: Target, value: '15+ Cities', label: 'Pan India Presence' },
]

const BENEFITS = [
    {
        icon: TrendingUp,
        title: 'Grow Your Business',
        description:
            'Get access to millions of hungry customers actively looking for great food like yours.',
    },
    {
        icon: IndianRupee,
        title: 'Zero Setup Fee',
        description:
            'List your restaurant for free. Pay only when you get orders — no hidden charges.',
    },
    {
        icon: BarChart3,
        title: 'Analytics Dashboard',
        description:
            'Track orders, revenue, customer reviews, and menu performance in real time.',
    },
    {
        icon: Zap,
        title: 'Fast Payouts',
        description:
            'Weekly payouts directly to your bank account with complete transparency.',
    },
    {
        icon: Users,
        title: 'Dedicated Support',
        description:
            'A dedicated account manager to help you grow and resolve issues fast.',
    },
    {
        icon: ShieldCheck,
        title: 'Trusted Platform',
        description:
            "Join India's most secure and reliable food delivery ecosystem.",
    },
]

const STEPS = [
    {
        number: '01',
        title: 'Sign Up',
        description: 'Register with basic details and documents (FSSAI, GST).',
    },
    {
        number: '02',
        title: 'Verification',
        description: 'Our team verifies your documents within 24-48 hours.',
    },
    {
        number: '03',
        title: 'Setup Menu',
        description: 'Add your dishes, prices, and photos to your online menu.',
    },
    {
        number: '04',
        title: 'Start Earning',
        description: 'Accept orders and start growing your business from day one.',
    },
]

export function PartnerRestaurant() {
    return (
        <>
            <SEO
                title="Partner Your Restaurant — SanFoody"
                description="Join SanFoody as a restaurant partner. Grow your business, reach millions of customers, and manage everything from one dashboard."
            />

            {/* 🔥 FLOATING LOGO HEADER */}
            <header className="absolute inset-x-0 top-0 z-50 px-5 py-6 sm:px-8 sm:py-8">
                <div className="mx-auto max-w-7xl">
                    <Link to="/" className="inline-flex items-center">
                        <img
                            src="/images/logo/logo2.png"
                            alt="SanFoody"
                            className="h-12 w-auto object-contain sm:h-14"
                        />
                    </Link>
                </div>
            </header>

            {/* ============================================
          HERO SECTION
          ============================================ */}
            <section className="relative overflow-hidden bg-charcoal">
                <img
                    src="/public/images/RestuarantPartner/restuarant.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-br from-charcoal/95 via-charcoal/85 to-charcoal/60" />
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-5 py-20 pt-28 sm:px-8 sm:py-28 sm:pt-32">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left: Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-500 to-emerald-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cream">
                                <Store className="h-3.5 w-3.5" />
                                Restaurant Partner
                            </div>

                            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-cream sm:text-5xl lg:text-6xl">
                                Grow your
                                <br />
                                <span className="bg-linear-to-r from-orange to-tomato bg-clip-text text-transparent">
                                    restaurant.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-relaxed text-cream/80 sm:text-lg">
                                Get listed on SanFoody and reach thousands of hungry customers
                                every day. Manage orders, menu, and analytics — all from one
                                powerful dashboard.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    to="/signup/partner/restaurant"
                                    className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-500 to-emerald-600 px-7 py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Sign Up as Partner
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-7 py-3.5 text-sm font-bold text-cream backdrop-blur-sm transition-colors hover:border-cream/40 hover:bg-cream/20"
                                >
                                    Already a Partner? Sign In
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-cream/60">
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                    Zero setup fee
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                    Weekly payouts
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                    Dedicated support
                                </span>
                            </div>
                        </motion.div>

                        {/* Right: Floating card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="hidden lg:block"
                        >
                            <div className="relative mx-auto max-w-md">
                                <div className="rounded-3xl border border-cream/10 bg-charcoal/60 p-6 shadow-warm backdrop-blur-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-green-500 to-emerald-600">
                                                <ChefHat className="h-6 w-6 text-cream" />
                                            </div>
                                            <div>
                                                <p className="font-display text-base font-bold text-cream">
                                                    Bombay Bistro
                                                </p>
                                                <p className="text-xs text-cream/60">Verified Partner</p>
                                            </div>
                                        </div>
                                        <div className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
                                            ● Live
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-cream/5 p-4">
                                            <p className="text-xs text-cream/60">Orders Today</p>
                                            <p className="mt-1 font-display text-2xl font-extrabold text-cream">
                                                47
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-cream/5 p-4">
                                            <p className="text-xs text-cream/60">Revenue</p>
                                            <p className="mt-1 font-display text-2xl font-extrabold text-orange">
                                                ₹12.4K
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl bg-cream/5 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-cream/60">Weekly Growth</p>
                                            <p className="text-xs font-bold text-green-400">+18.5%</p>
                                        </div>
                                        <div className="mt-3 flex h-16 items-end gap-1.5">
                                            {[40, 55, 35, 60, 48, 70, 85].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-t bg-linear-to-t from-green-500 to-emerald-400"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="absolute -right-6 top-8 rounded-2xl bg-white p-4 shadow-warm"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="grid h-8 w-8 place-items-center rounded-full bg-green-100">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase text-warm-gray">
                                                Ranking
                                            </p>
                                            <p className="text-xs font-bold text-charcoal">Top 5%</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================
          STATS BAR
          ============================================ */}
            <section className="border-b border-charcoal/5 bg-cream py-10">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-green-100">
                                    <stat.icon className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="mt-3 font-display text-2xl font-extrabold text-charcoal sm:text-3xl">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-xs text-warm-gray sm:text-sm">
                                    {stat.label}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
          BENEFITS
          ============================================ */}
            <section className="bg-cream py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                            Why Partner With Us
                        </span>
                        <h2 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                            Everything you need to
                            <span className="bg-linear-to-r from-orange to-tomato bg-clip-text text-transparent">
                                {' '}
                                grow faster
                            </span>
                        </h2>
                        <p className="mt-4 text-warm-gray">
                            We provide the tools, customers, and support to help your
                            restaurant thrive.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {BENEFITS.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                className="group rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
                            >
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 shadow-warm">
                                    <benefit.icon className="h-6 w-6 text-cream" />
                                </div>
                                <h3 className="mt-4 font-display text-lg font-bold text-charcoal">
                                    {benefit.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-warm-gray">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
          HOW IT WORKS
          ============================================ */}
            <section className="bg-beige/40 py-20 sm:py-24">
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                            Simple Process
                        </span>
                        <h2 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                            Get started in 4 easy steps
                        </h2>
                        <p className="mt-4 text-warm-gray">
                            From signup to your first order — usually within 48 hours.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative"
                            >
                                <div className="rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft">
                                    <div className="flex items-center justify-between">
                                        <span className="font-display text-4xl font-extrabold text-green-500/20">
                                            {step.number}
                                        </span>
                                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-100">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                    <h3 className="mt-4 font-display text-lg font-bold text-charcoal">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-warm-gray">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
          FINAL CTA
          ============================================ */}
            <section className="bg-cream py-20 sm:py-24">
                <div className="mx-auto max-w-5xl px-5 sm:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-green-500 via-emerald-600 to-green-700 px-8 py-16 text-center shadow-warm sm:px-16 sm:py-20"
                    >
                        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />

                        <div className="relative">
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                <Store className="h-8 w-8 text-cream" />
                            </div>

                            <h2 className="mt-6 font-display text-3xl font-extrabold text-cream sm:text-4xl">
                                Ready to grow your restaurant?
                            </h2>
                            <p className="mx-auto mt-4 max-w-lg text-base text-cream/90">
                                Join 10,000+ restaurants already thriving on SanFoody. Sign up
                                today and get your first order in 48 hours.
                            </p>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <Link
                                    to="/signup/partner/restaurant"
                                    className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-green-700 shadow-warm transition-all hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Sign Up as Partner
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-8 py-4 text-sm font-bold text-cream backdrop-blur-sm transition-colors hover:bg-cream/20"
                                >
                                    Already a Partner? Sign In
                                </Link>
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-cream/80">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    24-48 hour verification
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    Secure & trusted
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    Zero setup fee
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
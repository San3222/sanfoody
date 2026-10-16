import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { SEO } from '@/apps/customer/components/SEO'

export function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to SanFoody and discover delicious food."
        noIndex
      />
      <section className="flex min-h-[80vh] items-center justify-center px-5 py-28 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl text-center"
        >
          {/* Animated 404 */}
          <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center sm:h-56 sm:w-56">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute h-full w-full rounded-full border-4 border-dashed border-tomato/20"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute h-3/4 w-3/4 rounded-full border-4 border-dashed border-orange/15"
            />
            <div className="relative z-10">
              <span className="font-display text-7xl font-extrabold text-charcoal sm:text-8xl dark:text-cream">404</span>
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl dark:text-cream">
            Oops! Page Not Found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-warm-gray">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to something delicious.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-tomato to-orange px-6 py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 px-6 py-3 text-sm font-bold text-charcoal transition-colors hover:border-tomato/40 hover:text-tomato dark:text-cream dark:border-cream/15"
            >
              <Search className="h-4 w-4" />
              Explore Food
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-warm-gray transition-colors hover:text-charcoal dark:text-cream/70 dark:hover:text-cream"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>

          {/* Quick links */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Popular', href: '/explore' },
              { label: 'Offers', href: '/offers' },
              { label: 'Collections', href: '/collections' },
              { label: 'Favorites', href: '/favorites' },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-xl border border-charcoal/5 bg-white p-4 text-center text-sm font-medium text-charcoal transition-colors hover:border-tomato/20 hover:text-tomato dark:bg-charcoal/5 dark:text-cream dark:hover:bg-tomato/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  )
}
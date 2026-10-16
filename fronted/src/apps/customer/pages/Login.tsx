// src/apps/customer/pages/Login.tsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { motion } from 'motion/react'
import { loginUser } from '@/api/Client'
import { useAuth } from '@/context/useAuth'
import { SEO } from '@/apps/customer/components/SEO'

const FEATURES = [
  { icon: ShieldCheck, text: 'Secure payments & instant refunds' },
  { icon: Sparkles, text: 'Earn loyalty points on every order' },
  { icon: ArrowRight, text: 'Live tracking from kitchen to door' },
]

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (data) => {
      setUser(data.user)
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (data.user.role === 'restaurant') {
        navigate('/restaurant/dashboard', { replace: true })
      } else if (data.user.role === 'delivery') {
        navigate('/delivery/available-orders', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
    },
    onError: (error: any) => {
      setError(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="font-poppins min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <SEO
        title="Login — SanFoody"
        description="Log in to SanFoody to order food, track deliveries, and manage your account."
      />

      {/* Font setup: Poppins everywhere */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      {/* ============================================
          LEFT PANEL — Dark Branded
          ============================================ */}
      <div className="relative hidden overflow-hidden bg-charcoal lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background dish photo */}
        <img
          src="https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?fm=jpg&q=80&w=1600&auto=format&fit=crop"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient overlay: solid on the text side, photo shows through on the right */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/90 to-charcoal/20" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-charcoal/90 via-transparent to-charcoal/50" />

        {/* Decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-tomato/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-tomato/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/images/logo/logo2.png"
              alt="SanFoody"
              className="h-14 w-auto object-contain drop-shadow-lg"
            />
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight text-cream xl:text-5xl"
          >
            Delicious food.
            <br />
            <span className="bg-linear-to-r from-orange to-tomato bg-clip-text text-transparent">
              Delivered unified.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 max-w-md text-sm leading-relaxed text-cream/70"
          >
            One platform for customers, restaurants, and delivery partners —
            order, cook, deliver, and earn. All in one place.
          </motion.p>

          <div className="mt-8 space-y-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream/10 ring-1 ring-cream/15">
                  <feature.icon className="h-4 w-4 text-orange" />
                </div>
                <span className="text-sm text-cream/80">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-cream/40">
          <span>© {new Date().getFullYear()} SanFoody</span>
          <span>•</span>
          <span>Made in India</span>
        </div>
      </div>

      {/* ============================================
          RIGHT PANEL — Login Form
          ============================================ */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-5 py-16 sm:px-8 lg:min-h-0 lg:py-0">
        {/* Ambient accents behind the card */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-tomato/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          {/* Gradient border wrapper */}
          <div className="rounded-4xl bg-linear-to-br from-tomato/40 via-orange/20 to-transparent p-[1.5px] shadow-[0_20px_60px_-15px_rgba(217,66,56,0.35)]">
            <div className="rounded-[calc(2rem-1.5px)] bg-white/90 p-8 backdrop-blur-xl sm:p-10">
              {/* Mobile Logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <img
                  src="/images/logo/logo2.png"
                  alt="SanFoody"
                  className="h-12 w-auto object-contain"
                />
              </div>

              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-tomato/10 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-tomato" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-tomato">
                    Secure Sign-In
                  </p>
                </div>
                <h1 className="mt-4 text-3xl font-bold text-charcoal sm:text-4xl">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm text-warm-gray">
                  Sign in to continue to SanFoody.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal"
                  >
                    Email
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-tomato focus-within:shadow-md focus-within:ring-4 focus-within:ring-tomato/10">
                    <Mail className="h-4 w-4 shrink-0 text-warm-gray" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold uppercase tracking-wide text-charcoal"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-tomato hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-tomato focus-within:shadow-md focus-within:ring-4 focus-within:ring-tomato/10">
                    <Lock className="h-4 w-4 shrink-0 text-warm-gray" />
                    <input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-warm-gray"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange py-3.5 text-sm font-bold text-cream shadow-[0_10px_30px_-8px_rgba(217,66,56,0.6)] transition-all hover:scale-[1.015] hover:shadow-[0_14px_36px_-8px_rgba(217,66,56,0.7)] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Social sign-in */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white py-3 text-sm font-semibold text-charcoal shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.48a5.55 5.55 0 0 1-2.4 3.64v3h3.88c2.27-2.09 3.56-5.17 3.56-8.83Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.96-2.9l-3.88-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.11-6.74-4.96H1.26v3.09A11.99 11.99 0 0 0 12 24Z" />
                    <path fill="#FBBC05" d="M5.26 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.26a12 12 0 0 0 0 10.76l4-3.09Z" />
                    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.26 6.62l4 3.09C6.21 6.88 8.87 4.77 12 4.77Z" />
                  </svg>
                  Google
                </button>
                <span className="text-xs text-warm-gray">or</span>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-charcoal py-3 text-sm font-semibold text-cream shadow-sm transition-all hover:-translate-y-0.5 hover:bg-charcoal/90 hover:shadow-md"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.36 1.43c0 1.14-.46 2.24-1.2 3.05-.8.89-2.12 1.58-3.2 1.49-.14-1.1.42-2.26 1.16-3.03.82-.88 2.24-1.55 3.24-1.51ZM20.6 17.14c-.5 1.14-.74 1.65-1.38 2.66-.9 1.42-2.16 3.19-3.73 3.2-1.4.02-1.76-.9-3.66-.89-1.9.01-2.3.91-3.7.9-1.57-.02-2.76-1.6-3.66-3.02-2.5-3.95-2.76-8.6-1.22-11.07 1.1-1.76 2.83-2.8 4.46-2.8 1.66 0 2.7.92 4.08.92 1.33 0 2.14-.92 4.08-.92 1.45 0 2.98.79 4.08 2.16-3.58 1.96-3 6.86.66 8.86Z" />
                  </svg>
                  Apple
                </button>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-linear-to-r from-transparent via-charcoal/15 to-transparent" />

              {/* Signup CTA */}
              <div className="text-center">
                <p className="text-sm text-warm-gray">
                  New to SanFoody?{' '}
                  <Link to="/signup" className="font-semibold text-tomato hover:underline">
                    Create an account
                  </Link>
                </p>
                <p className="mt-2 text-xs text-warm-gray">
                  Want to be a partner?{' '}
                  <Link
                    to="/partner/restaurant"
                    className="font-semibold text-tomato hover:underline"
                  >
                    Restaurant
                  </Link>
                  {' · '}
                  <Link
                    to="/partner/delivery"
                    className="font-semibold text-tomato hover:underline"
                  >
                    Delivery
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
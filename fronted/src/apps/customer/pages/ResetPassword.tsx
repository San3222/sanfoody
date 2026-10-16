// src/apps/customer/pages/ResetPassword.tsx
import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import { SEO } from '@/apps/customer/components/SEO'
import { useToast } from '@/context/ToastContext'

async function apiPost(endpoint: string, body: any) {
  const response = await fetch(`/api/v1${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Request failed')
  return data.data
}

export function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid reset link')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await apiPost(`/auth/reset-password/${token}`, { password })
      setIsSuccess(true)
      showToast('success', 'Password reset successfully!')

      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <SEO
        title="Reset Password — SanFoody"
        description="Set a new password for your SanFoody account"
      />

      {/* LEFT PANEL */}
      <div className="relative hidden overflow-hidden bg-charcoal lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-tomato/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-3">
          <img
            src="/images/logo/logo2.png"
            alt="SanFoody"
            className="h-14 w-auto object-contain"
          />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="font-display text-4xl font-extrabold leading-tight text-cream xl:text-5xl">
            Set a new
            <br />
            <span className="text-orange">password.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
            Choose a strong password with at least 6 characters. You'll use it to
            log in to SanFoody.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream/10">
              <ShieldCheck className="h-4 w-4 text-orange" />
            </div>
            <span className="text-sm text-cream/80">
              Your data is encrypted and secure
            </span>
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-4 text-xs text-cream/40">
          <span>© {new Date().getFullYear()} SanFoody</span>
          <span>•</span>
          <span>Made in India</span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 sm:px-8 lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/images/logo/logo2.png" alt="SanFoody" className="h-12 w-auto" />
          </div>

          {!isSuccess ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-tomato">
                Set New Password
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                Reset password
              </h1>
              <p className="mt-2 text-sm text-warm-gray">
                Enter a new password for your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal"
                  >
                    New Password
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 transition-colors focus-within:border-tomato">
                    <Lock className="h-4 w-4 shrink-0 text-warm-gray" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal"
                  >
                    Confirm Password
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 transition-colors focus-within:border-tomato">
                    <Lock className="h-4 w-4 shrink-0 text-warm-gray" />
                    <input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset password
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mt-6 font-display text-2xl font-extrabold text-charcoal">
                Password reset!
              </h1>
              <p className="mt-2 text-sm text-warm-gray">
                Redirecting you to login...
              </p>
            </motion.div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-tomato hover:underline"
            >
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
// src/apps/customer/pages/ForgotPassword.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
    Mail,
    ArrowLeft,
    ArrowRight,
    Loader2,
    CheckCircle2,
    ShieldCheck,
} from 'lucide-react'
import { SEO } from '@/apps/customer/components/SEO'
import { useToast } from '@/context/ToastContext'
// Fallback apiFetch
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

export function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !email.includes('@')) {
            showToast('error', 'Please enter a valid email')
            return
        }

        setIsSubmitting(true)
        try {
            await apiPost('/auth/forgot-password', { email: email.trim().toLowerCase() })
            setIsSent(true)
        } catch (err: any) {
            showToast('error', err.message || 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
            <SEO
                title="Forgot Password — SanFoody"
                description="Reset your SanFoody account password"
            />

            {/* LEFT PANEL — Dark */}
            <div className="relative hidden overflow-hidden bg-charcoal lg:flex lg:flex-col lg:justify-between lg:p-12">
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-tomato/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />

                <Link to="/" className="relative z-10 inline-flex items-center gap-3">
                    <img
                        src="/images/logo/logo2.png"
                        alt="SanFoody"
                        className="h-12 w-auto object-contain"
                    />

                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 max-w-lg"
                >
                    <h1 className="font-display text-4xl font-extrabold leading-tight text-cream xl:text-5xl">
                        Forgot your
                        <br />
                        <span className="text-orange">password?</span>
                    </h1>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
                        No worries — it happens to everyone. Enter your email and we'll send
                        you a link to reset it.
                    </p>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream/10">
                                <ShieldCheck className="h-4 w-4 text-orange" />
                            </div>
                            <span className="text-sm text-cream/80">
                                Secure link valid for 15 minutes
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream/10">
                                <CheckCircle2 className="h-4 w-4 text-orange" />
                            </div>
                            <span className="text-sm text-cream/80">
                                Instant reset — no support needed
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="relative z-10 flex items-center gap-4 text-xs text-cream/40">
                    <span>© {new Date().getFullYear()} SanFoody</span>
                    <span>•</span>
                    <span>Made in India</span>
                </div>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 sm:px-8 lg:min-h-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <img src="/images/logo/logo1.png" alt="SanFoody" className="h-12 w-auto" />
                    </div>

                    {!isSent ? (
                        <>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-tomato">
                                Password Reset
                            </p>
                            <h1 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                                Forgot password?
                            </h1>
                            <p className="mt-2 text-sm text-warm-gray">
                                Enter your email and we'll send you a reset link.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal"
                                    >
                                        Email
                                    </label>
                                    <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 transition-colors focus-within:border-tomato">
                                        <Mail className="h-4 w-4 shrink-0 text-warm-gray" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send reset link
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
                                Check your email
                            </h1>
                            <p className="mt-2 text-sm text-warm-gray">
                                We've sent a password reset link to
                            </p>
                            <p className="mt-1 font-semibold text-charcoal">{email}</p>
                            <p className="mt-4 text-xs text-warm-gray">
                                The link expires in 15 minutes. Check your spam folder if you
                                don't see it.
                            </p>
                        </motion.div>
                    )}

                    {/* Back to login */}
                    <div className="mt-8 flex items-center justify-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tomato hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
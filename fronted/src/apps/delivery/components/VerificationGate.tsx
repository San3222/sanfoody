// src/apps/delivery/components/VerificationGate.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    CheckCircle2,
    Clock,
    RefreshCw,
    LifeBuoy,
    Bike,
    Loader2,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { useDeliveryStats } from '@/api/deliveryHooks'
import { cn } from '@/lib/utils'

const SUPPORT_EMAIL = 'support@sanfoody.com' // TODO: apna support email daalo
const RECHECK_MS = 60_000 // locked screen par har 60 sec me status dobara check

type VerificationState = 'verified' | 'pending' | 'rejected'

/** Partner ka verification state nikalta hai (backend ke field names yahan adjust karo). */
// 🔥 Yahan se 'export' hata diya gaya hai
function getVerificationState(partner: any): VerificationState {
    // Dono jagah se check karein (agar backend mein kuch alag ho)
    const status = String(
        partner?.deliveryDetails?.verificationStatus ??
        partner?.verificationStatus ??
        ''
    ).toLowerCase()

    if (status === 'verified' || status === 'approved' || partner?.isVerified === true) return 'verified'
    if (status === 'rejected' || status === 'suspended') return 'rejected'
    return 'pending'
}

/**
 * Jab tak admin approve nahi karta, children render hi nahi hote.
 * Isse andar ke pages ke API hooks bhi mount nahi hote (koi data fetch nahi).
 *
 * allowedPaths: un routes ke prefix jo unverified partner bhi dekh sake (jaise Settings).
 */
export function VerificationGate({
    children,
    allowedPaths = [],
}: {
    children: React.ReactNode
    allowedPaths?: string[]
}) {
    const { pathname } = useLocation()
    const { data: stats, isLoading, isError, refetch, isRefetching } = useDeliveryStats() as any

    const partner = stats?.partner
    const state = getVerificationState(partner)
    const locked = !isLoading && !isError && state !== 'verified'

    // Locked rahte hue status apne aap check hota rahe
    useEffect(() => {
        if (!locked) return
        const id = setInterval(() => refetch(), RECHECK_MS)
        return () => clearInterval(id)
    }, [locked, refetch])

    if (allowedPaths.some((p) => pathname.startsWith(p))) return <>{children}</>

    // Status pata hone se pehle kuch bhi mat dikhao (flash se bachne ke liye)
    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-tomato" />
            </div>
        )
    }

    // Error ho to unlock mat karo, retry do
    if (isError) {
        return (
            <Card className="mx-auto mt-10 max-w-md px-6 py-10 text-center">
                <ShieldAlert className="mx-auto h-10 w-10 text-gold" />
                <p className="mt-4 font-display text-lg font-bold text-charcoal">Couldn't check your account</p>
                <p className="mt-1 text-sm text-warm-gray">Please check your connection and try again.</p>
                <button
                    onClick={() => refetch()}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-tomato px-6 text-sm font-semibold text-cream transition hover:opacity-90 active:scale-95"
                >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                </button>
            </Card>
        )
    }

    if (state === 'verified') return <>{children}</>

    return (
        <LockedScreen
            state={state}
            name={(partner?.name ?? 'Partner').split(' ')[0]}
            reason={partner?.rejectionReason}
            onRecheck={() => refetch()}
            checking={isRefetching}
        />
    )
}

// ============================================
// Locked screen
// ============================================

function LockedScreen({
    state,
    name,
    reason,
    onRecheck,
    checking,
}: {
    state: 'pending' | 'rejected'
    name: string
    reason?: string
    onRecheck: () => void
    checking: boolean
}) {
    const rejected = state === 'rejected'
    const Icon = rejected ? ShieldX : ShieldAlert

    return (
        <div className="mx-auto max-w-xl pb-10 pt-4">
            <Card className="overflow-hidden p-0">
                <div className={cn('px-6 py-9 text-center', rejected ? 'bg-red-50' : 'bg-gold/10')}>
                    <div
                        className={cn(
                            'mx-auto grid h-16 w-16 place-items-center rounded-full',
                            rejected ? 'bg-red-100 text-red-600' : 'bg-gold/20 text-gold'
                        )}
                    >
                        <Icon className="h-8 w-8" />
                    </div>
                    <h1 className="mt-4 font-display text-2xl font-bold text-charcoal">
                        {rejected ? 'Account not approved' : `Hi ${name}, verification pending`}
                    </h1>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-warm-gray">
                        {rejected
                            ? 'Our team could not approve your account yet. Please contact support to fix this.'
                            : 'Our team is reviewing your documents. You can go online and accept orders as soon as your account is approved.'}
                    </p>
                    {rejected && reason && (
                        <p className="mx-auto mt-4 max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-left text-sm text-charcoal">
                            <b className="text-red-600">Reason: </b>
                            {reason}
                        </p>
                    )}
                </div>

                {!rejected && (
                    <div className="px-6 py-6">
                        <ol className="space-y-5">
                            <Step done icon={CheckCircle2} title="Application submitted" sub="We received your details and documents" />
                            <Step active icon={Clock} title="Admin review" sub="Usually takes up to 24 hours" />
                            <Step icon={Bike} title="Start delivering" sub="Go online, accept orders and earn" />
                        </ol>
                    </div>
                )}

                <div className="flex flex-col gap-3 border-t border-charcoal/10 bg-beige/30 p-4 sm:flex-row">
                    {!rejected && (
                        <button
                            onClick={onRecheck}
                            disabled={checking}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-tomato text-sm font-bold text-cream shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:opacity-60"
                        >
                            <RefreshCw className={cn('h-4 w-4', checking && 'animate-spin')} />
                            {checking ? 'Checking…' : 'Check status'}
                        </button>
                    )}
                    <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(rejected ? 'Account not approved' : 'Verification status')}`}
                        className={cn(
                            'inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
                            rejected
                                ? 'bg-tomato text-cream shadow-sm hover:opacity-90'
                                : 'border border-charcoal/15 bg-white text-charcoal hover:bg-beige/60'
                        )}
                    >
                        <LifeBuoy className="h-4 w-4" />
                        Contact support
                    </a>
                </div>
            </Card>

            {!rejected && (
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-warm-gray">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    This page updates automatically once you are approved
                </p>
            )}
        </div>
    )
}

function Step({
    icon: Icon,
    title,
    sub,
    done,
    active,
}: {
    icon: React.ElementType
    title: string
    sub: string
    done?: boolean
    active?: boolean
}) {
    return (
        <li className="flex items-start gap-3">
            <div
                className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                    done ? 'bg-green-100 text-green-600' : active ? 'bg-gold/20 text-gold' : 'bg-charcoal/5 text-charcoal/30'
                )}
            >
                <Icon className={cn('h-4 w-4', active && 'animate-pulse')} />
            </div>
            <div>
                <p className={cn('text-sm font-semibold', done || active ? 'text-charcoal' : 'text-charcoal/50')}>{title}</p>
                <p className="text-xs text-warm-gray">{sub}</p>
            </div>
        </li>
    )
}
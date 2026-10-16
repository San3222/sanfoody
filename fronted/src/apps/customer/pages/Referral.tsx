import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Gift, Users, Copy, Check, Share2, Sparkles, PartyPopper, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/useAuth'
import { useReferralStats, useGenerateReferralCode, useApplyReferralCode } from '@/api/Hooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function Referral() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)
  const [referralCodeInput, setReferralCodeInput] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [localReferralCode, setLocalReferralCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const hasGeneratedRef = useRef(false)

  const { data: stats, isLoading, refetch } = useReferralStats()
  const generateCode = useGenerateReferralCode()
  const applyCode = useApplyReferralCode()

  // 🔥 User referral code ko memoize karo (stable reference)
  const userReferralCode = useMemo(
    () => (user as any)?.referralCode || '',
    [user?.id]
  )

  // 🔥 Final referral code
  const referralCode = localReferralCode || userReferralCode || ''

  useEffect(() => {
    console.log('🔍 Referral useEffect running')
    console.log('👤 User referralCode:', userReferralCode)
    console.log('🔑 Local Referral Code:', localReferralCode)

    if (!user) return

    // Priority 1: User ke paas already code hai
    if (userReferralCode) {
      console.log('✅ Using user.referralCode:', userReferralCode)
      setLocalReferralCode(userReferralCode)
      hasGeneratedRef.current = true
      setIsGenerating(false)
      return
    }

    // Priority 2: Local code already hai
    if (localReferralCode) {
      console.log('✅ Using localReferralCode:', localReferralCode)
      hasGeneratedRef.current = true
      setIsGenerating(false)
      return
    }

    // Priority 3: Already generated, skip
    if (hasGeneratedRef.current) {
      console.log('⏭️ Already generated')
      return
    }

    // Priority 4: Naya code generate karo
    console.log('🚀 Generating new code...')
    hasGeneratedRef.current = true
    setIsGenerating(true)

    generateCode.mutate(undefined, {
      onSuccess: (data: any) => {
        console.log('✅ Generated:', data)
        setLocalReferralCode(data.referralCode)
        setIsGenerating(false)

        if (user && setUser) {
          setUser({ ...user, referralCode: data.referralCode } as any)
        }

        const storedUser = localStorage.getItem('sanfoody:user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            parsedUser.referralCode = data.referralCode
            localStorage.setItem('sanfoody:user', JSON.stringify(parsedUser))
          } catch {}
        }

        showToast('success', 'Referral code generated!')
        refetch()
      },
      onError: (error: any) => {
        console.error('❌ Error:', error)
        setIsGenerating(false)
        hasGeneratedRef.current = false
        showToast('error', error.message || 'Could not generate referral code')
      },
    })
  }, [user?.id, localReferralCode, userReferralCode])



    const handleCopy = async () => {
        const text = `🎉 Join SanFoody and get ₹100 off! Use my referral code: ${referralCode}`
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 3000)
            showToast('success', 'Referral code copied!')
        } catch {
            showToast('error', 'Could not copy code')
        }
    }

    const handleShare = async () => {
        const text = `🎉 Join SanFoody and get ₹100 off! Use my referral code: ${referralCode}`
        try {
            await navigator.share({
                title: 'Join SanFoody',
                text: text,
                url: window.location.origin,
            })
        } catch {
            handleCopy()
        }
    }

    const handleApplyCode = () => {
        if (!referralCodeInput.trim()) {
            showToast('error', 'Please enter a referral code')
            return
        }
        applyCode.mutate(referralCodeInput, {
            onSuccess: () => {
                showToast('success', 'Referral applied! You got ₹100 off')
                setShowApplyModal(false)
                setReferralCodeInput('')
            },
            onError: (error: any) => {
                showToast('error', error.message || 'Invalid referral code')
            },
        })
    }

    const referralSteps = [
        { icon: <Users className="h-5 w-5" />, title: 'Share your code', description: 'Send your unique referral code to friends' },
        { icon: <Gift className="h-5 w-5" />, title: 'Friend signs up', description: 'They get ₹100 off their first order' },
        { icon: <Sparkles className="h-5 w-5" />, title: 'You earn rewards', description: 'Get ₹100 for every friend who orders' },
    ]

    return (
        <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8 sm:py-32">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-tomato/10 px-4 py-1.5 text-sm font-semibold text-tomato">
                        <PartyPopper className="h-4 w-4" />
                        Refer & Earn
                    </div>
                    <h1 className="mt-4 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                        Invite a Friend, Get ₹100
                    </h1>
                    <p className="mt-2 text-warm-gray">
                        Share SanFoody with your friends and earn rewards for every order they make.
                    </p>
                </div>

                {/* Referral Code Card */}
                <div className="mb-8 overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
                    <div className="border-b border-charcoal/10 px-6 py-4">
                        <h2 className="font-display text-lg font-bold text-charcoal">Your Referral Code</h2>
                    </div>
                    <div className="p-6">
                        {/* 🔥 Loading only when actually generating */}
                        {isGenerating && !referralCode ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-tomato" />
                                <p className="mt-2 text-xs text-warm-gray">Generating your code...</p>
                            </div>
                        ) : !referralCode ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <p className="text-sm text-warm-gray">Could not generate code.</p>
                                <button
                                    onClick={() => {
                                        hasGeneratedRef.current = false
                                        setLocalReferralCode('')
                                        setIsGenerating(true)
                                    }}
                                    className="mt-2 text-sm font-semibold text-tomato hover:underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <div className="flex-1 rounded-2xl bg-linear-to-br from-tomato/10 to-orange/10 p-4 text-center">
                                    <p className="font-display text-2xl font-extrabold tracking-wider text-charcoal">
                                        {referralCode}
                                    </p>
                                    <p className="text-xs text-warm-gray">Share this code with friends</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all',
                                            copied ? 'bg-fresh-green text-white' : 'bg-charcoal text-cream hover:bg-charcoal/80'
                                        )}
                                    >
                                        {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy</>}
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange px-5 py-3 font-semibold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apply Referral Code */}
                <div className="mb-8 rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft">
                    <h2 className="mb-3 font-display text-lg font-bold text-charcoal">Have a Referral Code?</h2>
                    <p className="mb-4 text-sm text-warm-gray">Apply a friend's code and get ₹100 off your next order.</p>
                    <button
                        onClick={() => setShowApplyModal(true)}
                        className="w-full rounded-full border border-tomato/40 py-3 text-sm font-semibold text-tomato transition-colors hover:bg-tomato/5"
                    >
                        Apply Referral Code
                    </button>
                </div>

                {/* Stats */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                    <div className="rounded-3xl border border-charcoal/5 bg-white p-6 text-center shadow-soft">
                        <p className="text-3xl font-display font-extrabold text-tomato">{stats?.completedReferrals || 0}</p>
                        <p className="text-sm text-warm-gray">Friends Referred</p>
                    </div>
                    <div className="rounded-3xl border border-charcoal/5 bg-white p-6 text-center shadow-soft">
                        <p className="text-3xl font-display font-extrabold text-fresh-green">₹{stats?.totalEarnings || 0}</p>
                        <p className="text-sm text-warm-gray">Total Earnings</p>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mb-8 overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
                    <div className="border-b border-charcoal/10 px-6 py-4">
                        <h2 className="font-display text-lg font-bold text-charcoal">How It Works</h2>
                    </div>
                    <div className="p-6">
                        <div className="relative">
                            {referralSteps.map((step, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="relative flex flex-col items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tomato/10 text-tomato">
                                            {step.icon}
                                        </div>
                                        {index < referralSteps.length - 1 && (
                                            <div className="h-12 w-px bg-charcoal/10" />
                                        )}
                                    </div>
                                    <div className="pb-6 pt-1">
                                        <h3 className="font-semibold text-charcoal">{step.title}</h3>
                                        <p className="text-sm text-warm-gray">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Terms */}
                <div className="rounded-3xl border border-charcoal/5 bg-white p-6 shadow-soft">
                    <h3 className="font-semibold text-charcoal">Terms & Conditions</h3>
                    <ul className="mt-3 space-y-1.5 text-sm text-warm-gray">
                        <li className="flex items-start gap-2"><span className="mt-0.5 text-tomato">•</span>Referral credit is valid for 30 days after signup</li>
                        <li className="flex items-start gap-2"><span className="mt-0.5 text-tomato">•</span>Minimum order value of ₹199 applies</li>
                        <li className="flex items-start gap-2"><span className="mt-0.5 text-tomato">•</span>Cannot be combined with other offers</li>
                        <li className="flex items-start gap-2"><span className="mt-0.5 text-tomato">•</span>Maximum referral bonus is ₹1000 per month</li>
                    </ul>
                </div>
            </motion.div>

            {/* Apply Code Modal */}
            <AnimatePresence>
                {showApplyModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowApplyModal(false)}
                            className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-display text-lg font-bold text-charcoal">Apply Referral Code</h2>
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                                >
                                    ✕
                                </button>
                            </div>
                            <input
                                type="text"
                                value={referralCodeInput}
                                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                                placeholder="Enter referral code"
                                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-center font-mono text-lg font-bold tracking-wider outline-none focus:border-tomato"
                            />
                            <button
                                onClick={handleApplyCode}
                                disabled={applyCode.isPending}
                                className="mt-4 w-full rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm disabled:opacity-60"
                            >
                                {applyCode.isPending ? 'Applying...' : 'Apply Code'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </section>
    )
}
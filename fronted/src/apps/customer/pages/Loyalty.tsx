// src/apps/customer/pages/Loyalty.tsx
import { Link } from 'react-router-dom'
import {
    Award,
    Gift,
    TrendingUp,
    Sparkles,
    ChevronRight,
    Star,
    Trophy,
    Target,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { useLoyaltyPoints } from '@/api/loyaltyHooks'
import { SEO } from '@/apps/customer/components/SEO'
import { cn } from '@/lib/utils'

// ============================================
// Tier Config
// ============================================

const TIER_CONFIG = {
    bronze: {
        name: 'Bronze',
        color: 'from-amber-600 to-amber-800',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-100',
        icon: Award,
        nextTier: 'silver',
        minPoints: 0,
        benefits: ['Earn 10% points on orders', 'Basic support'],
    },
    silver: {
        name: 'Silver',
        color: 'from-gray-400 to-gray-600',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-100',
        icon: Star,
        nextTier: 'gold',
        minPoints: 1000,
        benefits: ['Earn 12% points', 'Priority support', 'Exclusive offers'],
    },
    gold: {
        name: 'Gold',
        color: 'from-yellow-400 to-yellow-600',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: Trophy,
        nextTier: 'platinum',
        minPoints: 5000,
        benefits: ['Earn 15% points', 'Free delivery monthly', 'Priority support'],
    },
    platinum: {
        name: 'Platinum',
        color: 'from-purple-500 to-purple-700',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: Sparkles,
        nextTier: null,
        minPoints: 10000,
        benefits: [
            'Earn 20% points',
            'Free delivery always',
            'Dedicated support',
            'Exclusive VIP offers',
        ],
    },
} as const

const POINTS_PER_RUPEE = 0.1 // ₹100 = 10 points
const RUPEE_PER_POINT = 0.1 // 10 points = ₹1

export function Loyalty() {
    const { data: loyalty, isLoading } = useLoyaltyPoints()

    if (isLoading) {
        return (
            <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-40 rounded-3xl bg-charcoal/5" />
                    <div className="h-32 rounded-3xl bg-charcoal/5" />
                    <div className="h-48 rounded-3xl bg-charcoal/5" />
                </div>
            </section>
        )
    }

    const points = loyalty?.points ?? 0
    const totalEarned = loyalty?.totalEarned ?? 0
    const totalRedeemed = loyalty?.totalRedeemed ?? 0
    const tier = loyalty?.tier ?? 'bronze'
    const history = loyalty?.history ?? []

    const tierConfig = TIER_CONFIG[tier]
    const TierIcon = tierConfig.icon
    const nextTierConfig = tierConfig.nextTier ? TIER_CONFIG[tierConfig.nextTier] : null

    // Progress to next tier
    const currentMin = tierConfig.minPoints
    const nextMin = nextTierConfig?.minPoints ?? currentMin
    const progressPct = nextTierConfig
        ? Math.min(((totalEarned - currentMin) / (nextMin - currentMin)) * 100, 100)
        : 100
    const pointsToNext = nextTierConfig ? Math.max(nextMin - totalEarned, 0) : 0

    return (
        <section className="mx-auto max-w-4xl px-5 pb-16 pt-24 sm:px-8 sm:pt-28">
            <SEO
                title="Loyalty Points — SanFoody"
                description="Earn points on every order, unlock tiers and exclusive rewards"
            />

            {/* Header */}
            <div className="text-center">
                <Badge variant="info">
                    <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        SanFoody Rewards
                    </span>
                </Badge>
                <h1 className="mt-3 font-display text-3xl font-extrabold text-charcoal sm:text-4xl">
                    Your Loyalty Points
                </h1>
                <p className="mt-2 text-warm-gray">
                    Earn points with every order, unlock exclusive rewards
                </p>
            </div>

            {/* Main Balance Card */}
            <div
                className={cn(
                    'mt-8 overflow-hidden rounded-[2rem] bg-linear-to-br p-8 text-white shadow-warm',
                    tierConfig.color
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                            Available Points
                        </p>
                        <p className="mt-1 font-display text-5xl font-extrabold">
                            {points.toLocaleString('en-IN')}
                        </p>
                        <p className="mt-2 text-sm opacity-90">
                            Worth ₹{(points * RUPEE_PER_POINT).toFixed(2)}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                            <TierIcon className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                                {tierConfig.name}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress to next tier */}
                {nextTierConfig && (
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="opacity-90">Progress to {nextTierConfig.name}</span>
                            <span className="font-semibold">
                                {totalEarned.toLocaleString('en-IN')} / {nextMin.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-white transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs opacity-90">
                            {pointsToNext.toLocaleString('en-IN')} more points to unlock{' '}
                            {nextTierConfig.name} tier
                        </p>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-green-100 p-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-bold text-charcoal">
                                {totalEarned.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-warm-gray">Lifetime Earned</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-tomato/10 p-2">
                            <Gift className="h-5 w-5 text-tomato" />
                        </div>
                        <div>
                            <p className="font-display text-xl font-bold text-charcoal">
                                {totalRedeemed.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-warm-gray">Lifetime Redeemed</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tier Benefits */}
            <Card className="mt-6 p-6">
                <div className="flex items-center gap-3">
                    <div className={cn('rounded-xl p-2', tierConfig.bgColor)}>
                        <TierIcon className={cn('h-5 w-5', tierConfig.textColor)} />
                    </div>
                    <div>
                        <p className="font-display text-lg font-bold text-charcoal">
                            {tierConfig.name} Benefits
                        </p>
                        <p className="text-xs text-warm-gray">
                            Your current tier rewards
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    {tierConfig.benefits.map((benefit, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 rounded-xl bg-beige/30 px-3 py-2"
                        >
                            <Star className={cn('h-3.5 w-3.5 shrink-0 fill-current', tierConfig.textColor)} />
                            <p className="text-sm text-charcoal">{benefit}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* How to Earn */}
            <Card className="mt-6 p-6">
                <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-tomato" />
                    <h2 className="font-display text-lg font-bold text-charcoal">
                        How to Earn Points
                    </h2>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-beige/30 p-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tomato/10">
                            <span className="text-sm font-bold text-tomato">1</span>
                        </div>
                        <p className="text-sm text-charcoal">
                            Every ₹100 spent = <strong>10 points</strong>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-beige/30 p-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tomato/10">
                            <span className="text-sm font-bold text-tomato">2</span>
                        </div>
                        <p className="text-sm text-charcoal">
                            100 points = <strong>₹10 off</strong> at checkout
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-beige/30 p-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-tomato/10">
                            <span className="text-sm font-bold text-tomato">3</span>
                        </div>
                        <p className="text-sm text-charcoal">
                            Higher tiers earn <strong>up to 20% points</strong> per order
                        </p>
                    </div>
                </div>
            </Card>

            {/* History */}
            <Card className="mt-6 p-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-charcoal">
                        Points History
                    </h2>
                    <span className="text-xs text-warm-gray">
                        Last {history.length} transaction{history.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {history.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
                        <Sparkles className="h-12 w-12 text-charcoal/20" />
                        <p className="mt-3 text-sm text-warm-gray">No transactions yet</p>
                        <p className="text-xs text-warm-gray">
                            Place your first order to start earning!
                        </p>
                        <Link
                            to="/restaurants"
                            className="mt-4 rounded-full bg-tomato px-6 py-2.5 text-sm font-semibold text-cream shadow-warm transition-transform hover:scale-105"
                        >
                            Order Now
                        </Link>
                    </div>
                ) : (
                    <div className="mt-4 space-y-2">
                        {history
                            .slice()
                            .reverse()
                            .slice(0, 20)
                            .map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-charcoal/5 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                                                item.type === 'earned'
                                                    ? 'bg-green-100'
                                                    : 'bg-tomato/10'
                                            )}
                                        >
                                            {item.type === 'earned' ? (
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Gift className="h-4 w-4 text-tomato" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal line-clamp-1">
                                                {item.description}
                                            </p>
                                            <p className="text-xs text-warm-gray">
                                                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'shrink-0 font-display text-sm font-bold',
                                            item.type === 'earned' ? 'text-green-600' : 'text-tomato'
                                        )}
                                    >
                                        {item.type === 'earned' ? '+' : '-'}
                                        {Math.abs(item.points)}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}
            </Card>

            {/* All Tiers */}
            <Card className="mt-6 p-6">
                <h2 className="font-display text-lg font-bold text-charcoal">
                    All Tiers
                </h2>
                <p className="text-sm text-warm-gray">
                    Spend more, unlock more rewards
                </p>

                <div className="mt-4 space-y-3">
                    {(['bronze', 'silver', 'gold', 'platinum'] as const).map((t) => {
                        const config = TIER_CONFIG[t]
                        const Icon = config.icon
                        const isCurrent = t === tier
                        const isUnlocked = totalEarned >= config.minPoints

                        return (
                            <div
                                key={t}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl border p-4 transition-all',
                                    isCurrent
                                        ? 'border-tomato bg-tomato/5 shadow-soft'
                                        : isUnlocked
                                            ? 'border-charcoal/10 bg-white'
                                            : 'border-charcoal/5 bg-beige/30 opacity-60'
                                )}
                            >
                                <div
                                    className={cn(
                                        'grid h-10 w-10 shrink-0 place-items-center rounded-full',
                                        config.bgColor
                                    )}
                                >
                                    <Icon className={cn('h-5 w-5', config.textColor)} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-charcoal">{config.name}</p>
                                        {isCurrent && (
                                            <Badge variant="success">Current</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-warm-gray">
                                        {config.minPoints.toLocaleString('en-IN')}+ lifetime points
                                    </p>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-warm-gray" />
                            </div>
                        )
                    })}
                </div>
            </Card>
        </section>
    )
}
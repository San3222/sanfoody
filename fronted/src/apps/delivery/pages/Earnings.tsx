// src/apps/delivery/pages/Earnings.tsx
import { useState } from 'react'
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Download,
  RefreshCw,
  BarChart3,
  Calendar,
  Award,
  CreditCard,
  Smartphone,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { useEarnings, useDeliveryStats } from '@/api/deliveryHooks'
import {
  useWalletBalance,
  usePayoutHistory,
  usePayoutMethod,
  useCancelPayout,
} from '@/api/payoutHooks'
import { WithdrawModal } from '@/apps/delivery/components/WithdrawModal'
import { PayoutMethodModal } from '@/apps/delivery/components/PayoutMethodModal'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function DeliveryEarnings() {
  const [period, setPeriod] = useState<'7d' | '30d'>('30d')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [payoutMethodOpen, setPayoutMethodOpen] = useState(false)

  const { data, isLoading, refetch, isRefetching } = useEarnings()
  const { data: stats } = useDeliveryStats()
  const { data: balance, refetch: refetchBalance } = useWalletBalance()
  const { data: method } = usePayoutMethod()
  const { data: historyData } = usePayoutHistory(1, 5)
  const cancelPayout = useCancelPayout()
  const { showToast } = useToast()

  const summary = data?.summary
  const dailyData = data?.daily ?? []
  const payouts = historyData?.payouts ?? []

  // Filter by period
  const filteredData = dailyData.filter((d) => {
    const days = period === '7d' ? 7 : 30
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return new Date(d.date) >= cutoff
  })

  const periodTotals = filteredData.reduce(
    (acc, d) => ({
      earnings: acc.earnings + d.earnings,
      deliveries: acc.deliveries + d.deliveries,
    }),
    { earnings: 0, deliveries: 0 }
  )

  const maxEarnings = Math.max(...filteredData.map((d) => d.earnings), 1)

  const balanceAmount = balance?.balance ?? 0
  const hasPayoutMethod = !!method && !!method.type
  const hasPendingPayout = (balance?.pending ?? 0) > 0

  const handleDownload = () => {
    const headers = 'Date,Deliveries,Earnings\n'
    const rows = filteredData
      .map((d) => `${d.date},${d.deliveries},${d.earnings}`)
      .join('\n')
    const csv = headers + rows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sanfoody-earnings-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Statement downloaded')
  }

  const handleWithdrawClick = () => {
    if (!hasPayoutMethod) {
      showToast('info', 'Please add a payout method first')
      setPayoutMethodOpen(true)
      return
    }
    setWithdrawOpen(true)
  }

  const handleCancelPayout = (id: string) => {
    if (!confirm('Cancel this withdrawal request? Amount will be refunded.')) return
    cancelPayout.mutate(id, {
      onSuccess: () => {
        showToast('success', 'Withdrawal cancelled and refunded')
        refetchBalance()
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Earnings</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage your earnings and withdrawals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch()
              refetchBalance()
            }}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* 🔥 WALLET BALANCE — Main Section */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Available Balance
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold">
                ₹{balanceAmount.toLocaleString('en-IN')}
              </p>
              {hasPendingPayout && (
                <p className="mt-2 flex items-center gap-1 text-xs opacity-90">
                  <Clock className="h-3 w-3" />
                  ₹{balance?.pending} pending withdrawal
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasPayoutMethod && (
                <button
                  onClick={() => setPayoutMethodOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
                  title="Edit payout method"
                >
                  {method?.type === 'upi' ? (
                    <Smartphone className="h-3.5 w-3.5" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5" />
                  )}
                  {method?.type === 'upi' ? method.upiId : 'Bank'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleWithdrawClick}
              disabled={hasPendingPayout || balanceAmount < 100}
              className={cn(
                'flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-green-700 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {hasPendingPayout
                ? '⏳ Withdrawal Pending'
                : balanceAmount < 100
                  ? `Min ₹100 to withdraw`
                  : 'Withdraw Money'}
            </button>

            {!hasPayoutMethod && (
              <button
                onClick={() => setPayoutMethodOpen(true)}
                className="rounded-2xl bg-white/20 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                + Add Method
              </button>
            )}
          </div>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-2 divide-x divide-charcoal/10 border-t border-charcoal/10 bg-white">
          <div className="p-4 text-center">
            <p className="text-xs text-warm-gray">Lifetime Withdrawn</p>
            <p className="mt-1 font-display text-lg font-bold text-charcoal">
              ₹{(balance?.lifetimeWithdrawn ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs text-warm-gray">Total Withdrawals</p>
            <p className="mt-1 font-display text-lg font-bold text-charcoal">
              {balance?.totalWithdrawals ?? 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-2">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-charcoal">
                ₹{(summary?.totalEarnings ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-warm-gray">Lifetime Earnings</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-charcoal">
                {summary?.totalDeliveries ?? 0}
              </p>
              <p className="text-sm text-warm-gray">Total Deliveries</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gold/10 p-2">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-charcoal">
                ₹{summary?.avgPerDelivery ?? 0}
              </p>
              <p className="text-sm text-warm-gray">Avg Per Delivery</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings Trend Chart */}
      <div className="mt-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <BarChart3 className="h-5 w-5 text-tomato" />
                Earnings Trend
              </h2>
              <p className="text-sm text-warm-gray">
                {periodTotals.deliveries} deliveries · ₹
                {periodTotals.earnings.toLocaleString('en-IN')} earned
              </p>
            </div>

            <div className="flex gap-1 rounded-full bg-charcoal/5 p-1">
              <button
                onClick={() => setPeriod('7d')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  period === '7d'
                    ? 'bg-tomato text-cream'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                Last 7 days
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  period === '30d'
                    ? 'bg-tomato text-cream'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                Last 30 days
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 flex h-40 items-end gap-2">
              {[...Array(period === '7d' ? 7 : 15)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t-lg bg-charcoal/5"
                  style={{ height: `${30 + (i % 5) * 12}%` }}
                />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="mt-6 flex h-40 flex-col items-center justify-center">
              <BarChart3 className="h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">No earnings yet</p>
            </div>
          ) : (
            <div className="mt-6 flex h-40 items-end gap-1.5">
              {filteredData
                .slice()
                .reverse()
                .map((day) => {
                  const pct = (day.earnings / maxEarnings) * 100
                  const dayLabel = new Date(day.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })
                  return (
                    <div key={day.date} className="group relative flex-1">
                      <div
                        className="w-full rounded-t-lg bg-linear-to-t from-tomato to-orange transition-all hover:opacity-80"
                        style={{ height: `${Math.max(pct, 4)}%`, minHeight: '8px' }}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-2 py-1 text-[10px] font-semibold text-cream group-hover:block">
                        {dayLabel}: ₹{day.earnings}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </Card>
      </div>

      {/* 🔥 Payout History */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-charcoal">
            Withdrawal History
          </h2>
        </div>

        <Card className="overflow-hidden p-0">
          {payouts.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">No withdrawals yet</p>
              <p className="text-xs text-warm-gray">
                Complete deliveries to start earning
              </p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal/5">
              {payouts.map((payout) => (
                <PayoutRow
                  key={payout._id}
                  payout={payout}
                  onCancel={() => handleCancelPayout(payout._id)}
                  isCancelling={cancelPayout.isPending}
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Daily Breakdown */}
      <div className="mt-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">
          Daily Breakdown
        </h2>
        <Card className="overflow-hidden p-0">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">No data yet</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-charcoal/10 bg-beige/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-charcoal">Date</th>
                  <th className="px-5 py-3 font-semibold text-charcoal">Deliveries</th>
                  <th className="px-5 py-3 text-right font-semibold text-charcoal">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((day) => (
                  <tr
                    key={day.date}
                    className="border-b border-charcoal/5 transition-colors hover:bg-beige/30"
                  >
                    <td className="px-5 py-3 text-charcoal">
                      {new Date(day.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-5 py-3 text-warm-gray">{day.deliveries}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">
                      ₹{day.earnings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {/* Achievements */}
      {stats?.partner && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-bold text-charcoal">
            Achievements
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AchievementCard
              icon={Award}
              title="Delivery Streak"
              value={`${stats.partner.totalDeliveries}`}
              description={
                stats.partner.totalDeliveries >= 100
                  ? '🎉 Century Club!'
                  : `${100 - stats.partner.totalDeliveries} more to Century Club`
              }
              unlocked={stats.partner.totalDeliveries >= 100}
            />
            <AchievementCard
              icon={IndianRupee}
              title="Earnings Milestone"
              value={`₹${stats.partner.totalEarnings.toLocaleString('en-IN')}`}
              description={
                stats.partner.totalEarnings >= 10000
                  ? '💰 ₹10k Club!'
                  : `₹${(10000 - stats.partner.totalEarnings).toLocaleString('en-IN')} to ₹10k`
              }
              unlocked={stats.partner.totalEarnings >= 10000}
            />
            <AchievementCard
              icon={TrendingUp}
              title="Rating"
              value={`${stats.partner.rating.toFixed(1)} ★`}
              description={
                stats.partner.rating >= 4.8
                  ? '⭐ Top Rated!'
                  : 'Maintain 4.8+ for top rating'
              }
              unlocked={stats.partner.rating >= 4.8}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onNeedPayoutMethod={() => {
          setWithdrawOpen(false)
          setPayoutMethodOpen(true)
        }}
      />

      <PayoutMethodModal
        isOpen={payoutMethodOpen}
        onClose={() => setPayoutMethodOpen(false)}
      />
    </div>
  )
}

// ============================================
// Payout Row
// ============================================

function PayoutRow({
  payout,
  onCancel,
  isCancelling,
}: {
  payout: any
  onCancel: () => void
  isCancelling: boolean
}) {
  const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
    pending: { variant: 'warning', label: 'Pending', icon: Clock },
    processing: { variant: 'info', label: 'Processing', icon: Clock },
    completed: { variant: 'success', label: 'Completed', icon: CheckCircle2 },
    failed: { variant: 'danger', label: 'Failed', icon: XCircle },
    cancelled: { variant: 'neutral', label: 'Cancelled', icon: XCircle },
  }

  const config = statusConfig[payout.status] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
            payout.method === 'upi' ? 'bg-blue-100' : 'bg-purple-100'
          )}
        >
          {payout.method === 'upi' ? (
            <Smartphone className="h-5 w-5 text-blue-600" />
          ) : (
            <CreditCard className="h-5 w-5 text-purple-600" />
          )}
        </div>
        <div>
          <p className="font-semibold text-charcoal">₹{payout.amount}</p>
          <p className="text-xs text-warm-gray">
            {new Date(payout.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {payout.method === 'upi' && payout.payoutDetails?.upiId && (
              <> · {payout.payoutDetails.upiId}</>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>
          <span className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </Badge>
        {payout.status === 'pending' && (
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="text-xs font-semibold text-tomato hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================
// Achievement Card
// ============================================

function AchievementCard({
  icon: Icon,
  title,
  value,
  description,
  unlocked,
}: {
  icon: React.ElementType
  title: string
  value: string
  description: string
  unlocked: boolean
}) {
  return (
    <Card
      className={cn(
        'p-5 transition-all',
        unlocked && 'border-l-4 border-l-gold shadow-warm'
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'rounded-xl p-2',
            unlocked ? 'bg-gold/10 text-gold' : 'bg-charcoal/5 text-charcoal/40'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {unlocked && <Badge variant="success">Unlocked</Badge>}
      </div>
      <p className="mt-3 font-display text-xl font-bold text-charcoal">{value}</p>
      <p className="text-sm font-semibold text-charcoal/80">{title}</p>
      <p className="mt-1 text-xs text-warm-gray">{description}</p>
    </Card>
  )
}
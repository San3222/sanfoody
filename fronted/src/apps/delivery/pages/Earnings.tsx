// src/apps/delivery/pages/Earnings.tsx
import { useMemo, useState } from 'react'
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
  Target,
  Gift,
  HelpCircle,
  ChevronRight,
  Zap,
  Bike,
  Trophy,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
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

// ---------- Config ----------
const MIN_WITHDRAW = 100
const SUPPORT_EMAIL = 'support@sanfoody.com' // TODO: apna support email/number daalo

// Weekly incentive slabs (deliveries in last 7 days -> bonus). Backend se aaye to yahan replace karo.
const WEEKLY_SLABS = [
  { deliveries: 20, bonus: 200 },
  { deliveries: 40, bonus: 500 },
  { deliveries: 60, bonus: 900 },
]

type Period = '7d' | '30d'
type PayoutFilter = 'all' | 'pending' | 'completed' | 'failed'

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const dayKey = (d: Date) => d.toDateString()
const daysAgo = (n: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

export function DeliveryEarnings() {
  const [period, setPeriod] = useState<Period>('7d')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [payoutMethodOpen, setPayoutMethodOpen] = useState(false)
  const [payoutFilter, setPayoutFilter] = useState<PayoutFilter>('all')
  const [historyLimit, setHistoryLimit] = useState(5)
  const [showAllDays, setShowAllDays] = useState(false)

  const { data, isLoading, refetch, isRefetching } = useEarnings()
  const { data: stats } = useDeliveryStats()
  const { data: balance, refetch: refetchBalance } = useWalletBalance()
  const { data: method } = usePayoutMethod()
  const { data: historyData, refetch: refetchHistory } = usePayoutHistory(1, historyLimit)
  const cancelPayout = useCancelPayout()
  const { showToast } = useToast()

  const summary = data?.summary
  const allDaily: any[] = useMemo(
    () =>
      [...(data?.daily ?? [])].sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    [data]
  )
  const payouts: any[] = historyData?.payouts ?? []

  // ---------- Derived: periods ----------
  const sumRange = (from: Date) =>
    allDaily
      .filter((d) => new Date(d.date) >= from)
      .reduce(
        (acc, d) => ({
          earnings: acc.earnings + (d.earnings || 0),
          deliveries: acc.deliveries + (d.deliveries || 0),
        }),
        { earnings: 0, deliveries: 0 }
      )

  const today = useMemo(() => {
    const k = dayKey(new Date())
    const row = allDaily.find((d) => dayKey(new Date(d.date)) === k)
    return { earnings: row?.earnings ?? 0, deliveries: row?.deliveries ?? 0 }
  }, [allDaily])
  const week = useMemo(() => sumRange(daysAgo(6)), [allDaily])
  const month = useMemo(() => sumRange(daysAgo(29)), [allDaily])

  const filteredData = useMemo(() => {
    const from = daysAgo(period === '7d' ? 6 : 29)
    return allDaily.filter((d) => new Date(d.date) >= from)
  }, [allDaily, period])

  const periodTotals = filteredData.reduce(
    (acc, d) => ({
      earnings: acc.earnings + (d.earnings || 0),
      deliveries: acc.deliveries + (d.deliveries || 0),
      tips: acc.tips + (d.tips || 0),
      incentives: acc.incentives + (d.incentives ?? d.incentive ?? 0),
      distance: acc.distance + (d.distancePay || 0),
    }),
    { earnings: 0, deliveries: 0, tips: 0, incentives: 0, distance: 0 }
  )
  const deliveryFee = Math.max(
    periodTotals.earnings - periodTotals.tips - periodTotals.incentives - periodTotals.distance,
    0
  )

  const maxEarnings = Math.max(...filteredData.map((d) => d.earnings || 0), 1)
  const activeDays = filteredData.filter((d) => d.earnings > 0).length
  const avgPerDay = activeDays ? periodTotals.earnings / activeDays : 0
  const bestDay = filteredData.reduce<any>(
    (best, d) => (!best || d.earnings > best.earnings ? d : best),
    null
  )
  const selectedDay =
    filteredData.find((d) => d.date === selectedDate) ?? null

  // ---------- Wallet ----------
  const balanceAmount = balance?.balance ?? 0
  const pendingAmount = balance?.pending ?? 0
  const hasPayoutMethod = !!method && !!method.type
  const hasPendingPayout = pendingAmount > 0
  const canWithdraw = !hasPendingPayout && balanceAmount >= MIN_WITHDRAW
  const minProgress = Math.min((balanceAmount / MIN_WITHDRAW) * 100, 100)

  // ---------- Weekly incentive ----------
  const nextSlab = WEEKLY_SLABS.find((s) => week.deliveries < s.deliveries)
  const lastReached = [...WEEKLY_SLABS].reverse().find((s) => week.deliveries >= s.deliveries)
  const topSlab = WEEKLY_SLABS[WEEKLY_SLABS.length - 1]
  const weekPct = Math.min((week.deliveries / topSlab.deliveries) * 100, 100)

  // ---------- Payout filter ----------
  const visiblePayouts = payouts.filter((p) => {
    if (payoutFilter === 'all') return true
    if (payoutFilter === 'pending') return ['pending', 'processing'].includes(p.status)
    return p.status === payoutFilter
  })

  // ---------- Handlers ----------
  const handleRefresh = () => {
    refetch()
    refetchBalance()
    refetchHistory()
  }

  const handleDownload = () => {
    if (filteredData.length === 0) {
      showToast('info', 'No earnings to download yet')
      return
    }
    const headers = 'Date,Deliveries,Earnings\n'
    const rows = filteredData.map((d) => `${d.date},${d.deliveries},${d.earnings}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
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
      showToast('info', 'Add a payout method first')
      setPayoutMethodOpen(true)
      return
    }
    setWithdrawOpen(true)
  }

  const handleCancelPayout = (id: string) => {
    if (!confirm('Cancel this withdrawal? The amount will return to your balance.')) return
    cancelPayout.mutate(id, {
      onSuccess: () => {
        showToast('success', 'Withdrawal cancelled and refunded')
        refetchBalance()
        refetchHistory()
      },
      onError: (err: any) => showToast('error', err.message || 'Could not cancel withdrawal'),
    })
  }

  const handleHelp = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=Earnings%20help`
  }

  return (
    <div className="pb-10">
      {/* ================= Header ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Earnings</h1>
          <p className="mt-1 text-sm text-warm-gray">Your income, incentives and withdrawals</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            onClick={handleRefresh}
            disabled={isRefetching}
            label="Refresh"
            iconOnly
            icon={<RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />}
          />
          <ActionButton
            onClick={handleDownload}
            label="Statement"
            icon={<Download className="h-4 w-4" />}
          />
          <ActionButton
            onClick={handleHelp}
            label="Help"
            variant="primary"
            icon={<HelpCircle className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* ================= Wallet ================= */}
      <Card className="mt-6 overflow-hidden p-0">
        <div className="bg-linear-to-br from-green-500 to-emerald-700 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Available balance</p>
              <p className="mt-1 font-display text-4xl font-extrabold tracking-tight">
                {inr(balanceAmount)}
              </p>
              {hasPendingPayout && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  {inr(pendingAmount)} withdrawal in progress
                </p>
              )}
            </div>

            {hasPayoutMethod && (
              <button
                onClick={() => setPayoutMethodOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
                title="Change payout method"
              >
                {method?.type === 'upi' ? (
                  <Smartphone className="h-3.5 w-3.5" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" />
                )}
                {method?.type === 'upi' ? method.upiId : 'Bank account'}
                <ChevronRight className="h-3.5 w-3.5 opacity-70" />
              </button>
            )}
          </div>

          {/* Progress to minimum withdrawal */}
          {!hasPendingPayout && balanceAmount < MIN_WITHDRAW && (
            <div className="mt-5">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${minProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-white/80">
                {inr(MIN_WITHDRAW - balanceAmount)} more to unlock withdrawals (min {inr(MIN_WITHDRAW)})
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleWithdrawClick}
              disabled={!canWithdraw}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-green-700 shadow-sm transition active:scale-[0.98] hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-green-600 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/80 disabled:shadow-none disabled:hover:bg-white/20"
            >
              <Wallet className="h-4 w-4" />
              {hasPendingPayout
                ? 'Withdrawal in progress'
                : balanceAmount < MIN_WITHDRAW
                  ? `Withdraw (min ${inr(MIN_WITHDRAW)})`
                  : `Withdraw ${inr(balanceAmount)}`}
            </button>
            {!hasPayoutMethod && (
              <button
                onClick={() => setPayoutMethodOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-5 text-sm font-bold text-white transition hover:bg-white/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Plus className="h-4 w-4" />
                Add payout method
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-charcoal/10 border-t border-charcoal/10 bg-white">
          <WalletStat label="Total earned" value={inr(summary?.totalEarnings ?? 0)} />
          <WalletStat label="Withdrawn" value={inr(balance?.lifetimeWithdrawn ?? 0)} />
          <WalletStat label="Withdrawals" value={String(balance?.totalWithdrawals ?? 0)} />
        </div>
      </Card>

      {/* ================= Today / Week / Month ================= */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SnapshotCard icon={Zap} tone="orange" label="Today" amount={today.earnings} deliveries={today.deliveries} />
        <SnapshotCard icon={Calendar} tone="blue" label="Last 7 days" amount={week.earnings} deliveries={week.deliveries} />
        <SnapshotCard icon={TrendingUp} tone="green" label="Last 30 days" amount={month.earnings} deliveries={month.deliveries} />
      </div>

      {/* ================= Weekly incentive ================= */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <Gift className="h-5 w-5 text-gold" />
              Weekly incentive
            </h2>
            <p className="mt-1 text-sm text-warm-gray">
              {nextSlab
                ? `${nextSlab.deliveries - week.deliveries} more deliveries to earn ${inr(nextSlab.bonus)} bonus`
                : `You unlocked the top bonus of ${inr(topSlab.bonus)} this week`}
            </p>
          </div>
          {lastReached && <Badge variant="success">{inr(lastReached.bonus)} unlocked</Badge>}
        </div>

        <div className="px-6 pb-12 pt-8">
          <div className="relative">
            <div className="h-2.5 overflow-hidden rounded-full bg-charcoal/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-tomato to-orange transition-all duration-500"
                style={{ width: `${weekPct}%` }}
              />
            </div>
            {WEEKLY_SLABS.map((s) => {
              const reached = week.deliveries >= s.deliveries
              const left = (s.deliveries / topSlab.deliveries) * 100
              return (
                <div
                  key={s.deliveries}
                  className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${left}%` }}
                >
                  <div
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full border-[3px] border-white shadow-sm',
                      reached ? 'bg-green-500 text-white' : 'bg-charcoal/15 text-charcoal/40'
                    )}
                  >
                    {reached ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Target className="h-3 w-3" />}
                  </div>
                  <div className="absolute top-9 text-center leading-tight">
                    <p className="text-xs font-bold text-charcoal">{inr(s.bonus)}</p>
                    <p className="whitespace-nowrap text-[11px] text-warm-gray">{s.deliveries} orders</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-xs text-warm-gray">
          {week.deliveries} deliveries completed in the last 7 days
        </p>
      </Card>

      {/* ================= Trend chart ================= */}
      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <BarChart3 className="h-5 w-5 text-tomato" />
              Earnings trend
            </h2>
            <p className="mt-1 text-sm text-warm-gray">
              {inr(periodTotals.earnings)} from {periodTotals.deliveries} deliveries
            </p>
          </div>
          <div className="flex gap-1 rounded-full bg-charcoal/5 p-1">
            {(['7d', '30d'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p)
                  setSelectedDate(null)
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                  period === p ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {p === '7d' ? 'Last 7 days' : 'Last 30 days'}
              </button>
            ))}
          </div>
        </div>

        {/* mini stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <MiniStat label="Avg / active day" value={inr(avgPerDay)} />
          <MiniStat label="Active days" value={`${activeDays}`} />
          <MiniStat label="Best day" value={bestDay ? inr(bestDay.earnings) : '—'} />
        </div>

        {isLoading ? (
          <div className="mt-6 flex h-44 items-end gap-2">
            {[...Array(period === '7d' ? 7 : 15)].map((_, i) => (
              <div
                key={i}
                className="flex-1 animate-pulse rounded-t-lg bg-charcoal/5"
                style={{ height: `${30 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="mt-6 flex h-44 flex-col items-center justify-center">
            <BarChart3 className="h-12 w-12 text-charcoal/20" />
            <p className="mt-3 text-sm text-warm-gray">No earnings in this period</p>
            <p className="text-xs text-warm-gray">Go online and accept orders to start earning</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex h-44 items-stretch gap-1.5">
              {filteredData.map((day) => {
                const pct = Math.max(((day.earnings || 0) / maxEarnings) * 100, 3)
                const active = selectedDate === day.date
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(active ? null : day.date)}
                    className="group flex flex-1 flex-col justify-end focus:outline-none"
                    aria-label={`${new Date(day.date).toDateString()}: ${inr(day.earnings)}`}
                  >
                    <div
                      className={cn(
                        'w-full rounded-t-md transition-all',
                        active
                          ? 'bg-linear-to-t from-tomato to-orange'
                          : 'bg-tomato/30 group-hover:bg-tomato/60'
                      )}
                      style={{ height: `${pct}%`, minHeight: '6px' }}
                    />
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-warm-gray">
              <span>
                {new Date(filteredData[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <span>
                {new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-charcoal/5 px-4 py-3 text-sm">
              {selectedDay ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal">
                    {new Date(selectedDay.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-warm-gray">
                    {selectedDay.deliveries} deliveries ·{' '}
                    <b className="text-green-600">{inr(selectedDay.earnings)}</b>
                  </span>
                </div>
              ) : (
                <span className="text-warm-gray">Tap a bar to see that day's earnings</span>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ================= Breakdown ================= */}
      {periodTotals.earnings > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="font-display text-lg font-bold text-charcoal">Where your money came from</h2>
          <p className="mt-1 text-sm text-warm-gray">
            {period === '7d' ? 'Last 7 days' : 'Last 30 days'}
          </p>
          <div className="mt-5 space-y-4">
            <BreakdownRow icon={Bike} label="Delivery fees" amount={deliveryFee} total={periodTotals.earnings} color="bg-tomato" />
            {periodTotals.distance > 0 && (
              <BreakdownRow icon={Zap} label="Distance pay" amount={periodTotals.distance} total={periodTotals.earnings} color="bg-orange" />
            )}
            <BreakdownRow icon={IndianRupee} label="Customer tips" amount={periodTotals.tips} total={periodTotals.earnings} color="bg-green-500" />
            <BreakdownRow icon={Gift} label="Incentives & bonus" amount={periodTotals.incentives} total={periodTotals.earnings} color="bg-gold" />
          </div>
        </Card>
      )}

      {/* ================= Withdrawal history ================= */}
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-charcoal">Withdrawal history</h2>
          <div className="flex gap-1 rounded-full bg-charcoal/5 p-1">
            {(['all', 'pending', 'completed', 'failed'] as PayoutFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setPayoutFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors',
                  payoutFilter === f ? 'bg-tomato text-cream' : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          {visiblePayouts.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">
                {payoutFilter === 'all' ? 'No withdrawals yet' : `No ${payoutFilter} withdrawals`}
              </p>
              {payoutFilter === 'all' && (
                <p className="text-xs text-warm-gray">Your first withdrawal will show up here</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-charcoal/5">
              {visiblePayouts.map((payout) => (
                <PayoutRow
                  key={payout._id}
                  payout={payout}
                  onCancel={() => handleCancelPayout(payout._id)}
                  isCancelling={cancelPayout.isPending}
                />
              ))}
            </div>
          )}
          {(balance?.totalWithdrawals ?? 0) > historyLimit && (
            <button
              onClick={() => setHistoryLimit((l) => l + 10)}
              className="w-full border-t border-charcoal/10 py-3 text-sm font-semibold text-tomato hover:bg-beige/40"
            >
              View more
            </button>
          )}
        </Card>
      </div>

      {/* ================= Daily breakdown ================= */}
      <div className="mt-6">
        <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Daily breakdown</h2>
        <Card className="overflow-hidden p-0">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-charcoal/20" />
              <p className="mt-3 text-sm text-warm-gray">No data yet</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-charcoal/10 bg-beige/50">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-charcoal">Date</th>
                    <th className="px-5 py-3 font-semibold text-charcoal">Deliveries</th>
                    <th className="px-5 py-3 text-right font-semibold text-charcoal">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredData]
                    .reverse()
                    .slice(0, showAllDays ? undefined : 7)
                    .map((day) => (
                      <tr
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className="cursor-pointer border-b border-charcoal/5 transition-colors hover:bg-beige/30"
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
                          {inr(day.earnings)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {filteredData.length > 7 && (
                <button
                  onClick={() => setShowAllDays((v) => !v)}
                  className="w-full py-3 text-sm font-semibold text-tomato hover:bg-beige/40"
                >
                  {showAllDays ? 'Show less' : `Show all ${filteredData.length} days`}
                </button>
              )}
            </>
          )}
        </Card>
      </div>

      {/* ================= Achievements ================= */}
      {stats?.partner && (
        <div className="mt-6">
          <h2 className="mb-4 font-display text-lg font-bold text-charcoal">Milestones</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AchievementCard
              icon={Award}
              title="Total deliveries"
              value={`${stats.partner.totalDeliveries}`}
              description={
                stats.partner.totalDeliveries >= 100
                  ? 'Century Club member'
                  : `${100 - stats.partner.totalDeliveries} more to reach Century Club`
              }
              progress={Math.min(stats.partner.totalDeliveries / 100, 1)}
              unlocked={stats.partner.totalDeliveries >= 100}
            />
            <AchievementCard
              icon={IndianRupee}
              title="Lifetime earnings"
              value={inr(stats.partner.totalEarnings)}
              description={
                stats.partner.totalEarnings >= 10000
                  ? '₹10k Club member'
                  : `${inr(10000 - stats.partner.totalEarnings)} more to reach ₹10k Club`
              }
              progress={Math.min(stats.partner.totalEarnings / 10000, 1)}
              unlocked={stats.partner.totalEarnings >= 10000}
            />
            <AchievementCard
              icon={Trophy}
              title="Customer rating"
              value={`${stats.partner.rating.toFixed(1)} ★`}
              description={
                stats.partner.rating >= 4.8 ? 'Top rated partner' : 'Keep 4.8+ to become top rated'
              }
              progress={Math.min(stats.partner.rating / 5, 1)}
              unlocked={stats.partner.rating >= 4.8}
            />
          </div>
        </div>
      )}

      {/* ================= Help strip ================= */}
      <Card className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-semibold text-charcoal">Payment missing or wrong?</p>
          <p className="text-sm text-warm-gray">Our support team usually replies within 24 hours.</p>
        </div>
        <ActionButton
          onClick={handleHelp}
          label="Contact support"
          icon={<HelpCircle className="h-4 w-4" />}
        />
      </Card>

      {/* ================= Modals ================= */}
      <WithdrawModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onNeedPayoutMethod={() => {
          setWithdrawOpen(false)
          setPayoutMethodOpen(true)
        }}
      />
      <PayoutMethodModal isOpen={payoutMethodOpen} onClose={() => setPayoutMethodOpen(false)} />
    </div>
  )
}

// ============================================
// Sub components
// ============================================

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  iconOnly,
  variant = 'default',
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  iconOnly?: boolean
  variant?: 'default' | 'primary'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        iconOnly ? 'w-10' : 'px-4',
        variant === 'primary'
          ? 'bg-tomato text-cream shadow-sm hover:opacity-90'
          : 'border border-charcoal/15 bg-white text-charcoal shadow-sm hover:bg-beige/60'
      )}
    >
      {icon}
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}

function WalletStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs text-warm-gray">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-charcoal">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-charcoal/10 px-3 py-2.5">
      <p className="text-[11px] text-warm-gray">{label}</p>
      <p className="font-display text-base font-bold text-charcoal">{value}</p>
    </div>
  )
}

function SnapshotCard({
  icon: Icon,
  tone,
  label,
  amount,
  deliveries,
}: {
  icon: React.ElementType
  tone: 'orange' | 'blue' | 'green'
  label: string
  amount: number
  deliveries: number
}) {
  const tones = {
    orange: 'bg-orange/10 text-orange',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
  }
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-xl p-2', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-warm-gray">{label}</p>
          <p className="font-display text-2xl font-bold text-charcoal">{inr(amount)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-warm-gray">
        {deliveries} {deliveries === 1 ? 'delivery' : 'deliveries'}
        {deliveries > 0 && ` · ${inr(amount / deliveries)} avg`}
      </p>
    </Card>
  )
}

function BreakdownRow({
  icon: Icon,
  label,
  amount,
  total,
  color,
}: {
  icon: React.ElementType
  label: string
  amount: number
  total: number
  color: string
}) {
  const pct = total ? (amount / total) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-charcoal">
          <Icon className="h-4 w-4 text-warm-gray" />
          {label}
        </span>
        <span className="font-semibold text-charcoal">{inr(amount)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

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
          <p className="font-semibold text-charcoal">{inr(payout.amount)}</p>
          <p className="text-xs text-warm-gray">
            {new Date(payout.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
            {payout.method === 'upi' && payout.payoutDetails?.upiId && <> · {payout.payoutDetails.upiId}</>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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

function AchievementCard({
  icon: Icon,
  title,
  value,
  description,
  progress,
  unlocked,
}: {
  icon: React.ElementType
  title: string
  value: string
  description: string
  progress: number
  unlocked: boolean
}) {
  return (
    <Card className={cn('p-5 transition-all', unlocked && 'border-l-4 border-l-gold shadow-warm')}>
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
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-charcoal/10">
        <div
          className={cn('h-full rounded-full', unlocked ? 'bg-gold' : 'bg-tomato')}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-warm-gray">{description}</p>
    </Card>
  )
}
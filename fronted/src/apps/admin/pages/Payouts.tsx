// src/apps/admin/pages/Payouts.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Wallet,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Landmark,
  Search,
  X,
  Copy,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { AdminButton } from '@/components/ui/AdminButton'
import {
  useAdminPayouts,
  useApprovePayout,
  useCompletePayout,
  useRejectPayout,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
] as const

const METHOD_FILTERS = [
  { id: 'all', label: 'All methods' },
  { id: 'upi', label: 'UPI' },
  { id: 'bank', label: 'Bank' },
] as const

const STATUS_CONFIG: Record<string, { variant: any; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  processing: { variant: 'info', label: 'Processing' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
}

const REJECT_REASONS = ['Invalid UPI ID', 'Wrong bank details', 'Name mismatch', 'Suspicious activity']

// ============================================
// Helpers
// ============================================

const inr = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const maskAccount = (v?: string) =>
  !v ? '—' : v.length <= 4 ? v : `•••• ${v.slice(-4)}`

function exportCsv(payouts: any[]) {
  const header = ['Requested', 'Partner', 'Email', 'Phone', 'Amount', 'Method', 'UPI / Account', 'IFSC', 'Status', 'Transaction ID']
  const rows = payouts.map((p) => [
    new Date(p.createdAt).toISOString(),
    p.partnerId?.name ?? '',
    p.partnerId?.email ?? '',
    p.partnerId?.phone ?? '',
    p.amount,
    p.method,
    p.method === 'upi' ? p.payoutDetails?.upiId ?? '' : p.payoutDetails?.accountNumber ?? '',
    p.payoutDetails?.ifscCode ?? '',
    p.status,
    p.transactionId ?? '',
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payouts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ============================================
// Page
// ============================================

export function AdminPayouts() {
  const { showToast } = useToast()

  const [filter, setFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [approveModal, setApproveModal] = useState<any>(null)
  const [completeModal, setCompleteModal] = useState<any>(null)
  const [rejectModal, setRejectModal] = useState<any>(null)
  const [transactionId, setTransactionId] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, refetch, isRefetching } = useAdminPayouts(filter, page, 20)
  const approve = useApprovePayout()
  const complete = useCompletePayout()
  const reject = useRejectPayout()

  const payouts: any[] = data?.payouts ?? []
  const stats: any = data?.stats ?? {}
  const busy = approve.isPending || complete.isPending || reject.isPending

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  // Search + method filter run on the loaded page
  const visiblePayouts = useMemo(
    () =>
      payouts.filter((p) => {
        if (methodFilter !== 'all' && p.method !== methodFilter) return false
        if (!search) return true
        const hay = [
          p.partnerId?.name,
          p.partnerId?.email,
          p.partnerId?.phone,
          p.payoutDetails?.upiId,
          p.payoutDetails?.accountNumber,
          p.payoutDetails?.accountHolderName,
          p.transactionId,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(search)
      }),
    [payouts, methodFilter, search]
  )

  const pendingCount = stats.pending?.count || 0
  const pendingAmount = stats.pending?.amount || 0

  const statCards = [
    { id: 'pending', label: 'Pending', icon: Clock, tint: 'bg-amber-50 text-amber-600' },
    { id: 'processing', label: 'Processing', icon: RefreshCw, tint: 'bg-blue-50 text-blue-600' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, tint: 'bg-green-50 text-green-600' },
    { id: 'failed', label: 'Failed', icon: XCircle, tint: 'bg-red-50 text-red-600' },
  ]

  // ----- handlers -----
  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('success', `${label} copied`)
    } catch {
      showToast('error', 'Copy failed')
    }
  }

  const changeFilter = (id: string) => {
    setFilter(id)
    setPage(1)
  }

  const handleApprove = () => {
    if (!approveModal) return
    approve.mutate(approveModal._id, {
      onSuccess: () => {
        showToast('success', 'Payout approved for processing')
        setApproveModal(null)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleComplete = () => {
    if (!completeModal) return
    complete.mutate(
      { id: completeModal._id, transactionId },
      {
        onSuccess: () => {
          showToast('success', 'Payout marked completed')
          setCompleteModal(null)
          setTransactionId('')
        },
        onError: (err: any) => showToast('error', err.message || 'Failed'),
      }
    )
  }

  const handleReject = () => {
    if (!rejectModal) return
    reject.mutate(
      { id: rejectModal._id, reason: rejectReason },
      {
        onSuccess: () => {
          showToast('success', 'Payout rejected and refunded')
          setRejectModal(null)
          setRejectReason('')
        },
        onError: (err: any) => showToast('error', err.message || 'Failed'),
      }
    )
  }

  const handleExport = () => {
    if (visiblePayouts.length === 0) return showToast('error', 'Nothing to export')
    exportCsv(visiblePayouts)
    showToast('success', `Exported ${visiblePayouts.length} payouts`)
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Payout Approvals</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Review and process delivery partner withdrawal requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminButton variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </AdminButton>
          <AdminButton variant="primary" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={cn('h-4 w-4', isRefetching && 'animate-spin')} />
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Needs-action banner */}
      {pendingCount > 0 && filter !== 'pending' && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              <strong>{pendingCount}</strong> payout{pendingCount !== 1 ? 's' : ''} waiting for
              approval · <strong>{inr(pendingAmount)}</strong>
            </p>
          </div>
          <AdminButton variant="primary" className="h-8 px-3.5 text-xs" onClick={() => changeFilter('pending')}>
            Review now
          </AdminButton>
        </div>
      )}

      {/* Stats (click to filter) */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => {
          const active = filter === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => changeFilter(active ? 'all' : s.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition-all',
                active
                  ? 'border-tomato bg-tomato/[0.04] shadow-sm'
                  : 'border-charcoal/10 hover:border-charcoal/20 hover:shadow-sm'
              )}
            >
              <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', s.tint)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-warm-gray">{s.label}</p>
                <p className="font-display text-xl font-bold leading-tight text-charcoal">
                  {stats[s.id]?.count || 0}
                </p>
                <p className="text-xs font-medium text-charcoal/60">{inr(stats[s.id]?.amount || 0)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-xl bg-beige/50 px-3.5 focus-within:bg-beige/80">
            <Search className="h-4 w-4 shrink-0 text-warm-gray" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search partner, UPI ID, account or UTR..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="text-warm-gray hover:text-charcoal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1 rounded-xl bg-beige/50 p-1">
            {METHOD_FILTERS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethodFilter(m.id)}
                className={cn(
                  'h-8 rounded-lg px-3.5 text-sm font-semibold transition-all',
                  methodFilter === m.id
                    ? 'bg-white text-tomato shadow-sm'
                    : 'text-charcoal/60 hover:text-charcoal'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto rounded-xl bg-beige/50 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => changeFilter(tab.id)}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-all',
                filter === tab.id
                  ? 'bg-white text-tomato shadow-sm'
                  : 'text-charcoal/60 hover:text-charcoal'
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-charcoal/5" />
            ))}
          </div>
        ) : visiblePayouts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-charcoal/5">
              <Wallet className="h-6 w-6 text-charcoal/30" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-charcoal">
              No {filter === 'all' ? '' : filter} payouts
            </p>
            <p className="mt-1 text-sm text-warm-gray">
              {search || methodFilter !== 'all'
                ? 'Try changing your search or filters.'
                : 'Withdrawal requests will show up here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-beige/40 text-[11px] uppercase tracking-wider text-warm-gray">
                  <th className="py-3 pl-5 pr-3 font-semibold">Partner</th>
                  <th className="px-3 py-3 font-semibold">Amount</th>
                  <th className="px-3 py-3 font-semibold">Payout details</th>
                  <th className="px-3 py-3 font-semibold">Requested</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="py-3 pl-3 pr-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePayouts.map((p) => {
                  const partner = p.partnerId || {}
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  const isUpi = p.method === 'upi'
                  const detailValue = isUpi ? p.payoutDetails?.upiId : p.payoutDetails?.accountNumber
                  const partnerName =
                    partner.name || p.payoutDetails?.accountHolderName || 'Unknown partner'

                  return (
                    <tr
                      key={p._id}
                      className="border-b border-charcoal/5 transition-colors last:border-0 hover:bg-beige/30"
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tomato/10 text-sm font-bold text-tomato">
                            {partnerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-charcoal">{partnerName}</p>
                            <p className="truncate text-xs text-warm-gray">
                              {partner.email || partner.phone || 'No contact info'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5 font-display text-base font-bold text-charcoal">
                        {inr(p.amount)}
                      </td>

                      <td className="px-3 py-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                              isUpi ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            )}
                          >
                            {isUpi ? <Smartphone className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
                              {isUpi ? 'UPI' : 'Bank transfer'}
                            </p>
                            <button
                              onClick={() => detailValue && copy(detailValue, isUpi ? 'UPI ID' : 'Account number')}
                              title="Copy"
                              className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-xs text-charcoal hover:text-tomato"
                            >
                              {isUpi ? detailValue || '—' : maskAccount(detailValue)}
                              <Copy className="h-3 w-3" />
                            </button>
                            {!isUpi && (
                              <p className="mt-0.5 text-[11px] text-warm-gray">
                                {p.payoutDetails?.ifscCode} · {p.payoutDetails?.accountHolderName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3.5 text-xs text-warm-gray">
                        {fmtDate(p.createdAt)}
                        {p.completedAt && (
                          <p className="mt-0.5 text-green-700">Paid {fmtDate(p.completedAt)}</p>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {p.status === 'failed' && p.failureReason && (
                          <p className="mt-1 max-w-[160px] text-[11px] text-red-600">{p.failureReason}</p>
                        )}
                      </td>

                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === 'pending' && (
                            <>
                              <AdminButton
                                variant="soft-danger"
                                onClick={() => setRejectModal(p)}
                                disabled={busy}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </AdminButton>
                              <AdminButton
                                variant="primary"
                                onClick={() => setApproveModal(p)}
                                disabled={busy}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </AdminButton>
                            </>
                          )}

                          {p.status === 'processing' && (
                            <>
                              <AdminButton
                                variant="soft-danger"
                                onClick={() => setRejectModal(p)}
                                disabled={busy}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject
                              </AdminButton>
                              <AdminButton
                                variant="success"
                                onClick={() => setCompleteModal(p)}
                                disabled={busy}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Mark paid
                              </AdminButton>
                            </>
                          )}

                          {p.status === 'completed' &&
                            (p.transactionId ? (
                              <button
                                onClick={() => copy(p.transactionId, 'Transaction ID')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 font-mono text-[11px] text-green-700 hover:bg-green-100"
                                title="Copy transaction ID"
                              >
                                UTR {p.transactionId}
                                <Copy className="h-3 w-3" />
                              </button>
                            ) : (
                              <span className="text-xs text-warm-gray">No UTR recorded</span>
                            ))}

                          {(p.status === 'failed' || p.status === 'cancelled') && (
                            <span className="text-xs text-warm-gray">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 px-5 py-3">
            <p className="text-xs text-warm-gray">
              Page {data.page ?? page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <AdminButton
                size="icon"
                variant="secondary"
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </AdminButton>
              <span className="px-3 text-sm font-semibold text-charcoal">
                {page} / {data.totalPages}
              </span>
              <AdminButton
                size="icon"
                variant="secondary"
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </AdminButton>
            </div>
          </div>
        )}
      </div>

      {/* Approve modal */}
      <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title="Approve payout">
        {approveModal && <PayoutSummary payout={approveModal} copy={copy} />}
        <p className="mt-3 text-xs text-warm-gray">
          Approving moves this request to <strong>Processing</strong>. Transfer the money, then mark
          it as paid with the UTR.
        </p>
        <div className="mt-5 flex gap-3">
          <AdminButton variant="secondary" size="md" className="flex-1" onClick={() => setApproveModal(null)}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" size="md" className="flex-1" onClick={handleApprove} disabled={approve.isPending}>
            {approve.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {approve.isPending ? 'Approving...' : 'Approve'}
          </AdminButton>
        </div>
      </Modal>

      {/* Complete modal */}
      <Modal
        isOpen={!!completeModal}
        onClose={() => {
          setCompleteModal(null)
          setTransactionId('')
        }}
        title="Mark payout as paid"
      >
        {completeModal && <PayoutSummary payout={completeModal} copy={copy} full />}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-charcoal">
            Transaction ID / UTR (optional)
          </label>
          <Input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g., UTR123456789"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => {
              setCompleteModal(null)
              setTransactionId('')
            }}
          >
            Cancel
          </AdminButton>
          <AdminButton variant="success" size="md" className="flex-1" onClick={handleComplete} disabled={complete.isPending}>
            {complete.isPending ? 'Completing...' : 'Mark paid'}
          </AdminButton>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => {
          setRejectModal(null)
          setRejectReason('')
        }}
        title="Reject payout"
      >
        {rejectModal && <PayoutSummary payout={rejectModal} copy={copy} />}
        <p className="mt-3 text-xs text-warm-gray">
          The amount will be refunded to the partner's wallet.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-charcoal">Reason</label>
          <div className="mb-3 flex flex-wrap gap-2">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRejectReason(r)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  rejectReason === r
                    ? 'bg-tomato text-cream'
                    : 'bg-beige/70 text-charcoal/70 hover:bg-beige'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g., Invalid UPI ID"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => {
              setRejectModal(null)
              setRejectReason('')
            }}
          >
            Cancel
          </AdminButton>
          <AdminButton variant="danger" size="md" className="flex-1" onClick={handleReject} disabled={reject.isPending}>
            {reject.isPending ? 'Rejecting...' : 'Confirm reject'}
          </AdminButton>
        </div>
      </Modal>
    </div>
  )
}

// ============================================
// Modal summary
// ============================================

function PayoutSummary({
  payout,
  copy,
  full = false,
}: {
  payout: any
  copy: (t: string, label: string) => void
  full?: boolean
}) {
  const partner = payout.partnerId || {}
  const isUpi = payout.method === 'upi'
  const d = payout.payoutDetails || {}

  const rows: { label: string; value?: string; copyable?: boolean }[] = [
    { label: 'Partner', value: partner.name || d.accountHolderName || 'Unknown partner' },
    ...(isUpi
      ? [{ label: 'UPI ID', value: d.upiId, copyable: true }]
      : [
          { label: 'Account holder', value: d.accountHolderName },
          { label: 'Account number', value: full ? d.accountNumber : maskAccount(d.accountNumber), copyable: true },
          { label: 'IFSC', value: d.ifscCode, copyable: true },
        ]),
  ]

  return (
    <div className="rounded-xl bg-beige/40 p-4">
      <div className="flex items-baseline justify-between border-b border-charcoal/10 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">Amount</span>
        <span className="font-display text-2xl font-bold text-charcoal">{inr(payout.amount)}</span>
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <dt className="text-warm-gray">{r.label}</dt>
            <dd className="flex items-center gap-1.5 font-medium text-charcoal">
              <span className={cn(r.copyable && 'font-mono text-xs')}>{r.value || '—'}</span>
              {r.copyable && r.value && (
                <button
                  onClick={() =>
                    copy(
                      r.label === 'Account number' ? d.accountNumber : (r.value as string),
                      r.label
                    )
                  }
                  className="text-warm-gray hover:text-tomato"
                  title={`Copy ${r.label}`}
                  aria-label={`Copy ${r.label}`}
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
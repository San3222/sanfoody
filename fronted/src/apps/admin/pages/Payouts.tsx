// src/apps/admin/pages/Payouts.tsx
import { useState } from 'react'
import {
    Wallet,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    Smartphone,
    TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import {
    useAdminPayouts,
    useApprovePayout,
    useCompletePayout,
    useRejectPayout,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const FILTER_TABS = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' },
] as const

export function AdminPayouts() {
    const [filter, setFilter] = useState<string>('all')
    const [page, setPage] = useState(1)
    const [completeModal, setCompleteModal] = useState<any>(null)
    const [rejectModal, setRejectModal] = useState<any>(null)
    const [transactionId, setTransactionId] = useState('')
    const [rejectReason, setRejectReason] = useState('')

    const { data, isLoading, refetch, isRefetching } = useAdminPayouts(
        filter,
        page,
        20
    )
    const approve = useApprovePayout()
    const complete = useCompletePayout()
    const reject = useRejectPayout()
    const { showToast } = useToast()

    const payouts = data?.payouts ?? []
    const stats = data?.stats ?? {}

    const handleApprove = (id: string) => {
        approve.mutate(id, {
            onSuccess: () => showToast('success', 'Payout approved for processing'),
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

    return (
        <div>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl font-bold text-charcoal">
                        Payout Approvals
                    </h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Review delivery partner withdrawal requests
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isRefetching}
                >
                    <RefreshCw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            {Object.keys(stats).length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <p className="text-xs text-warm-gray">Pending</p>
                        </div>
                        <p className="mt-2 font-display text-xl font-bold text-charcoal">
                            {stats.pending?.count || 0}
                        </p>
                        <p className="text-xs text-warm-gray">
                            ₹{(stats.pending?.amount || 0).toLocaleString('en-IN')}
                        </p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-600" />
                            <p className="text-xs text-warm-gray">Processing</p>
                        </div>
                        <p className="mt-2 font-display text-xl font-bold text-charcoal">
                            {stats.processing?.count || 0}
                        </p>
                        <p className="text-xs text-warm-gray">
                            ₹{(stats.processing?.amount || 0).toLocaleString('en-IN')}
                        </p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <p className="text-xs text-warm-gray">Completed</p>
                        </div>
                        <p className="mt-2 font-display text-xl font-bold text-charcoal">
                            {stats.completed?.count || 0}
                        </p>
                        <p className="text-xs text-warm-gray">
                            ₹{(stats.completed?.amount || 0).toLocaleString('en-IN')}
                        </p>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <p className="text-xs text-warm-gray">Failed</p>
                        </div>
                        <p className="mt-2 font-display text-xl font-bold text-charcoal">
                            {stats.failed?.count || 0}
                        </p>
                        <p className="text-xs text-warm-gray">
                            ₹{(stats.failed?.amount || 0).toLocaleString('en-IN')}
                        </p>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="mt-6 scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setFilter(tab.id)
                            setPage(1)
                        }}
                        className={cn(
                            'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            filter === tab.id
                                ? 'bg-tomato text-cream'
                                : 'bg-white text-charcoal/70 hover:bg-beige'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Payouts List */}
            <div className="mt-6 space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <Card key={i} className="p-5">
                            <div className="h-20 animate-pulse rounded-xl bg-charcoal/5" />
                        </Card>
                    ))
                ) : payouts.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Wallet className="mx-auto h-12 w-12 text-charcoal/20" />
                        <p className="mt-3 text-sm text-warm-gray">
                            No {filter === 'all' ? '' : filter} payouts
                        </p>
                    </Card>
                ) : (
                    payouts.map((payout) => (
                        <PayoutCard
                            key={payout._id}
                            payout={payout}
                            onApprove={() => handleApprove(payout._id)}
                            onComplete={() => setCompleteModal(payout)}
                            onReject={() => setRejectModal(payout)}
                            isLoading={approve.isPending || complete.isPending || reject.isPending}
                        />
                    ))
                )}
            </div>

            {/* Complete Modal */}
            <Modal
                isOpen={!!completeModal}
                onClose={() => {
                    setCompleteModal(null)
                    setTransactionId('')
                }}
                title="Mark Payout Completed"
            >
                <p className="text-sm text-warm-gray">
                    Mark ₹{completeModal?.amount} payout to{' '}
                    <strong>{completeModal?.partnerId?.name}</strong> as completed?
                </p>
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
                    <Button
                        variant="outline"
                        onClick={() => {
                            setCompleteModal(null)
                            setTransactionId('')
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleComplete}
                        disabled={complete.isPending}
                        className="flex-1"
                    >
                        {complete.isPending ? 'Completing...' : 'Mark Completed'}
                    </Button>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => {
                    setRejectModal(null)
                    setRejectReason('')
                }}
                title="Reject Payout"
            >
                <p className="text-sm text-warm-gray">
                    Reject ₹{rejectModal?.amount} payout? The amount will be refunded to the
                    partner's wallet.
                </p>
                <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Reason
                    </label>
                    <Input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g., Invalid UPI ID"
                    />
                </div>
                <div className="mt-5 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setRejectModal(null)
                            setRejectReason('')
                        }}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleReject}
                        disabled={reject.isPending}
                        className="flex-1"
                    >
                        {reject.isPending ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </div>
            </Modal>
        </div>
    )
}

// ============================================
// Payout Card
// ============================================

function PayoutCard({
    payout,
    onApprove,
    onComplete,
    onReject,
    isLoading,
}: {
    payout: any
    onApprove: () => void
    onComplete: () => void
    onReject: () => void
    isLoading: boolean
}) {
    const statusConfig: Record<string, { variant: any; label: string }> = {
        pending: { variant: 'warning', label: 'Pending' },
        processing: { variant: 'info', label: 'Processing' },
        completed: { variant: 'success', label: 'Completed' },
        failed: { variant: 'danger', label: 'Failed' },
        cancelled: { variant: 'neutral', label: 'Cancelled' },
    }

    const config = statusConfig[payout.status] || statusConfig.pending
    const partner = payout.partnerId || {}

    return (
        <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'grid h-12 w-12 shrink-0 place-items-center rounded-2xl',
                            payout.method === 'upi' ? 'bg-blue-100' : 'bg-purple-100'
                        )}
                    >
                        {payout.method === 'upi' ? (
                            <Smartphone className="h-6 w-6 text-blue-600" />
                        ) : (
                            <CreditCard className="h-6 w-6 text-purple-600" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-display text-lg font-bold text-charcoal">
                                ₹{payout.amount}
                            </p>
                            <Badge variant={config.variant}>{config.label}</Badge>
                        </div>

                        <p className="mt-1 text-sm font-medium text-charcoal">
                            {partner.name || 'Unknown'} · {payout.method.toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-xs text-warm-gray">
                            {partner.email} · {partner.phone || 'No phone'}
                        </p>

                        {/* Payout details */}
                        <div className="mt-2 rounded-lg bg-beige/50 px-3 py-2 text-xs text-charcoal">
                            {payout.method === 'upi' ? (
                                <p>
                                    <strong>UPI:</strong> {payout.payoutDetails?.upiId}
                                </p>
                            ) : (
                                <>
                                    <p>
                                        <strong>A/C:</strong> {payout.payoutDetails?.accountNumber} ·{' '}
                                        {payout.payoutDetails?.ifscCode}
                                    </p>
                                    <p>
                                        <strong>Holder:</strong> {payout.payoutDetails?.accountHolderName}
                                    </p>
                                </>
                            )}
                        </div>

                        <p className="mt-2 text-xs text-warm-gray">
                            Requested {new Date(payout.createdAt).toLocaleString('en-IN')}
                            {payout.completedAt &&
                                ` · Completed ${new Date(payout.completedAt).toLocaleString('en-IN')}`}
                        </p>

                        {payout.transactionId && (
                            <p className="mt-1 text-xs text-green-600">
                                Transaction: {payout.transactionId}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    {payout.status === 'pending' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onReject}
                                disabled={isLoading}
                            >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button size="sm" onClick={onApprove} disabled={isLoading}>
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Approve
                            </Button>
                        </>
                    )}

                    {payout.status === 'processing' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onReject}
                                disabled={isLoading}
                            >
                                <XCircle className="mr-1 h-3.5 w-3.5" />
                                Reject
                            </Button>
                            <Button
                                variant="success"
                                size="sm"
                                onClick={onComplete}
                                disabled={isLoading}
                            >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                Mark Completed
                            </Button>
                        </>
                    )}

                    {payout.status === 'completed' && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                        </span>
                    )}

                    {payout.status === 'failed' && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <XCircle className="h-3 w-3" />
                            {payout.failureReason || 'Failed'}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    )
}
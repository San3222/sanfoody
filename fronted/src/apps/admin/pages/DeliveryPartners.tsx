// src/apps/admin/pages/DeliveryPartners.tsx
import { useState } from 'react'
import {
    Search,
    RefreshCw,
    Bike,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronRight,
    TrendingUp,
    Activity,
    UserX,
    Loader2,
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { useNavigate } from 'react-router-dom'
import {
    useAdminDeliveryPartners,
    useVerifyDeliveryPartner,
    useRejectDeliveryPartner,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const STATUS_FILTERS = [
    { id: 'all', label: 'All Partners' },
    { id: 'pending', label: 'Pending Approvals' },
    { id: 'online', label: 'Online Now' },
    { id: 'inactive', label: 'Inactive (>48h)' },
]

export function AdminDeliveryPartners() {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [page, setPage] = useState(1)
    const navigate = useNavigate()
    const { showToast } = useToast()

    // Modal States
    const [verifyTarget, setVerifyTarget] = useState<any | null>(null)
    const [rejectTarget, setRejectTarget] = useState<any | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const { data, isLoading, refetch, isRefetching } = useAdminDeliveryPartners(search, filter, page, 20)
    const verify = useVerifyDeliveryPartner()
    const reject = useRejectDeliveryPartner()

    const partners = data?.partners ?? []
    const stats = data?.stats

    // Handlers
    const confirmVerify = () => {
        if (!verifyTarget) return
        verify.mutate(verifyTarget._id, {
            onSuccess: () => {
                showToast('success', `${verifyTarget.name} approved successfully!`)
                setVerifyTarget(null)
            },
            onError: (err: any) => showToast('error', err.message || 'Failed to approve'),
        })
    }

    const confirmReject = () => {
        if (!rejectTarget) return
        reject.mutate({ id: rejectTarget._id, reason: rejectReason || 'Documents invalid' }, {
            onSuccess: () => {
                showToast('success', `${rejectTarget.name} rejected.`)
                setRejectTarget(null)
                setRejectReason('')
            },
            onError: (err: any) => showToast('error', err.message || 'Failed to reject'),
        })
    }

    const timeAgo = (dateString: string) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours} hrs ago`
        return `${Math.floor(diffInHours / 24)} days ago`
    }

    return (
        <div className="pb-10 font-sans">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-charcoal">Delivery Partners</h1>
                    <p className="mt-1 text-xs text-warm-gray">Manage fleet, verify partners, and track live activity.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="flex items-center gap-1.5 rounded-lg border border-charcoal/10 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal shadow-sm transition-all hover:bg-charcoal/5 active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')} /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <Card className="p-4 border border-charcoal/5 shadow-sm rounded-xl">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">Total Fleet</p>
                        <p className="text-xl font-bold text-charcoal mt-1">{stats.total}</p>
                    </Card>
                    <Card className="p-4 border border-charcoal/5 shadow-sm rounded-xl">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Online Now</p>
                        <p className="text-xl font-bold text-emerald-700 mt-1">{stats.online}</p>
                    </Card>
                    <Card className="p-4 border border-charcoal/5 shadow-sm rounded-xl bg-amber-50/50">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending Approvals
                        </p>
                        <p className="text-xl font-bold text-amber-700 mt-1">{stats.pendingApproval}</p>
                    </Card>
                    <Card className="p-4 border border-charcoal/5 shadow-sm rounded-xl bg-red-50/50">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1">
                            <UserX className="h-3 w-3" /> Inactive (48h+)
                        </p>
                        <p className="text-xl font-bold text-red-700 mt-1">{stats.inactive}</p>
                    </Card>
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-charcoal/10 bg-white px-3 py-2 shadow-sm focus-within:border-tomato/50 focus-within:ring-1 focus-within:ring-tomato/20">
                    <Search className="h-4 w-4 text-warm-gray shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search by name, phone or vehicle number..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                    />
                </div>
                <div className="flex gap-1 rounded-xl bg-charcoal/5 p-1 shrink-0 overflow-x-auto scrollbar-none">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => { setFilter(f.id); setPage(1); }}
                            className={cn(
                                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                                filter === f.id ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal/50 hover:text-charcoal'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Partners List */}
            <div className="space-y-3">
                {isLoading ? (
                    [1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-charcoal/5" children={undefined} />)
                ) : partners.length === 0 ? (
                    <Card className="p-12 text-center border border-charcoal/10 rounded-xl">
                        <Bike className="mx-auto h-10 w-10 text-charcoal/20 mb-3" />
                        <p className="text-sm font-bold text-charcoal">No delivery partners found</p>
                        <p className="text-xs text-warm-gray mt-1">Try changing the filters.</p>
                    </Card>
                ) : (
                    partners.map((p: any) => {
                        const details = p.deliveryDetails || {}
                        const isPending = details?.verificationStatus === 'pending' || !details?.verificationStatus

                        const lastActiveDate = p.lastActive ? new Date(p.lastActive).getTime() : new Date(p.createdAt).getTime()
                        const hoursSinceActive = (new Date().getTime() - lastActiveDate) / (1000 * 60 * 60)
                        const isInactive = hoursSinceActive > 48 && p.status !== 'online'

                        return (
                            <div
                                key={p._id}
                                className={cn(
                                    "p-4 border shadow-sm rounded-xl transition-all hover:shadow-md cursor-pointer group",
                                    isPending ? "border-amber-200 bg-amber-50/20" : "border-charcoal/10 bg-white"
                                )}
                                onClick={() => navigate(`/admin/users/${p._id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                    {/* Left: Avatar & Info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-tomato/10 flex items-center justify-center text-tomato font-bold text-lg">
                                                {p.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className={cn(
                                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                                                p.status === 'online' ? "bg-emerald-500" : p.status === 'busy' ? "bg-amber-500" : "bg-charcoal/30"
                                            )} />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-charcoal text-sm truncate">{p.name || 'Unknown'}</h3>
                                                {details?.vehicleNumber && (
                                                    <span className="text-[10px] font-mono border border-charcoal/20 bg-white px-1.5 py-0.5 rounded text-charcoal/70">
                                                        {details.vehicleNumber}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-warm-gray mt-0.5 truncate">{p.email} · {p.phone || 'No phone'}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-charcoal/60">
                                                <span className="flex items-center gap-1">🚲 {details?.vehicleType || 'N/A'}</span>
                                                <span className="flex items-center gap-1">⭐ {p.rating?.toFixed(1) || '5.0'}</span>
                                                <span className="flex items-center gap-1">📦 {p.totalDeliveries || 0} deliveries</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status & Actions */}
                                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6 shrink-0 md:border-l md:border-charcoal/5 md:pl-5">

                                        <div className="hidden sm:block">
                                            <p className="text-[10px] uppercase font-bold text-warm-gray tracking-wider">Acceptance</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <TrendingUp className={cn("h-3.5 w-3.5", (p.acceptanceRate || 0) > 70 ? "text-emerald-500" : "text-red-500")} />
                                                <span className={cn("text-xs font-bold", (p.acceptanceRate || 0) > 70 ? "text-emerald-600" : "text-red-600")}>
                                                    {p.acceptanceRate || 0}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden sm:block">
                                            <p className="text-[10px] uppercase font-bold text-warm-gray tracking-wider">Last Active</p>
                                            <div className={cn("flex items-center gap-1.5 mt-0.5 text-xs font-bold", isInactive ? "text-red-500" : "text-charcoal")}>
                                                {isInactive ? <AlertTriangle className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5 text-emerald-500" />}
                                                {timeAgo(p.lastActive)}
                                            </div>
                                        </div>

                                        {/* Action Buttons (Modal Trigger) */}
                                        <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-charcoal/5">
                                            {isPending ? (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setRejectTarget(p); }}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" /> Reject
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setVerifyTarget(p); }}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between w-full md:w-auto gap-3">
                                                    <Badge variant={isInactive ? 'danger' : p.status === 'online' ? 'success' : 'neutral'} className="uppercase text-[9px]">
                                                        {isInactive ? 'Inactive' : p.status || 'Offline'}
                                                    </Badge>
                                                    <ChevronRight className="h-4 w-4 text-charcoal/20 group-hover:text-charcoal transition-colors" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ================= VERIFY MODAL ================= */}
            {verifyTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-charcoal">Approve Delivery Partner?</h3>
                            <p className="mt-2 text-sm text-warm-gray leading-relaxed">
                                Are you sure you want to approve <b className="text-charcoal">{verifyTarget.name}</b>?
                                They will be able to go online and accept orders.
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3 w-full">
                            <button
                                onClick={() => setVerifyTarget(null)}
                                disabled={verify.isPending}
                                className="flex-1 rounded-xl border border-charcoal/10 bg-white py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmVerify}
                                disabled={verify.isPending}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-70"
                            >
                                {verify.isPending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</>
                                ) : (
                                    'Yes, Approve'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= REJECT MODAL ================= */}
            {rejectTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-charcoal">Reject Delivery Partner?</h3>
                            <p className="mt-2 text-sm text-warm-gray leading-relaxed">
                                Rejecting <b className="text-charcoal">{rejectTarget.name}</b>. Please provide a reason.
                            </p>
                        </div>

                        <div className="mt-4">
                            <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Invalid DL, Blurry Aadhaar..."
                                className="w-full rounded-xl border border-charcoal/20 bg-white px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            />
                        </div>

                        <div className="mt-6 flex gap-3 w-full">
                            <button
                                onClick={() => { setRejectTarget(null); setRejectReason(''); }}
                                disabled={reject.isPending}
                                className="flex-1 rounded-xl border border-charcoal/10 bg-white py-2.5 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={reject.isPending}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-70"
                            >
                                {reject.isPending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Rejecting...</>
                                ) : (
                                    'Confirm Reject'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
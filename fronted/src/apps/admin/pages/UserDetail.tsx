// src/apps/admin/pages/UserDetail.tsx
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Building2,
  FileText,
  CreditCard,
  IdCard,
  Truck,
  Calendar,
  AlertTriangle,
  Ban,
  Trash2,
  Loader2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  MessageCircle,
  ShoppingBag,
  IndianRupee,
  Hash,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/shared/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { AdminButton } from '@/components/ui/AdminButton'
import {
  useAdminUser,
  useVerifyUser,
  useRejectUser,
  useToggleUserStatus,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Config
// ============================================

const roleBadgeVariants: Record<string, any> = {
  customer: 'info',
  restaurant: 'success',
  delivery: 'warning',
  admin: 'danger',
}

const statusColors: Record<string, any> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
}

const orderStatusVariants: Record<string, any> = {
  delivered: 'success',
  cancelled: 'danger',
  rejected: 'danger',
  pending: 'warning',
  placed: 'warning',
}

const REJECT_REASONS = [
  'Invalid FSSAI',
  'Blurry documents',
  'Details mismatch',
  'Incomplete profile',
]

type Tab = 'overview' | 'documents' | 'orders' | 'activity'

// ============================================
// Helpers
// ============================================

const fmtDate = (d: string, month: 'short' | 'long' = 'short') =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month, year: 'numeric' })

const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

const mask = (v: string) => (v.length <= 4 ? '••••' : '•'.repeat(v.length - 4) + v.slice(-4))

// ============================================
// Page
// ============================================

export function UserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data, isLoading } = useAdminUser(userId)
  const verifyMutation = useVerifyUser()
  const rejectMutation = useRejectUser()
  const toggleStatus = useToggleUserStatus()

  const [tab, setTab] = useState<Tab>('overview')
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [blockModal, setBlockModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const user = data?.user
  const recentOrders: any[] = data?.recentOrders ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-tomato" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="text-warm-gray">User not found</p>
        <Link to="/admin/users" className="mt-4 inline-block text-tomato hover:underline">
          Back to users
        </Link>
      </div>
    )
  }

  const isRestaurant = user.role === 'restaurant'
  const isDelivery = user.role === 'delivery'
  const isPartner = isRestaurant || isDelivery
  const isCustomer = user.role === 'customer'
  const details: any = isRestaurant ? user.restaurantDetails : user.deliveryDetails
  const verificationStatus: string = details?.verificationStatus || 'pending'

  const documentFields: {
    label: string
    value?: string
    icon: any
    sensitive?: boolean
    mono?: boolean
  }[] = isRestaurant
    ? [
        { label: 'Business Name', value: details?.businessName, icon: Building2 },
        { label: 'FSSAI Number', value: details?.fssaiNumber, icon: FileText, mono: true },
        { label: 'GST Number', value: details?.gstNumber, icon: FileText, mono: true },
        { label: 'PAN Number', value: details?.panNumber, icon: IdCard, mono: true, sensitive: true },
        { label: 'Address', value: details?.address, icon: MapPin },
        { label: 'Bank Account', value: details?.bankAccountNumber, icon: CreditCard, mono: true, sensitive: true },
        { label: 'IFSC Code', value: details?.bankIfscCode, icon: CreditCard, mono: true },
      ]
    : isDelivery
      ? [
          { label: 'Driving License', value: details?.licenseNumber, icon: IdCard, mono: true, sensitive: true },
          { label: 'Aadhaar Number', value: details?.aadhaarNumber, icon: IdCard, mono: true, sensitive: true },
          { label: 'PAN Number', value: details?.panNumber, icon: IdCard, mono: true, sensitive: true },
          { label: 'Vehicle Type', value: details?.vehicleType, icon: Truck },
          { label: 'Vehicle Number', value: details?.vehicleNumber, icon: Truck, mono: true },
          { label: 'Emergency Contact', value: details?.emergencyContact, icon: Phone },
          { label: 'Bank Account', value: details?.bankAccountNumber, icon: CreditCard, mono: true, sensitive: true },
          { label: 'IFSC Code', value: details?.bankIfscCode, icon: CreditCard, mono: true },
        ]
      : []

  const filled = documentFields.filter((f) => !!f.value).length
  const completeness = documentFields.length
    ? Math.round((filled / documentFields.length) * 100)
    : 0
  const totalSpend = recentOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)

  const timeline: { title: string; sub?: string; date?: string; tone: 'green' | 'red' | 'amber' | 'gray' }[] = [
    { title: 'Account created', date: user.createdAt, tone: 'gray' },
    ...(isPartner && details?.submittedAt
      ? [{ title: 'Verification submitted', sub: 'Documents received', date: details.submittedAt, tone: 'amber' as const }]
      : []),
    ...(details?.verifiedAt
      ? [{ title: 'Verified by admin', date: details.verifiedAt, tone: 'green' as const }]
      : []),
    ...(verificationStatus === 'rejected'
      ? [{ title: 'Verification rejected', sub: details?.rejectionReason, date: details?.rejectedAt, tone: 'red' as const }]
      : []),
    ...(!user.isActive
      ? [{ title: 'Account blocked', date: user.blockedAt, tone: 'red' as const }]
      : []),
  ]

  const tabs: { id: Tab; label: string; show: boolean; count?: number }[] = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'documents', label: 'Documents & Bank', show: isPartner },
    { id: 'orders', label: 'Orders', show: isCustomer, count: recentOrders.length },
    { id: 'activity', label: 'Activity', show: true },
  ]

  // ----- handlers -----
  const copy = async (text: string, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('success', `${label} copied`)
    } catch {
      showToast('error', 'Copy failed')
    }
  }

  const handleVerify = () => {
    verifyMutation.mutate(user._id, {
      onSuccess: () => showToast('success', 'User verified successfully'),
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleReject = () => {
    rejectMutation.mutate(
      { userId: user._id, reason: rejectReason },
      {
        onSuccess: () => {
          showToast('success', 'User rejected')
          setRejectModal(false)
          setRejectReason('')
        },
        onError: (err: any) => showToast('error', err.message || 'Failed'),
      }
    )
  }

  const handleBlockToggle = () => {
    toggleStatus.mutate(user._id, {
      onSuccess: (result: any) => {
        showToast('success', result.isActive ? 'User activated' : 'User blocked')
        setBlockModal(false)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  const handleDelete = () => {
    // TODO: wire to delete API when available
    showToast('info', 'Delete functionality coming soon')
    setDeleteModal(false)
    setDeleteConfirmText('')
  }

  const phoneDigits = (user.phone || '').replace(/\D/g, '')
  const waNumber = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-warm-gray">
        <button
          onClick={() => navigate('/admin/users')}
          className="mr-1 grid h-8 w-8 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal hover:bg-beige"
          aria-label="Back to users"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Link to="/admin/users" className="hover:text-tomato">
          Users
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-charcoal">{user.name}</span>
      </nav>

      {/* Header card (no overlaps) */}
      <div className="rounded-2xl border border-charcoal/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-tomato text-2xl font-bold text-cream">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-display text-2xl font-bold text-charcoal">
                  {user.name}
                </h1>
                <span className="capitalize">
                  <Badge variant={roleBadgeVariants[user.role]}>{user.role}</Badge>
                </span>
                <Badge variant={user.isActive ? 'success' : 'danger'}>
                  {user.isActive ? 'Active' : 'Blocked'}
                </Badge>
                {isPartner && (
                  <Badge variant={statusColors[verificationStatus]}>
                    <span className="inline-flex items-center gap-1">
                      {verificationStatus === 'pending' && <Clock className="h-3 w-3" />}
                      {verificationStatus === 'verified' && <CheckCircle2 className="h-3 w-3" />}
                      {verificationStatus === 'rejected' && <XCircle className="h-3 w-3" />}
                      {verificationStatus === 'pending'
                        ? 'Pending verification'
                        : verificationStatus === 'verified'
                          ? 'Verified'
                          : 'Rejected'}
                    </span>
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-warm-gray">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {user.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {fmtDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={() => (window.location.href = `mailto:${user.email}`)}
            >
              <Mail className="h-4 w-4" />
              Email
            </AdminButton>
            {user.phone && (
              <>
                <AdminButton
                  variant="secondary"
                  onClick={() => (window.location.href = `tel:${user.phone}`)}
                >
                  <Phone className="h-4 w-4" />
                  Call
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => window.open(`https://wa.me/${waNumber}`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </AdminButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isCustomer ? (
          <>
            <MiniStat icon={ShoppingBag} label="Recent orders" value={String(recentOrders.length)} />
            <MiniStat icon={IndianRupee} label="Recent spend" value={`₹${totalSpend.toLocaleString('en-IN')}`} />
            <MiniStat
              icon={Clock}
              label="Last order"
              value={recentOrders[0]?.createdAt ? fmtDate(recentOrders[0].createdAt) : '—'}
            />
            <MiniStat icon={Calendar} label="Member since" value={fmtDate(user.createdAt)} />
          </>
        ) : (
          <>
            <MiniStat icon={ShieldCheck} label="Verification" value={isPartner ? verificationStatus : 'N/A'} capitalize />
            <MiniStat icon={FileText} label="Profile complete" value={isPartner ? `${completeness}%` : '—'} />
            <MiniStat icon={CheckCircle2} label="Verified on" value={details?.verifiedAt ? fmtDate(details.verifiedAt) : '—'} />
            <MiniStat icon={Calendar} label="Member since" value={fmtDate(user.createdAt)} />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2">
          {/* Underline tabs */}
          <div className="scrollbar-none flex gap-6 overflow-x-auto border-b border-charcoal/10">
            {tabs
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    '-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors',
                    tab === t.id
                      ? 'border-tomato text-tomato'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal'
                  )}
                >
                  {t.label}
                  {typeof t.count === 'number' && t.count > 0 && (
                    <span className="rounded-full bg-tomato/10 px-1.5 text-[11px] text-tomato">
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
          </div>

          <div className="mt-5 space-y-5">
            {tab === 'overview' && (
              <>
                <Panel title="Personal information" icon={User}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field icon={User} label="Full name" value={user.name} />
                    <Field
                      icon={Mail}
                      label="Email"
                      value={user.email}
                      onCopy={() => copy(user.email, 'Email')}
                    />
                    {user.phone && (
                      <Field
                        icon={Phone}
                        label="Phone"
                        value={user.phone}
                        onCopy={() => user.phone && copy(user.phone, 'Phone')}
                      />
                    )}
                    <Field icon={Calendar} label="Joined" value={fmtDate(user.createdAt, 'long')} />
                    <Field
                      icon={Hash}
                      label="User ID"
                      value={user._id}
                      mono
                      onCopy={() => copy(user._id, 'User ID')}
                    />
                  </div>
                </Panel>

                {isPartner && (
                  <Panel
                    title={isRestaurant ? 'Business summary' : 'Partner summary'}
                    icon={isRestaurant ? Building2 : Truck}
                    action={
                      <button
                        onClick={() => setTab('documents')}
                        className="text-sm font-semibold text-tomato hover:underline"
                      >
                        All documents
                      </button>
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {isRestaurant ? (
                        <>
                          <Field icon={Building2} label="Business name" value={details?.businessName || '—'} />
                          <Field icon={MapPin} label="Address" value={details?.address || '—'} />
                        </>
                      ) : (
                        <>
                          <Field icon={Truck} label="Vehicle type" value={details?.vehicleType || '—'} />
                          <Field icon={Truck} label="Vehicle number" value={details?.vehicleNumber || '—'} mono />
                        </>
                      )}
                    </div>
                  </Panel>
                )}

                {isCustomer && (
                  <Panel
                    title="Latest orders"
                    icon={ShoppingBag}
                    action={
                      recentOrders.length > 3 && (
                        <button
                          onClick={() => setTab('orders')}
                          className="text-sm font-semibold text-tomato hover:underline"
                        >
                          See all
                        </button>
                      )
                    }
                  >
                    {recentOrders.length === 0 ? (
                      <EmptyState icon={ShoppingBag} text="No orders yet" />
                    ) : (
                      <OrdersList orders={recentOrders.slice(0, 3)} copy={copy} />
                    )}
                  </Panel>
                )}
              </>
            )}

            {tab === 'documents' && isPartner && (
              <Panel
                title={isRestaurant ? 'Business, tax & bank details' : 'KYC, vehicle & bank details'}
                icon={FileText}
                action={
                  <div className="flex items-center gap-2 text-xs text-warm-gray">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-charcoal/10">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          completeness === 100 ? 'bg-green-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                    {filled}/{documentFields.length}
                  </div>
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {documentFields.map((f) => (
                    <SensitiveField
                      key={f.label}
                      icon={f.icon}
                      label={f.label}
                      value={f.value}
                      mono={f.mono}
                      sensitive={f.sensitive}
                      onCopy={() => f.value && copy(f.value, f.label)}
                    />
                  ))}
                </div>
              </Panel>
            )}

            {tab === 'orders' && isCustomer && (
              <Panel title="Order history" icon={ShoppingBag}>
                {recentOrders.length === 0 ? (
                  <EmptyState icon={ShoppingBag} text="No orders yet" />
                ) : (
                  <OrdersList orders={recentOrders} copy={copy} />
                )}
              </Panel>
            )}

            {tab === 'activity' && (
              <Panel title="Activity timeline" icon={Clock}>
                <ol className="space-y-0">
                  {timeline.map((t, i) => (
                    <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < timeline.length - 1 && (
                        <span className="absolute left-[7px] top-4 h-full w-px bg-charcoal/10" />
                      )}
                      <span
                        className={cn(
                          'relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-white ring-1',
                          t.tone === 'green' && 'bg-green-500 ring-green-200',
                          t.tone === 'red' && 'bg-red-500 ring-red-200',
                          t.tone === 'amber' && 'bg-amber-500 ring-amber-200',
                          t.tone === 'gray' && 'bg-charcoal/40 ring-charcoal/10'
                        )}
                      />
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{t.title}</p>
                        {t.sub && <p className="text-xs text-warm-gray">{t.sub}</p>}
                        {t.date && (
                          <p className="mt-0.5 text-xs text-warm-gray">{fmtDateTime(t.date)}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <aside className="space-y-5">
          {isPartner && (
            <Panel title="Verification" icon={ShieldCheck}>
              <ul className="space-y-2">
                {documentFields.slice(0, 5).map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.value ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <span className={f.value ? 'text-charcoal' : 'text-red-600'}>{f.label}</span>
                  </li>
                ))}
              </ul>

              {verificationStatus === 'pending' && (
                <div className="mt-5 space-y-2.5 border-t border-charcoal/10 pt-5">
                  <p className="text-xs text-warm-gray">
                    Review the documents carefully before approving.
                  </p>
                  <AdminButton
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {verifyMutation.isPending ? 'Approving...' : 'Approve'}
                  </AdminButton>
                  <AdminButton
                    variant="soft-danger"
                    size="md"
                    className="w-full"
                    onClick={() => setRejectModal(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </AdminButton>
                </div>
              )}

              {verificationStatus === 'verified' && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-green-50 p-3.5">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Verified</p>
                    {details?.verifiedAt && (
                      <p className="text-xs text-green-700">on {fmtDate(details.verifiedAt)}</p>
                    )}
                  </div>
                </div>
              )}

              {verificationStatus === 'rejected' && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3.5">
                    <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Rejected</p>
                      {details?.rejectionReason && (
                        <p className="text-xs text-red-700">{details.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <AdminButton
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {verifyMutation.isPending ? 'Approving...' : 'Approve instead'}
                  </AdminButton>
                </div>
              )}
            </Panel>
          )}

          <Panel title="Account status" icon={Ban}>
            <div
              className={cn(
                'rounded-xl p-3.5',
                user.isActive ? 'bg-green-50' : 'bg-red-50'
              )}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    user.isActive ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
                {user.isActive ? 'Active account' : 'Blocked account'}
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                {user.isActive
                  ? 'User can access the platform and perform actions.'
                  : 'User is blocked from logging in.'}
              </p>
            </div>

            {user.role !== 'admin' && (
              <AdminButton
                variant={user.isActive ? 'soft-danger' : 'success'}
                size="md"
                className="mt-3 w-full"
                onClick={() => setBlockModal(true)}
                disabled={toggleStatus.isPending}
              >
                {user.isActive ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Block user
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Activate user
                  </>
                )}
              </AdminButton>
            )}
          </Panel>

          {user.role !== 'admin' && (
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger zone
              </h2>
              <p className="mt-2 text-xs text-red-700/80">
                Permanently delete this user and all related data. This cannot be undone.
              </p>
              <AdminButton
                variant="secondary"
                size="md"
                className="mt-4 w-full !border-red-200 !text-red-600 hover:!bg-red-50"
                onClick={() => setDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete permanently
              </AdminButton>
            </div>
          )}
        </aside>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          setRejectModal(false)
          setRejectReason('')
        }}
        title="Reject verification"
      >
        <p className="text-sm text-warm-gray">
          Rejecting <strong className="text-charcoal">{user.name}</strong>. They will be notified
          via email.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-charcoal">
            Reason (optional)
          </label>
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
            placeholder="e.g., Invalid FSSAI, blurry documents"
          />
        </div>
        <div className="mt-6 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => {
              setRejectModal(false)
              setRejectReason('')
            }}
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            size="md"
            className="flex-1"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm reject'}
          </AdminButton>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal
        isOpen={blockModal}
        onClose={() => setBlockModal(false)}
        title={user.isActive ? 'Block user' : 'Activate user'}
      >
        <p className="text-sm text-warm-gray">
          Are you sure you want to {user.isActive ? 'block' : 'activate'}{' '}
          <strong className="text-charcoal">{user.name}</strong>?
          {user.isActive && ' They will not be able to log in.'}
        </p>
        <div className="mt-6 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => setBlockModal(false)}
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant={user.isActive ? 'danger' : 'success'}
            size="md"
            className="flex-1"
            onClick={handleBlockToggle}
            disabled={toggleStatus.isPending}
          >
            {toggleStatus.isPending ? 'Processing...' : user.isActive ? 'Block user' : 'Activate user'}
          </AdminButton>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false)
          setDeleteConfirmText('')
        }}
        title="Delete user permanently"
      >
        <p className="text-sm text-warm-gray">
          This will permanently delete <strong className="text-charcoal">{user.name}</strong> and
          all related data. Type the user's name to confirm.
        </p>
        <div className="mt-4">
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={user.name}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <AdminButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => {
              setDeleteModal(false)
              setDeleteConfirmText('')
            }}
          >
            Cancel
          </AdminButton>
          <AdminButton
            variant="danger"
            size="md"
            className="flex-1"
            onClick={handleDelete}
            disabled={deleteConfirmText.trim() !== user.name}
          >
            Delete
          </AdminButton>
        </div>
      </Modal>
    </div>
  )
}

// ============================================
// Small components
// ============================================

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string
  icon: React.ElementType
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-charcoal">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-tomato/10 text-tomato">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-charcoal/10 bg-white p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tomato/10 text-tomato">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className={cn('truncate font-display text-base font-bold text-charcoal', capitalize && 'capitalize')}>
          {value}
        </p>
        <p className="text-xs text-warm-gray">{label}</p>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="py-8 text-center">
      <Icon className="mx-auto h-9 w-9 text-charcoal/20" />
      <p className="mt-2 text-sm text-warm-gray">{text}</p>
    </div>
  )
}

function OrdersList({
  orders,
  copy,
}: {
  orders: any[]
  copy: (t: string, label?: string) => void
}) {
  return (
    <div className="divide-y divide-charcoal/5">
      {orders.map((order) => (
        <div key={order._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <button
              onClick={() => copy(order.orderId, 'Order ID')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-charcoal hover:text-tomato"
              title="Copy order ID"
            >
              {order.orderId}
              <Copy className="h-3 w-3" />
            </button>
            {order.createdAt && (
              <p className="mt-0.5 text-xs text-warm-gray">{fmtDateTime(order.createdAt)}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-charcoal">₹{order.total}</span>
            <Badge variant={orderStatusVariants[String(order.status).toLowerCase()] || 'neutral'}>
              {order.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Compact label/value tile with optional copy button. */
function Field({
  icon: Icon,
  label,
  value,
  mono = false,
  onCopy,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
  onCopy?: () => void
}) {
  return (
    <div className="group flex items-start gap-3 rounded-xl bg-beige/40 p-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-warm-gray" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">{label}</p>
        <p className={cn('mt-0.5 break-words text-sm font-medium text-charcoal', mono && 'font-mono text-[13px]')}>
          {value}
        </p>
      </div>
      {onCopy && (
        <AdminButton
          size="icon"
          variant="ghost"
          title={`Copy ${label}`}
          aria-label={`Copy ${label}`}
          onClick={onCopy}
          className="-mr-1 -mt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Copy className="h-4 w-4" />
        </AdminButton>
      )}
    </div>
  )
}

/** Documents/bank tile: masks sensitive values until revealed. */
function SensitiveField({
  icon: Icon,
  label,
  value,
  mono,
  sensitive,
  onCopy,
}: {
  icon: React.ElementType
  label: string
  value?: string
  mono?: boolean
  sensitive?: boolean
  onCopy: () => void
}) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl p-3.5',
        value ? 'bg-beige/40' : 'border border-dashed border-red-200 bg-red-50/40'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-warm-gray" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">{label}</p>
        {value ? (
          <p className={cn('mt-0.5 break-words text-sm font-medium text-charcoal', mono && 'font-mono text-[13px]')}>
            {sensitive && !revealed ? mask(value) : value}
          </p>
        ) : (
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-red-500">
            <XCircle className="h-3.5 w-3.5" /> Not provided
          </p>
        )}
      </div>
      {value && (
        <div className="-mr-1 -mt-1 flex shrink-0 items-center">
          {sensitive && (
            <AdminButton
              size="icon"
              variant="ghost"
              title={revealed ? 'Hide' : 'Reveal'}
              aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
              onClick={() => setRevealed((r) => !r)}
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </AdminButton>
          )}
          <AdminButton
            size="icon"
            variant="ghost"
            title={`Copy ${label}`}
            aria-label={`Copy ${label}`}
            onClick={onCopy}
          >
            <Copy className="h-4 w-4" />
          </AdminButton>
        </div>
      )}
    </div>
  )
}
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
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import {
  useAdminUser,
  useVerifyUser,
  useRejectUser,
  useToggleUserStatus,
} from '@/api/adminHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

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

export function UserDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data, isLoading } = useAdminUser(userId)
  const verifyMutation = useVerifyUser()
  const rejectMutation = useRejectUser()
  const toggleStatus = useToggleUserStatus()

  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [blockModal, setBlockModal] = useState(false)

  const user = data?.user
  const recentOrders = data?.recentOrders ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-tomato" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-warm-gray">User not found</p>
        <Link to="/admin/users" className="mt-4 inline-block text-tomato hover:underline">
          Back to users
        </Link>
      </div>
    )
  }

  const isRestaurant = user.role === 'restaurant'
  const isDelivery = user.role === 'delivery'
  const details = isRestaurant ? user.restaurantDetails : user.deliveryDetails
  const verificationStatus = details?.verificationStatus || 'pending'
  const isVerified = verificationStatus === 'verified'

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
        showToast(
          'success',
          result.isActive ? 'User activated' : 'User blocked'
        )
        setBlockModal(false)
      },
      onError: (err: any) => showToast('error', err.message || 'Failed'),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-charcoal/10 text-charcoal hover:bg-beige"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-charcoal">
              {user.name}
            </h1>
            <p className="text-sm text-warm-gray">User details & verification</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={roleBadgeVariants[user.role]}>{user.role}</Badge>
          <Badge variant={user.isActive ? 'success' : 'danger'}>
            {user.isActive ? 'Active' : 'Blocked'}
          </Badge>
          {(isRestaurant || isDelivery) && (
            <Badge variant={statusColors[verificationStatus]}>
              {verificationStatus === 'pending' && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending Verification
                </span>
              )}
              {verificationStatus === 'verified' && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}
              {verificationStatus === 'rejected' && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Rejected
                </span>
              )}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Info */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <User className="h-5 w-5 text-tomato" />
              Personal Information
            </h2>
            <div className="mt-4 space-y-3">
              <InfoRow icon={User} label="Name" value={user.name} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              {user.phone && <InfoRow icon={Phone} label="Phone" value={user.phone} />}
              <InfoRow
                icon={Calendar}
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </div>
          </Card>

          {/* Business Details (Restaurant) */}
          {isRestaurant && user.restaurantDetails && (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <Building2 className="h-5 w-5 text-tomato" />
                Business Details
              </h2>
              <div className="mt-4 space-y-3">
                <InfoRow
                  icon={Building2}
                  label="Business Name"
                  value={user.restaurantDetails.businessName || '—'}
                />
                <InfoRow
                  icon={FileText}
                  label="FSSAI Number"
                  value={user.restaurantDetails.fssaiNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={FileText}
                  label="GST Number"
                  value={user.restaurantDetails.gstNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={IdCard}
                  label="PAN Number"
                  value={user.restaurantDetails.panNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={user.restaurantDetails.address || '—'}
                />
              </div>
            </Card>
          )}

          {/* Vehicle Details (Delivery) */}
          {isDelivery && user.deliveryDetails && (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <Truck className="h-5 w-5 text-tomato" />
                Delivery Partner Details
              </h2>
              <div className="mt-4 space-y-3">
                <InfoRow
                  icon={IdCard}
                  label="Driving License"
                  value={user.deliveryDetails.licenseNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={IdCard}
                  label="Aadhaar Number"
                  value={user.deliveryDetails.aadhaarNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={IdCard}
                  label="PAN Number"
                  value={user.deliveryDetails.panNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={Truck}
                  label="Vehicle Type"
                  value={user.deliveryDetails.vehicleType || '—'}
                />
                <InfoRow
                  icon={Truck}
                  label="Vehicle Number"
                  value={user.deliveryDetails.vehicleNumber || '—'}
                  mono
                />
                <InfoRow
                  icon={Phone}
                  label="Emergency Contact"
                  value={user.deliveryDetails.emergencyContact || '—'}
                />
              </div>
            </Card>
          )}

          {/* Bank Details */}
          {((isRestaurant && user.restaurantDetails) ||
            (isDelivery && user.deliveryDetails)) && (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <CreditCard className="h-5 w-5 text-tomato" />
                Bank Details
              </h2>
              <div className="mt-4 space-y-3">
                <InfoRow
                  icon={CreditCard}
                  label="Account Number"
                  value={
                    (isRestaurant
                      ? user.restaurantDetails?.bankAccountNumber
                      : user.deliveryDetails?.bankAccountNumber) || '—'
                  }
                  mono
                />
                <InfoRow
                  icon={CreditCard}
                  label="IFSC Code"
                  value={
                    (isRestaurant
                      ? user.restaurantDetails?.bankIfscCode
                      : user.deliveryDetails?.bankIfscCode) || '—'
                  }
                  mono
                />
              </div>
            </Card>
          )}

          {/* Recent Orders (Customer) */}
          {user.role === 'customer' && recentOrders.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display text-lg font-bold text-charcoal">
                Recent Orders
              </h2>
              <div className="mt-4 space-y-2">
                {recentOrders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between border-b border-charcoal/5 py-2 last:border-0"
                  >
                    <span className="font-mono text-xs text-charcoal">
                      {order.orderId}
                    </span>
                    <span className="text-sm font-semibold">₹{order.total}</span>
                    <Badge variant="neutral">{order.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column: Actions */}
        <div className="space-y-6">
          {/* Verification Actions (Restaurant/Delivery only) */}
          {(isRestaurant || isDelivery) && (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
                <ShieldCheck className="h-5 w-5 text-tomato" />
                Verification
              </h2>

              {verificationStatus === 'pending' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-warm-gray">
                    Review the documents carefully before approving.
                  </p>
                  <Button
                    onClick={handleVerify}
                    disabled={verifyMutation.isPending}
                    className="w-full"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {verifyMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setRejectModal(true)}
                    className="w-full"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}

              {verificationStatus === 'verified' && (
                <div className="mt-4">
                  <div className="rounded-xl bg-green-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
                    <p className="mt-2 text-sm font-semibold text-green-900">
                      Verified
                    </p>
                    <p className="mt-1 text-xs text-green-700">
                      {details?.verifiedAt
                        ? `on ${new Date(details.verifiedAt).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              {verificationStatus === 'rejected' && (
                <div className="mt-4">
                  <div className="rounded-xl bg-red-50 p-4 text-center">
                    <XCircle className="mx-auto h-8 w-8 text-red-600" />
                    <p className="mt-2 text-sm font-semibold text-red-900">
                      Rejected
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Account Status */}
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
              <Ban className="h-5 w-5 text-tomato" />
              Account Status
            </h2>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-beige/50 p-4">
                <p className="text-sm font-semibold text-charcoal">
                  {user.isActive ? 'Active Account' : 'Blocked Account'}
                </p>
                <p className="mt-1 text-xs text-warm-gray">
                  {user.isActive
                    ? 'User can access the platform and perform actions.'
                    : 'User is blocked from logging in.'}
                </p>
              </div>

              {user.role !== 'admin' && (
                <Button
                  variant={user.isActive ? 'danger' : 'success'}
                  onClick={() => setBlockModal(true)}
                  disabled={toggleStatus.isPending}
                  className="w-full"
                >
                  {user.isActive ? (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Block User
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Activate User
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Danger Zone */}
          {user.role !== 'admin' && (
            <Card className="border-red-100 bg-red-50/30 p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h2>
              <p className="mt-2 text-xs text-red-700">
                Permanently delete this user and all related data.
              </p>
              <Button
                variant="danger"
                className="mt-4 w-full"
                onClick={() => {
                  if (confirm(`Delete ${user.name} permanently?`)) {
                    showToast('info', 'Delete functionality coming soon')
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => {
          setRejectModal(false)
          setRejectReason('')
        }}
        title="Reject Verification"
      >
        <p className="text-sm text-warm-gray">
          Rejecting <strong>{user.name}</strong>. They will be notified via email.
        </p>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-semibold text-charcoal">
            Reason (optional)
          </label>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g., Invalid FSSAI, blurry documents"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setRejectModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={rejectMutation.isPending}
            className="flex-1"
          >
            {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
        </div>
      </Modal>

      {/* Block Modal */}
      <Modal
        isOpen={blockModal}
        onClose={() => setBlockModal(false)}
        title={user.isActive ? 'Block User' : 'Activate User'}
      >
        <p className="text-sm text-warm-gray">
          Are you sure you want to {user.isActive ? 'block' : 'activate'}{' '}
          <strong>{user.name}</strong>?
          {user.isActive && ' They will not be able to log in.'}
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            variant="outline"
            onClick={() => setBlockModal(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant={user.isActive ? 'danger' : 'success'}
            onClick={handleBlockToggle}
            disabled={toggleStatus.isPending}
            className="flex-1"
          >
            {toggleStatus.isPending
              ? 'Processing...'
              : user.isActive
                ? 'Block'
                : 'Activate'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ============================================
// Info Row
// ============================================

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 border-b border-charcoal/5 pb-3 last:border-0 last:pb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-warm-gray" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
          {label}
        </p>
        <p
          className={cn(
            'mt-0.5 break-words text-sm text-charcoal',
            mono && 'font-mono'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
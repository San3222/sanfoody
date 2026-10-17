// src/apps/delivery/pages/Settings.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bike,
  Car,
  CreditCard,
  Smartphone,
  ShieldCheck,
  LifeBuoy,
  Bell,
  Volume2,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  AlertTriangle,
  FileText,
  Edit3,
  Plus,
  Star,
  Phone,
  Mail,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { useDeliveryStats, useUpdateProfile, useUpdateVehicle } from '@/api/deliveryHooks' // <-- Naye Hooks Import Kiye
import { usePayoutMethod } from '@/api/payoutHooks'
import { PayoutMethodModal } from '@/apps/delivery/components/PayoutMethodModal'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const SUPPORT_EMAIL = 'support@sanfoody.com'
const EMERGENCY_NUMBER = '112'
const APP_VERSION = '1.0.0'

// ---------- Local preferences ----------
function usePref(key: string, initial: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : raw === '1'
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, value ? '1' : '0')
    } catch {}
  }, [key, value])
  return [value, setValue] as const
}

export function DeliverySettings() {
  const { showToast } = useToast()
  const { data: stats, isLoading, refetch } = useDeliveryStats()
  const { data: method } = usePayoutMethod()

  // API Mutations
  const updateProfileMutation = useUpdateProfile()
  const updateVehicleMutation = useUpdateVehicle()

  const [payoutOpen, setPayoutOpen] = useState(false)
  const [notifications, setNotifications] = usePref('sf:delivery:notifications', true)
  const [sound, setSound] = usePref('sf:delivery:sound', true)
  const [darkMode, setDarkMode] = usePref('sf:delivery:dark', false)

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const partner: any = stats?.partner
  const name = partner?.name ?? 'Partner'
  const partnerId = partner?.partnerId ?? (partner?._id ? `SF-${String(partner._id).slice(-6).toUpperCase()}` : null)
  const vehicleType = partner?.vehicleType
    ? partner.vehicleType.charAt(0).toUpperCase() + partner.vehicleType.slice(1)
    : null
  const VehicleIcon = partner?.vehicleType === 'bike' || partner?.vehicleType === 'scooter' ? Bike : Car
  const hasPayout = !!method && !!method.type

  const handleLogout = () => {
    if (!confirm('Log out of SanFoody?')) return
    showToast('success', 'Logged out successfully')
  }

  const handleSOS = (e: React.MouseEvent) => {
    if (!confirm(`Call emergency services (${EMERGENCY_NUMBER}) now?`)) e.preventDefault()
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      {/* ================= Header ================= */}
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Settings</h1>
        <p className="mt-1 text-sm text-warm-gray">Your account, vehicle and app preferences</p>
      </div>

      {/* ================= Profile ================= */}
      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-tomato font-display text-2xl font-bold text-cream">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold text-charcoal">
                {isLoading ? '—' : name}
              </h2>
              <p className="text-sm text-warm-gray">
                Delivery partner{partnerId && <> · ID {partnerId}</>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-semibold text-charcoal">
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  {partner?.rating?.toFixed(1) ?? '5.0'}
                </span>
                <span className="inline-flex items-center rounded-full bg-charcoal/5 px-2.5 py-1 text-xs font-semibold text-charcoal/70">
                  {partner?.totalDeliveries ?? 0} deliveries
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 text-sm font-semibold text-charcoal shadow-sm transition hover:bg-beige/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
          >
            <Edit3 className="h-4 w-4" />
            Edit profile
          </button>
        </div>

        {(partner?.phone || partner?.email) && (
          <div className="mt-5 grid gap-2 border-t border-charcoal/10 pt-4 text-sm sm:grid-cols-2">
            {partner?.phone && (
              <p className="flex items-center gap-2 text-charcoal">
                <Phone className="h-4 w-4 text-warm-gray" />
                {partner.phone}
              </p>
            )}
            {partner?.email && (
              <p className="flex items-center gap-2 truncate text-charcoal">
                <Mail className="h-4 w-4 shrink-0 text-warm-gray" />
                <span className="truncate">{partner.email}</span>
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ================= Vehicle ================= */}
      <Section title="Vehicle" icon={VehicleIcon} iconClass="text-tomato">
        <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-beige">
                <VehicleIcon className="h-5 w-5 text-tomato" />
              </div>
              <div>
                <p className="font-semibold text-charcoal">{vehicleType ?? 'No vehicle added'}</p>
                {partner?.vehicleModel && <p className="text-xs text-warm-gray">{partner.vehicleModel}</p>}
              </div>
            </div>
            {partner?.vehicleNumber && (
              <span className="rounded-lg border-2 border-charcoal/70 bg-white px-3 py-1.5 font-mono text-sm font-bold tracking-widest text-charcoal">
                {partner.vehicleNumber}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-tomato/30 bg-tomato/5 text-sm font-semibold text-tomato transition hover:bg-tomato/10 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50"
          >
            Request vehicle update
          </button>
        </div>
      </Section>

      {/* ================= Payout ================= */}
      <Section title="Payout method" icon={CreditCard} iconClass="text-blue-600">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          {hasPayout ? (
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-2xl',
                  method?.type === 'upi' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                )}
              >
                {method?.type === 'upi' ? <Smartphone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-charcoal">{method?.type === 'upi' ? 'UPI' : 'Bank account'}</p>
                <p className="text-xs text-warm-gray">
                  {method?.type === 'upi' ? method.upiId : 'Withdrawals go to your bank'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-charcoal">No payout method</p>
              <p className="text-xs text-warm-gray">Add UPI or a bank account to withdraw your earnings.</p>
            </div>
          )}
          <button
            onClick={() => setPayoutOpen(true)}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold shadow-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50',
              hasPayout
                ? 'border border-charcoal/15 bg-white text-charcoal hover:bg-beige/60'
                : 'bg-tomato text-cream hover:opacity-90'
            )}
          >
            {hasPayout ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {hasPayout ? 'Change' : 'Add method'}
          </button>
        </div>
      </Section>

      {/* ================= Preferences ================= */}
      <Section title="Preferences" icon={Bell} iconClass="text-charcoal/70">
        <div className="divide-y divide-charcoal/5">
          <ToggleRow
            icon={Bell}
            title="Push notifications"
            sub="New orders and delivery updates"
            checked={notifications}
            onChange={setNotifications}
          />
          <ToggleRow
            icon={Volume2}
            title="Order alert sound"
            sub="Play a sound when a new order arrives"
            checked={sound}
            onChange={setSound}
          />
          <ToggleRow
            icon={Moon}
            title="Dark mode"
            sub="Easier on the eyes at night"
            checked={darkMode}
            onChange={setDarkMode}
          />
          <RowButton
            icon={Globe}
            title="Language"
            sub="English (India)"
            onClick={() => showToast('info', 'More languages coming soon')}
          />
        </div>
      </Section>

      {/* ================= Support & safety ================= */}
      <Section title="Support & safety" icon={ShieldCheck} iconClass="text-green-600">
        <div className="divide-y divide-charcoal/5">
          <RowLink to="/contact" icon={LifeBuoy} iconClass="text-blue-600" title="Contact support" sub="We usually reply within 24 hours" />
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            onClick={handleSOS}
            className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-300"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-100 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">Emergency SOS</p>
                <p className="text-xs text-warm-gray">Call {EMERGENCY_NUMBER} for police, ambulance or fire</p>
              </div>
            </div>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-600">24/7</span>
          </a>
          <RowLink to="/terms" icon={FileText} iconClass="text-charcoal/60" title="Terms & privacy policy" />
        </div>
      </Section>

      {/* ================= Logout ================= */}
      <button
        onClick={handleLogout}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
      <p className="mt-4 text-center text-xs text-warm-gray">SanFoody Delivery · v{APP_VERSION}</p>

      {/* ================= MODALS ================= */}
      <PayoutMethodModal isOpen={payoutOpen} onClose={() => setPayoutOpen(false)} />
      
      <EditProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        initialData={{ name: partner?.name, phone: partner?.phone, email: partner?.email }}
        mutation={updateProfileMutation}
        onSuccess={() => { setIsProfileModalOpen(false); refetch(); }} 
      />

      <VehicleUpdateModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)} 
        initialData={{ vehicleNumber: partner?.vehicleNumber, vehicleModel: partner?.vehicleModel, vehicleType: partner?.vehicleType }}
        mutation={updateVehicleMutation}
        onSuccess={() => { setIsVehicleModalOpen(false); refetch(); }} 
      />
    </div>
  )
}

// ============================================
// MODALS (With API Integration)
// ============================================

function EditProfileModal({ isOpen, onClose, initialData, mutation, onSuccess }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' })
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) setFormData({ name: initialData.name || '', phone: initialData.phone || '', email: initialData.email || '' })
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData, {
      onSuccess: () => {
        showToast('success', 'Profile updated successfully')
        onSuccess()
      },
      onError: (err: any) => {
        showToast('error', err?.message || 'Failed to update profile')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-charcoal">Edit Profile</h3>
          <button onClick={onClose} disabled={mutation.isPending} className="rounded-full p-1 text-warm-gray hover:bg-charcoal/5 disabled:opacity-50"><X className="h-4 w-4"/></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-charcoal">Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato" placeholder="Suresh Kumar" />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal">Phone Number</label>
            <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal">Email Address</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato" placeholder="delivery@demo.com" />
          </div>
          <button type="submit" disabled={mutation.isPending} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-tomato py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-70">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

function VehicleUpdateModal({ isOpen, onClose, initialData, mutation, onSuccess }: any) {
  const [formData, setFormData] = useState({ vehicleNumber: '', vehicleModel: '', vehicleType: 'bike' })
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen) setFormData({ vehicleNumber: initialData.vehicleNumber || '', vehicleModel: initialData.vehicleModel || '', vehicleType: initialData.vehicleType || 'bike' })
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData, {
      onSuccess: () => {
        showToast('success', 'Vehicle update request sent')
        onSuccess()
      },
      onError: (err: any) => {
        showToast('error', err?.message || 'Failed to update vehicle')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-charcoal">Update Vehicle Details</h3>
          <button onClick={onClose} disabled={mutation.isPending} className="rounded-full p-1 text-warm-gray hover:bg-charcoal/5 disabled:opacity-50"><X className="h-4 w-4"/></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-charcoal">Vehicle Type</label>
            <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato bg-white">
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal">Vehicle Number</label>
            <input type="text" required value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm uppercase focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato" placeholder="MH-01-AB-1234" />
          </div>
          <div>
            <label className="text-xs font-semibold text-charcoal">Model (Optional)</label>
            <input type="text" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="mt-1 w-full rounded-lg border border-charcoal/20 px-3 py-2 text-sm focus:border-tomato focus:outline-none focus:ring-1 focus:ring-tomato" placeholder="Honda Activa" />
          </div>
          <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-700 flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>Changes to vehicle details may require admin verification.</p>
          </div>
          <button type="submit" disabled={mutation.isPending} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-tomato py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-70">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {mutation.isPending ? 'Updating...' : 'Update Vehicle'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ============================================
// SUB COMPONENTS (Same as your design)
// ============================================
function Section({ title, icon: Icon, iconClass, children }: { title: string; icon: React.ElementType; iconClass?: string; children: React.ReactNode; }) {
  return (
    <div className="mt-6">
      <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-charcoal">
        <Icon className={cn('h-4 w-4', iconClass)} />
        {title}
      </h2>
      <Card className="overflow-hidden p-0">{children}</Card>
    </div>
  )
}

function RowIcon({ icon: Icon, className }: { icon: React.ElementType; className?: string }) {
  return (
    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-charcoal/5', className)}>
      <Icon className="h-4 w-4" />
    </div>
  )
}

function ToggleRow({ icon, title, sub, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4">
      <div className="flex items-center gap-3">
        <RowIcon icon={icon} className="text-charcoal/70" />
        <div>
          <p className="text-sm font-semibold text-charcoal">{title}</p>
          <p className="text-xs text-warm-gray">{sub}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/50 focus-visible:ring-offset-2',
          checked ? 'bg-green-500' : 'bg-charcoal/20'
        )}
      >
        <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
    </div>
  )
}

function RowButton({ icon, title, sub, onClick }: any) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-beige/30">
      <div className="flex items-center gap-3">
        <RowIcon icon={icon} className="text-charcoal/70" />
        <div>
          <p className="text-sm font-semibold text-charcoal">{title}</p>
          {sub && <p className="text-xs text-warm-gray">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-warm-gray" />
    </button>
  )
}

function RowLink({ to, icon, iconClass, title, sub }: any) {
  return (
    <Link to={to} className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-beige/30">
      <div className="flex items-center gap-3">
        <RowIcon icon={icon} className={iconClass} />
        <div>
          <p className="text-sm font-semibold text-charcoal">{title}</p>
          {sub && <p className="text-xs text-warm-gray">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-warm-gray" />
    </Link>
  )
}
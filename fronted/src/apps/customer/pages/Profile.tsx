import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  User, Mail, Phone, MapPin, Wallet, History, Edit2, Save, X, ChevronRight, ChevronDown,
  LogOut, Camera, ShieldCheck, Heart, CreditCard, Gift, Ticket, Bell, HelpCircle,
  Plus, Trash2, Copy, CopyCheck, Sparkles, Trash, LocateFixed, Home, Briefcase, Map as MapIcon,
  Smartphone, Banknote, QrCode, MoreVertical,
  Send,
  MessageSquare,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAddresses, useDeleteAddress, useSetDefaultAddress, useCreateAddress } from '@/api/Hooks'
import { useToast } from '@/context/ToastContext'
import { useCoupons } from '@/api/Hooks'
import { useCreateChat, useSendMessage } from '@/api/Hooks'
import { useLoyaltyPoints } from '@/api/loyaltyHooks'


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentMethod {
  id: string
  type: 'upi' | 'card' | 'wallet'
  label: string
  detail: string
  isDefault: boolean
}

interface NotifPrefs {
  orderUpdates: boolean
  promotions: boolean
  emailNewsletter: boolean
}

interface Coupon {
  code: string
  title: string
  description: string
  expiresIn: string
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = {
  orderUpdates: true,
  promotions: true,
  emailNewsletter: false,
}


// Help & Support Types
interface Ticket {
  id: string
  subject: string
  status: 'open' | 'resolved' | 'pending'
  createdAt: string
}

const DEFAULT_FAQS = [
  { q: 'Where is my order?', a: 'Track it live from the Order History page — you\'ll see real-time status from kitchen to your door.' },
  { q: 'How do I cancel an order?', a: 'You can cancel from Order History as long as the restaurant hasn\'t started preparing it.' },
  { q: 'How do refunds work?', a: 'Refunds go back to your original payment method or wallet within 3–5 business days.' },
  { q: 'Can I change my delivery address?', a: 'Yes, edit or add addresses anytime from the Saved Addresses section below.' },
  { q: 'How do I contact support?', a: 'You can email us at support@sanfoody.com, call us at +91 98765 43210, or use the live chat feature below.' },
]

const TIERS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 500 },
  { name: 'Gold', min: 1500 },
] as const

// ---------------------------------------------------------------------------
// Reusable Components
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-tomato' : 'bg-charcoal/15',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow',
          checked ? 'left-5.5' : 'left-0.5',
        )}
      />
    </button>
  )
}

function SectionCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
          <Icon className="h-5 w-5 text-tomato" />
          {title}
        </h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile Page
// ---------------------------------------------------------------------------

export function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Backend Address Hooks
  const { data: addresses, isLoading: addressesLoading } = useAddresses()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()
  const createAddress = useCreateAddress()

  // Add Address Modal State
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddressLabel, setNewAddressLabel] = useState('Home')
  const [newAddress, setNewAddress] = useState('')
  const [newCity, setNewCity] = useState('Mumbai')
  const [newState, setNewState] = useState('Maharashtra')
  const [newPincode, setNewPincode] = useState('400001')
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false)

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [newPaymentType, setNewPaymentType] = useState<'upi' | 'card'>('upi')
  const [newPaymentDetail, setNewPaymentDetail] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: localStorage.getItem('sanfoody:phone') || '',
  })

  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem('sanfoody:avatar'))
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [points] = useState<number>(() => Number(localStorage.getItem('sanfoody:points')) || 820)

  // 🔥 Coupons Hook
  const { data: coupons, isLoading: couponsLoading } = useCoupons()

  // 🔥 Help & Support Handlers
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')


  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const createChat = useCreateChat()
  const sendMessage = useSendMessage()


  const { data: loyalty } = useLoyaltyPoints()

  // Help & Support Handlers
  const handleRaiseTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      showToast('error', 'Please fill all fields')
      return
    }
    // Backend API call yahan karein
    showToast('success', 'Ticket raised successfully! We will get back to you soon.')
    setShowTicketForm(false)
    setTicketSubject('')
    setTicketDescription('')
  }


  // 🔥 Chat handlers
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    if (!activeChatId) {
      // Naya chat create karo
      createChat.mutate(
        { subject: 'Customer Support', message: chatMessage },
        {
          onSuccess: (chat) => {
            setActiveChatId(chat._id)
            setChatMessages(chat.messages)
            setChatMessage('')
          },
        }
      )
    } else {
      // Existing chat mein message bhejo
      sendMessage.mutate(
        { id: activeChatId, message: chatMessage },
        {
          onSuccess: (chat) => {
            setChatMessages(chat.messages)
            setChatMessage('')
          },
        }
      )
    }
  }



  useEffect(() => {
    const pm = localStorage.getItem('sanfoody:paymentMethods')
    setPaymentMethods(
      pm
        ? JSON.parse(pm)
        : [
          { id: 'pm_1', type: 'upi', label: 'UPI', detail: 'you@okhdfcbank', isDefault: true },
          { id: 'pm_2', type: 'card', label: 'Credit Card', detail: 'HDFC Bank •••• 1234', isDefault: false },
        ]
    )

    const prefs = localStorage.getItem('sanfoody:notifPrefs')
    if (prefs) setNotifPrefs(JSON.parse(prefs))
  }, [])

  // Derived: membership tier
  const currentTier = [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0]
  const nextTier = TIERS[TIERS.findIndex((t) => t.name === currentTier.name) + 1]
  const progress = nextTier
    ? Math.min(100, ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100

  // Handlers
  const handleSave = () => {
    if (user && setUser) {
      setUser({ ...user, name: formData.name, email: formData.email } as typeof user)
    }
    localStorage.setItem('sanfoody:phone', formData.phone)
    setIsEditing(false)
  }

  const handleDeleteAddress = (id: string) => {
    deleteAddress.mutate(id)
  }

  const handleSetDefaultAddress = (id: string) => {
    setDefaultAddress.mutate(id)
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatar(dataUrl)
      localStorage.setItem('sanfoody:avatar', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // 🔥 Payment Methods Handlers
  const handleAddPaymentMethod = () => {
    if (!newPaymentDetail.trim()) {
      showToast('error', 'Please enter payment details')
      return
    }
    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: newPaymentType,
      label: newPaymentType === 'upi' ? 'UPI' : 'Credit Card',
      detail: newPaymentDetail,
      isDefault: paymentMethods.length === 0,
    }
    const updated = [...paymentMethods, newMethod]
    setPaymentMethods(updated)
    localStorage.setItem('sanfoody:paymentMethods', JSON.stringify(updated))
    setShowAddPaymentModal(false)
    setNewPaymentDetail('')
    showToast('success', 'Payment method added successfully!')
  }

  const handleDeletePayment = (id: string) => {
    const updated = paymentMethods.filter((p) => p.id !== id)
    setPaymentMethods(updated)
    localStorage.setItem('sanfoody:paymentMethods', JSON.stringify(updated))
    showToast('success', 'Payment method removed!')
  }

  const handleSetDefaultPayment = (id: string) => {
    const updated = paymentMethods.map((p) => ({ ...p, isDefault: p.id === id }))
    setPaymentMethods(updated)
    localStorage.setItem('sanfoody:paymentMethods', JSON.stringify(updated))
    showToast('success', 'Default payment method updated!')
  }

  // Payment Icon
  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'upi': return <Smartphone className="h-5 w-5 text-blue-500" />
      case 'card': return <CreditCard className="h-5 w-5 text-purple-500" />
      case 'wallet': return <Wallet className="h-5 w-5 text-orange-500" />
      default: return <CreditCard className="h-5 w-5 text-warm-gray" />
    }
  }

  const handleToggleNotif = (key: keyof NotifPrefs) => (value: boolean) => {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    localStorage.setItem('sanfoody:notifPrefs', JSON.stringify(updated))
  }

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1600)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false)
    logout()
    navigate('/')
  }

  const handleGetCurrentLocation = () => {
    setCurrentLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setNewAddress(locationText)
          setNewAddressLabel('Current Location')
          setCurrentLocationLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          showToast('error', 'Could not get your location. Please try again.')
          setCurrentLocationLoading(false)
        }
      )
    } else {
      showToast('error', 'Geolocation is not supported by this browser.')
      setCurrentLocationLoading(false)
    }
  }

  const handleSaveNewAddress = () => {
    if (!newAddress.trim()) {
      showToast('error', 'Please enter a valid address')
      return
    }
    createAddress.mutate({
      label: newAddressLabel,
      address: newAddress,
      city: newCity,
      state: newState,
      pincode: newPincode,
    }, {
      onSuccess: () => {
        setShowAddAddress(false)
        setNewAddress('')
        showToast('success', 'Address saved successfully!')
      }
    })
  }


  // 🔥 Loyalty tier helpers (based on real API data)
  const TIER_THRESHOLDS = {
    bronze: { min: 0, max: 1000, next: 'Silver' },
    silver: { min: 1000, max: 5000, next: 'Gold' },
    gold: { min: 5000, max: 10000, next: 'Platinum' },
    platinum: { min: 10000, max: 10000, next: null },
  }

  const calculateProgress = () => {
    const tier = loyalty?.tier || 'bronze'
    const earned = loyalty?.totalEarned ?? 0
    const config = TIER_THRESHOLDS[tier]
    if (!config.next) return 100
    const range = config.max - config.min
    const progress = ((earned - config.min) / range) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  const getNextTierLabel = () => {
    const tier = loyalty?.tier || 'bronze'
    const earned = loyalty?.totalEarned ?? 0
    const config = TIER_THRESHOLDS[tier]
    if (!config.next) return 'Highest tier unlocked 🎉'
    const remaining = config.max - earned
    return `${remaining.toLocaleString('en-IN')} pts to ${config.next}`
  }

  if (!user) return null

  return (
    <section className="mx-auto max-w-4xl px-5 py-28 sm:px-8 sm:py-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-charcoal sm:text-4xl">My Profile</h1>
            <p className="mt-1 text-sm text-warm-gray">Manage your account and preferences</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-charcoal/15 px-4 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:border-tomato/40 hover:text-tomato"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Avatar + Membership hero */}
        {/* Avatar + Membership hero */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-charcoal/5 bg-linear-to-br from-charcoal to-charcoal/90 p-6 shadow-warm sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Avatar + User Info */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-tomato/20 text-2xl font-bold text-cream ring-2 ring-cream/20">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <button
                  onClick={handleAvatarPick}
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-tomato text-cream shadow-warm transition-transform hover:scale-105 active:scale-95"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-cream">
                  {user.name}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-cream/60">
                  {user.email}
                  <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
                </p>
              </div>
            </div>

            {/* 🔥 Loyalty Tier Card — clickable to /loyalty */}
            <Link
              to="/loyalty"
              className="block rounded-2xl bg-cream/10 p-4 transition-all hover:bg-cream/20 sm:w-56"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-cream">
                  <Sparkles className="h-4 w-4 text-orange" />
                  {loyalty?.tier
                    ? loyalty.tier.charAt(0).toUpperCase() + loyalty.tier.slice(1)
                    : 'Bronze'}{' '}
                  member
                </span>
                <span className="text-xs text-cream/60">
                  {loyalty?.points ?? 0} pts
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-cream/15">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full bg-linear-to-r from-tomato to-orange"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-cream/50">
                {getNextTierLabel()}
              </p>
            </Link>
          </div>
        </div>

        {/* Personal Information */}
        <SectionCard
          icon={User}
          title="Personal Information"
          action={
            <button onClick={() => setIsEditing(!isEditing)} className="text-warm-gray transition-colors hover:text-tomato">
              {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            </button>
          }
        >
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-tomato"
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="mr-2 inline h-4 w-4" />
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-charcoal">
                <User className="h-4 w-4 text-warm-gray" />
                <span className="font-medium">{user.name}</span>
              </p>
              <p className="flex items-center gap-2 text-charcoal">
                <Mail className="h-4 w-4 text-warm-gray" />
                <span>{user.email}</span>
              </p>
              <p className="flex items-center gap-2 text-charcoal">
                <Phone className="h-4 w-4 text-warm-gray" />
                <span>{formData.phone || 'Add a phone number'}</span>
              </p>
            </div>
          )}
        </SectionCard>

        {/* 🔥 Loyalty Points Card */}
        <Link
          to="/loyalty"
          className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-gold/20 bg-linear-to-br from-gold/10 via-orange/5 to-tomato/10 p-5 shadow-soft transition-all hover:border-gold/40 hover:shadow-warm"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-gold to-orange">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-bold text-charcoal">
                  Loyalty Points
                </p>
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                  {loyalty?.tier || 'Bronze'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-warm-gray">
                {loyalty?.points ?? 0} points · Worth ₹
                {((loyalty?.points ?? 0) * 0.1).toFixed(2)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-warm-gray" />
        </Link>


        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { icon: Wallet, title: 'Wallet', sub: 'View balance & transactions', to: '/wallet' },
            { icon: History, title: 'Order History', sub: 'View all your orders', to: '/orders' },
            { icon: Heart, title: 'Favorites', sub: 'Your saved restaurants & dishes', to: '/favorites' },
            { icon: Gift, title: 'Gift Cards', sub: 'Buy or redeem gift cards', to: '/gift-cards' }, 
            { icon: CreditCard, title: 'Payment Methods', sub: `${paymentMethods.length} saved method${paymentMethods.length === 1 ? '' : 's'}`, to: null },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => (item.to ? navigate(item.to) : document.getElementById('payment-methods')?.scrollIntoView({ behavior: 'smooth' }))}
              className="group flex items-center justify-between rounded-3xl border border-charcoal/5 bg-white p-5 shadow-soft transition-shadow hover:shadow-warm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-tomato/10 p-3">
                  <item.icon className="h-5 w-5 text-tomato" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-charcoal">{item.title}</p>
                  <p className="text-sm text-warm-gray">{item.sub}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-warm-gray transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>

        {/* Coupons & Offers */}
        <SectionCard icon={Ticket} title="Coupons & Offers">
          {couponsLoading ? (
            <p className="py-6 text-center text-warm-gray">Loading coupons...</p>
          ) : !coupons || coupons.length === 0 ? (
            <p className="py-6 text-center text-warm-gray">No coupons available right now.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="relative flex w-64 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-dashed border-tomato/30 bg-tomato/5 p-4"
                >
                  <div className="flex items-start gap-2">
                    <Gift className="mt-0.5 h-4 w-4 shrink-0 text-tomato" />
                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        {coupon.discountPercent > 0 ? `${coupon.discountPercent}% OFF` : coupon.title}
                      </p>
                      <p className="mt-0.5 text-xs text-warm-gray">{coupon.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-md bg-white px-2 py-1 font-mono text-xs font-semibold text-charcoal">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="text-tomato transition-colors hover:text-orange"
                      aria-label="Copy code"
                    >
                      {copiedCode === coupon.code ? <CopyCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-tomato/70">
                    Valid until: {new Date(coupon.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Payment Methods (Zomato/Swiggy Style) */}
        <div id="payment-methods">
          <SectionCard
            icon={CreditCard}
            title="Payment Methods"
            action={
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="flex items-center gap-1 rounded-full bg-tomato/10 px-3 py-1 text-xs font-semibold text-tomato hover:bg-tomato/20"
              >
                <Plus className="h-3.5 w-3.5" />
                Add New
              </button>
            }
          >
            {paymentMethods.length === 0 ? (
              <p className="py-6 text-center text-warm-gray">No payment methods saved yet.</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 transition-colors',
                      pm.isDefault ? 'border-tomato/40 bg-tomato/5' : 'border-charcoal/10',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-charcoal/5">
                        {getPaymentIcon(pm.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-charcoal">{pm.label}</span>
                          {pm.isDefault && (
                            <span className="rounded-full bg-tomato px-2 py-0.5 text-[10px] font-bold text-cream">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-warm-gray">{pm.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!pm.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPayment(pm.id)}
                          className="text-xs font-semibold text-tomato hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePayment(pm.id)}
                        className="text-charcoal/40 transition-colors hover:text-tomato"
                        aria-label="Remove payment method"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Add Payment Method Modal */}
        <AnimatePresence>
          {showAddPaymentModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddPaymentModal(false)}
                className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-charcoal">Add Payment Method</h2>
                  <button
                    onClick={() => setShowAddPaymentModal(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Payment Type Selection */}
                  <div>
                    <label className="mb-2 text-sm font-semibold text-charcoal">Payment Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewPaymentType('upi')}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold',
                          newPaymentType === 'upi'
                            ? 'border-tomato bg-tomato/5 text-tomato'
                            : 'border-charcoal/10 text-charcoal/70',
                        )}
                      >
                        <Smartphone className="h-4 w-4" />
                        UPI
                      </button>
                      <button
                        onClick={() => setNewPaymentType('card')}
                        className={cn(
                          'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold',
                          newPaymentType === 'card'
                            ? 'border-tomato bg-tomato/5 text-tomato'
                            : 'border-charcoal/10 text-charcoal/70',
                        )}
                      >
                        <CreditCard className="h-4 w-4" />
                        Card
                      </button>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                      {newPaymentType === 'upi' ? 'UPI ID' : 'Card Number'}
                    </label>
                    <input
                      type="text"
                      value={newPaymentDetail}
                      onChange={(e) => setNewPaymentDetail(e.target.value)}
                      placeholder={newPaymentType === 'upi' ? 'yourname@bank' : '1234 5678 9012 3456'}
                      className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                    />
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setShowAddPaymentModal(false)}
                      className="flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPaymentMethod}
                      className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Add Method
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Saved Addresses */}
        <SectionCard
          icon={MapPin}
          title="Saved Addresses"
          action={
            <button
              onClick={() => setShowAddAddress(true)}
              className="text-sm font-semibold text-tomato hover:underline"
            >
              + Add New
            </button>
          }
        >
          {addressesLoading ? (
            <p className="py-6 text-center text-warm-gray">Loading addresses...</p>
          ) : !addresses || addresses.length === 0 ? (
            <p className="py-6 text-center text-warm-gray">No saved addresses yet. Add one now!</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={cn(
                    'rounded-xl border p-4 transition-colors',
                    addr.isDefault ? 'border-tomato/40 bg-tomato/5' : 'border-charcoal/10',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-charcoal">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-tomato px-2 py-0.5 text-[10px] font-bold text-cream">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-charcoal/80">{addr.address}</p>
                      <p className="text-sm text-warm-gray">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr._id)}
                          className="text-xs font-semibold text-tomato transition-colors hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-xs font-semibold text-charcoal/40 transition-colors hover:text-tomato"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* 🔥 Add New Address Modal (Zomato/Swiggy Style) */}
        <AnimatePresence>
          {showAddAddress && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddAddress(false)}
                className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-charcoal">Add New Address</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Address Label */}
                  <div>
                    <label className="mb-2 text-sm font-semibold text-charcoal">Address Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map((label) => (
                        <button
                          key={label}
                          onClick={() => setNewAddressLabel(label)}
                          className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-colors',
                            newAddressLabel === label
                              ? 'border-tomato bg-tomato/5 text-tomato'
                              : 'border-charcoal/10 text-charcoal/70 hover:border-charcoal/20',
                          )}
                        >
                          {label === 'Home' ? <Home className="h-3.5 w-3.5" /> : label === 'Work' ? <Briefcase className="h-3.5 w-3.5" /> : <MapIcon className="h-3.5 w-3.5" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Location Button */}
                  <button
                    onClick={handleGetCurrentLocation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white py-2.5 text-xs font-semibold text-charcoal/70 transition-colors hover:border-tomato/40 hover:text-tomato"
                  >
                    <LocateFixed className="h-4 w-4" />
                    {currentLocationLoading ? 'Detecting location...' : 'Use Current Location'}
                  </button>

                  {/* Address Details */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Full Address</label>
                    <textarea
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      rows={3}
                      placeholder="House no., street, area"
                      className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="City"
                      className="rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
                    />
                    <input
                      type="text"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      placeholder="State"
                      className="rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
                    />
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="Pincode"
                      className="rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-tomato"
                    />
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNewAddress}
                      className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <SectionCard icon={Bell} title="Notifications">
          <div className="space-y-4">
            {[
              { key: 'orderUpdates' as const, label: 'Order updates', sub: 'Status changes for your live orders' },
              { key: 'promotions' as const, label: 'Promotions & offers', sub: 'Deals, discounts and new restaurants' },
              { key: 'emailNewsletter' as const, label: 'Email newsletter', sub: 'Occasional updates in your inbox' },
            ].map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-charcoal">{row.label}</p>
                  <p className="text-xs text-warm-gray">{row.sub}</p>
                </div>
                <Toggle checked={notifPrefs[row.key]} onChange={handleToggleNotif(row.key)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Help & Support */}
        <SectionCard
          icon={HelpCircle}
          title="Help & Support"
          action={
            <button
              onClick={() => setShowChatModal(true)}
              className="flex items-center gap-1 rounded-full bg-tomato/10 px-3 py-1 text-xs font-semibold text-tomato hover:bg-tomato/20"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Live Chat
            </button>
          }
        >
          {/* Support Options Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              onClick={() => setShowTicketForm(true)}
              className="flex flex-col items-center gap-2 rounded-xl border border-charcoal/10 p-4 text-center transition-colors hover:border-tomato/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-tomato/10">
                <Plus className="h-5 w-5 text-tomato" />
              </div>
              <span className="text-xs font-semibold text-charcoal">Raise a Ticket</span>
            </button>
            <button
              onClick={() => window.open('mailto:support@sanfoody.com')}
              className="flex flex-col items-center gap-2 rounded-xl border border-charcoal/10 p-4 text-center transition-colors hover:border-tomato/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-charcoal">Email Support</span>
            </button>
            <button
              onClick={() => window.open('tel:+919876543210')}
              className="flex flex-col items-center gap-2 rounded-xl border border-charcoal/10 p-4 text-center transition-colors hover:border-tomato/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-green-100">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-charcoal">Call Support</span>
            </button>
            <button
              onClick={() => window.open('https://wa.me/919876543210')}
              className="flex flex-col items-center gap-2 rounded-xl border border-charcoal/10 p-4 text-center transition-colors hover:border-tomato/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100">
                <MessageCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold text-charcoal">WhatsApp</span>
            </button>
          </div>

          {/* FAQs */}
          <div className="divide-y divide-charcoal/8">
            {DEFAULT_FAQS.map((faq, i) => (
              <div key={faq.q} className="py-3 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold text-charcoal">{faq.q}</span>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-warm-gray transition-transform', openFaq === i && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden text-sm text-warm-gray"
                    >
                      <span className="block pt-2">{faq.a}</span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </SectionCard>
        {/* 🔥 Raise Ticket Modal */}
        <AnimatePresence>
          {showTicketForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTicketForm(false)}
                className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-charcoal">Raise a Ticket</h2>
                  <button
                    onClick={() => setShowTicketForm(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g., Order delayed"
                      className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-charcoal">Description</label>
                    <textarea
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      rows={4}
                      placeholder="Describe your issue in detail..."
                      className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                    />
                  </div>

                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setShowTicketForm(false)}
                      className="flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRaiseTicket}
                      className="flex-1 rounded-full bg-linear-to-r from-tomato to-orange py-3 text-sm font-bold text-cream shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 🔥 Live Chat Modal */}
        <AnimatePresence>
          {showChatModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowChatModal(false)}
                className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                className="fixed inset-x-0 bottom-0 z-70 mx-auto max-w-md rounded-t-3xl bg-cream p-6 shadow-warm sm:bottom-4 sm:rounded-3xl"
              >
                <div className="mb-4 flex items-center justify-between border-b border-charcoal/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-tomato/10">
                      <MessageSquare className="h-5 w-5 text-tomato" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">SanFoody Support</p>
                      <p className="text-xs text-green-600">● Online</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatModal(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-charcoal/5 p-3 text-sm text-charcoal/80">
                        Hello! How can we help you today?
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={cn('flex', msg.senderRole === 'customer' ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl p-3 text-sm',
                          msg.senderRole === 'customer'
                            ? 'rounded-tr-sm bg-tomato text-cream'
                            : 'rounded-tl-sm bg-charcoal/5 text-charcoal/80'
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="mt-4 flex items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 py-2.5">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendMessage.isPending || createChat.isPending}
                    className="grid h-8 w-8 place-items-center rounded-full bg-tomato text-cream disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Danger zone */}
        <div className="rounded-3xl border border-red-100 bg-red-50/40 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-charcoal">Delete account</p>
              <p className="text-sm text-warm-gray">Permanently remove your account and all saved data.</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 z-60 bg-charcoal/50 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-70 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-cream p-6 shadow-warm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-charcoal">Delete account?</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-warm-gray hover:bg-beige hover:text-charcoal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-warm-gray">
                This will permanently delete your account, saved addresses, and order history. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                >
                  Keep Account
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-full bg-red-600 py-3 text-sm font-bold text-white shadow-warm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
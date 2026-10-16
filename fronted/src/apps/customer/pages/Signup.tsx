// src/apps/customer/pages/Signup.tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  User,
  ShoppingBag,
  Bike,
  Store,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  FileText,
  CreditCard,
  IdCard,
  Truck,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { SEO } from '@/apps/customer/components/SEO'
import { useAuth } from '@/context/useAuth'
import { useToast } from '@/context/ToastContext'
import { registerUser } from '@/api/Client'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

type UserRole = 'customer' | 'restaurant' | 'delivery'

interface FormData {
  name: string
  email: string
  password: string
  phone: string
  businessName: string
  fssaiNumber: string
  gstNumber: string
  panNumber: string
  bankAccountNumber: string
  bankIfscCode: string
  address: string
  licenseNumber: string
  aadhaarNumber: string
  vehicleType: 'bike' | 'scooter' | 'cycle' | 'car'
  vehicleNumber: string
  emergencyContact: string
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  businessName: '',
  fssaiNumber: '',
  gstNumber: '',
  panNumber: '',
  bankAccountNumber: '',
  bankIfscCode: '',
  address: '',
  licenseNumber: '',
  aadhaarNumber: '',
  vehicleType: 'bike',
  vehicleNumber: '',
  emergencyContact: '',
}

// ============================================
// Role Configs
// ============================================

const ROLES = {
  customer: {
    id: 'customer' as UserRole,
    label: 'Customer',
    icon: ShoppingBag,
    description: 'Order food from restaurants near you',
    color: 'from-tomato to-orange',
    heroTitle: (
      <>
        Discover. Order.
        <br />
        <span className="text-orange">Enjoy.</span>
      </>
    ),
    heroDescription:
      'Join thousands of food lovers discovering the best restaurants in their city.',
    benefits: ['Order in seconds', 'Earn loyalty points', 'Live tracking'],
  },
  restaurant: {
    id: 'restaurant' as UserRole,
    label: 'Restaurant',
    icon: Store,
    description: 'List your restaurant & manage orders',
    color: 'from-green-500 to-emerald-600',
    heroTitle: (
      <>
        Grow your
        <br />
        <span className="text-orange">restaurant.</span>
      </>
    ),
    heroDescription:
      'Get listed on SanFoody and reach thousands of hungry customers every day.',
    benefits: ['Grow your business', 'Zero setup fee', 'Analytics dashboard'],
  },
  delivery: {
    id: 'delivery' as UserRole,
    label: 'Delivery',
    icon: Bike,
    description: 'Deliver orders & earn money',
    color: 'from-blue-500 to-indigo-600',
    heroTitle: (
      <>
        Deliver. Earn.
        <br />
        <span className="text-orange">Thrive.</span>
      </>
    ),
    heroDescription:
      'Become a SanFoody delivery partner and earn on your own schedule.',
    benefits: ['Flexible hours', 'Daily payouts', 'Performance bonus'],
  },
} as const

// ============================================
// URL to Role Mapping
// ============================================

function getRoleFromPath(pathname: string): UserRole {
  if (pathname.includes('/signup/partner/restaurant')) return 'restaurant'
  if (pathname.includes('/signup/partner/delivery')) return 'delivery'
  return 'customer' // default /signup
}

function getStepsForRole(role: UserRole): number {
  // Customer: 2 steps (basic → confirm)
  // Restaurant/Delivery: 3 steps (basic → role-specific → confirm)
  return role === 'customer' ? 2 : 3
}

// ============================================
// Main Component
// ============================================

export function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const { showToast } = useToast()

  // 🔥 Determine role from URL
  const role: UserRole = getRoleFromPath(location.pathname)
  const roleConfig = ROLES[role]
  const maxStep = getStepsForRole(role)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 🔥 Reset when role changes (URL change)
  useEffect(() => {
    setStep(1)
    setForm(INITIAL_FORM)
  }, [role])

  const updateForm = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ============================================
  // Validation
  // ============================================

  const validateBasic = () => {
    if (!form.name.trim()) return 'Please enter your name'
    if (!form.email.trim() || !form.email.includes('@')) return 'Please enter a valid email'
    if (!form.phone.trim() || form.phone.length < 10) return 'Please enter a valid phone number'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const validateRoleSpecific = () => {
    if (role === 'restaurant') {
      if (!form.businessName.trim()) return 'Business name is required'
      if (!form.fssaiNumber.trim()) return 'FSSAI number is required'
      if (!form.address.trim()) return 'Address is required'
    }
    if (role === 'delivery') {
      if (!form.licenseNumber.trim()) return 'Driving license is required'
      if (!form.vehicleType) return 'Please select vehicle type'
    }
    return null
  }

  // ============================================
  // Handlers
  // ============================================

  const handleNext = () => {
    if (step === 1) {
      const error = validateBasic()
      if (error) return showToast('error', error)
      setStep(2)
      return
    }
    if (step === 2 && role !== 'customer') {
      const error = validateRoleSpecific()
      if (error) return showToast('error', error)
      setStep(3)
      return
    }
    // If customer at step 2, submit instead of next
    if (step === 2 && role === 'customer') {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3)
  }

  const handleSubmit = async () => {
    // Final validation before submit
    const error = validateRoleSpecific()
    if (error) return showToast('error', error)

    setIsSubmitting(true)

    try {
      const payload: any = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role,
        phone: form.phone.trim(),
      }

      if (role === 'restaurant') {
        payload.restaurantDetails = {
          businessName: form.businessName.trim(),
          fssaiNumber: form.fssaiNumber.trim().toUpperCase(),
          gstNumber: form.gstNumber.trim().toUpperCase(),
          panNumber: form.panNumber.trim().toUpperCase(),
          bankAccountNumber: form.bankAccountNumber.trim(),
          bankIfscCode: form.bankIfscCode.trim().toUpperCase(),
          address: form.address.trim(),
        }
      }

      if (role === 'delivery') {
        payload.deliveryDetails = {
          licenseNumber: form.licenseNumber.trim().toUpperCase(),
          aadhaarNumber: form.aadhaarNumber.trim(),
          panNumber: form.panNumber.trim().toUpperCase(),
          vehicleType: form.vehicleType,
          vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
          bankAccountNumber: form.bankAccountNumber.trim(),
          bankIfscCode: form.bankIfscCode.trim().toUpperCase(),
          emergencyContact: form.emergencyContact.trim(),
        }
      }

      await registerUser(payload)
      showToast('success', 'Account created! Please log in.')
      setTimeout(() => navigate('/login'), 800)
    } catch (err: any) {
      showToast('error', err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // Step Labels
  // ============================================

  const getStepTitle = () => {
    if (step === 1) return 'Basic Information'
    if (step === 2 && role === 'customer') return 'Confirm Your Details'
    if (step === 2 && role === 'restaurant') return 'Business Details'
    if (step === 2 && role === 'delivery') return 'Partner Details'
    if (step === 3) return 'Review & Confirm'
    return 'Sign Up'
  }

  const getStepSubtitle = () => {
    if (step === 1) return 'Tell us about yourself. All fields marked * are required.'
    if (step === 2 && role === 'customer')
      return 'Review your details and create your account.'
    if (step === 2 && role === 'restaurant')
      return 'We need these for business verification.'
    if (step === 2 && role === 'delivery')
      return 'These details are needed to onboard you as a partner.'
    if (step === 3) return 'Make sure everything is correct before submitting.'
    return ''
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <SEO
        title={`${roleConfig.label} Signup — SanFoody`}
        description={roleConfig.description}
      />

      {/* ============================================
          LEFT PANEL — Dark Branded
          ============================================ */}
      <div className="relative hidden overflow-hidden bg-charcoal lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background Image */}
        <img
          src="/public/images/auth/Cinematic_close-up_of_a_gourmet_burger_with_melted_cheese_on.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark gradient overlay: solid on the text side, photo shows through on the right */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-charcoal via-charcoal/90 to-charcoal/20" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-charcoal/90 via-transparent to-charcoal/50" />

        {/* Decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-tomato/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-tomato/10 blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative z-10 inline-flex items-center gap-3">
          <img
            src="/images/logo/logo2.png"
            alt="SanFoody"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-lg"
          >
            <div
              className={cn(
                'mb-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-cream',
                roleConfig.color
              )}
            >
              <roleConfig.icon className="h-3.5 w-3.5" />
              {roleConfig.label} Signup
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight text-cream xl:text-5xl">
              {roleConfig.heroTitle}
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
              {roleConfig.heroDescription}
            </p>

            <div className="mt-8 space-y-3">
              {roleConfig.benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream/10">
                    <CheckCircle2 className="h-4 w-4 text-orange" />
                  </div>
                  <span className="text-sm text-cream/80">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex items-center gap-4 text-xs text-cream/40">
          <span>© {new Date().getFullYear()} SanFoody</span>
          <span>•</span>
          <span>Made in India</span>
        </div>
      </div>

      {/* ============================================
          RIGHT PANEL — Form
          ============================================ */}
      <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 sm:px-8 lg:min-h-0 lg:py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/images/logo/logo2.png"
              alt="SanFoody"
              className="h-12 w-auto object-contain"
            />

          </div>

          {/* Progress Bar */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {Array.from({ length: maxStep }).map((_, i) => {
              const s = i + 1
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all',
                      step >= s
                        ? 'bg-tomato text-cream'
                        : 'bg-charcoal/10 text-charcoal/40'
                    )}
                  >
                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  {s < maxStep && (
                    <div
                      className={cn(
                        'h-0.5 w-10 transition-colors',
                        step > s ? 'bg-tomato' : 'bg-charcoal/10'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ============================================
                STEP 1: Basic Info
                ============================================ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={cn(
                    'mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream bg-linear-to-r',
                    roleConfig.color
                  )}
                >
                  <roleConfig.icon className="h-3 w-3" />
                  {roleConfig.label} Signup
                </div>
                <h1 className="font-display text-3xl font-extrabold text-charcoal">
                  {getStepTitle()}
                </h1>
                <p className="mt-2 text-sm text-warm-gray">{getStepSubtitle()}</p>

                <div className="mt-8 space-y-4">
                  <InputField
                    icon={User}
                    label="Full Name"
                    value={form.name}
                    onChange={(v) => updateForm('name', v)}
                    placeholder="Your name"
                    required
                  />
                  <InputField
                    icon={Mail}
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => updateForm('email', v)}
                    placeholder="you@example.com"
                    required
                  />
                  <InputField
                    icon={Phone}
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => updateForm('phone', v)}
                    placeholder="+91 98765 43210"
                    required
                  />
                  <InputField
                    icon={Lock}
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(v) => updateForm('password', v)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleNext}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange px-6 py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ============================================
                STEP 2: Role-Specific OR Customer Confirm
                ============================================ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl font-extrabold text-charcoal">
                  {getStepTitle()}
                </h1>
                <p className="mt-2 text-sm text-warm-gray">{getStepSubtitle()}</p>

                {/* ========== CUSTOMER — Confirm only ========== */}
                {role === 'customer' && (
                  <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white p-5 shadow-soft">
                    <div className="flex items-center gap-3 border-b border-charcoal/5 pb-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-tomato/10">
                        <ShoppingBag className="h-5 w-5 text-tomato" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">
                          Customer Account
                        </p>
                        <p className="text-xs text-warm-gray">
                          Instant activation — no verification needed
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-warm-gray">
                        <strong className="text-charcoal">Name:</strong> {form.name}
                      </p>
                      <p className="text-warm-gray">
                        <strong className="text-charcoal">Email:</strong> {form.email}
                      </p>
                      <p className="text-warm-gray">
                        <strong className="text-charcoal">Phone:</strong> {form.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* ========== RESTAURANT ========== */}
                {role === 'restaurant' && (
                  <div className="mt-6 space-y-4">
                    <VerificationNotice
                      color="yellow"
                      text="Our team will review your documents within 24-48 hours."
                    />
                    <InputField
                      icon={Building2}
                      label="Business Name"
                      value={form.businessName}
                      onChange={(v) => updateForm('businessName', v)}
                      placeholder="e.g., Bombay Bistro Pvt. Ltd."
                      required
                    />
                    <InputField
                      icon={FileText}
                      label="FSSAI License Number"
                      value={form.fssaiNumber}
                      onChange={(v) => updateForm('fssaiNumber', v)}
                      placeholder="14-digit FSSAI number"
                      required
                    />
                    <InputField
                      icon={FileText}
                      label="GST Number (optional)"
                      value={form.gstNumber}
                      onChange={(v) => updateForm('gstNumber', v)}
                      placeholder="22AAAAA0000A1Z5"
                    />
                    <InputField
                      icon={IdCard}
                      label="PAN Number"
                      value={form.panNumber}
                      onChange={(v) => updateForm('panNumber', v)}
                      placeholder="ABCDE1234F"
                    />
                    <div className="border-t border-charcoal/10 pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-warm-gray">
                        Bank Details (for payouts)
                      </p>
                      <div className="space-y-4">
                        <InputField
                          icon={CreditCard}
                          label="Bank Account Number"
                          value={form.bankAccountNumber}
                          onChange={(v) => updateForm('bankAccountNumber', v)}
                          placeholder="1234567890123"
                        />
                        <InputField
                          icon={CreditCard}
                          label="IFSC Code"
                          value={form.bankIfscCode}
                          onChange={(v) => updateForm('bankIfscCode', v.toUpperCase())}
                          placeholder="HDFC0001234"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal">
                        Restaurant Address <span className="text-tomato">*</span>
                      </label>
                      <textarea
                        value={form.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        rows={3}
                        placeholder="Full address with pincode"
                        className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
                      />
                    </div>
                  </div>
                )}

                {/* ========== DELIVERY ========== */}
                {role === 'delivery' && (
                  <div className="mt-6 space-y-4">
                    <VerificationNotice
                      color="blue"
                      text="Documents will be verified within 24-48 hours before you start."
                    />
                    <InputField
                      icon={IdCard}
                      label="Driving License Number"
                      value={form.licenseNumber}
                      onChange={(v) => updateForm('licenseNumber', v)}
                      placeholder="MH01 2019 0001234"
                      required
                    />
                    <InputField
                      icon={IdCard}
                      label="Aadhaar Number"
                      value={form.aadhaarNumber}
                      onChange={(v) => updateForm('aadhaarNumber', v)}
                      placeholder="1234 5678 9012"
                    />
                    <InputField
                      icon={IdCard}
                      label="PAN Number"
                      value={form.panNumber}
                      onChange={(v) => updateForm('panNumber', v)}
                      placeholder="ABCDE1234F"
                    />
                    <div>
                      <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-charcoal">
                        <Truck className="h-4 w-4" />
                        Vehicle Type <span className="text-tomato">*</span>
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['bike', 'scooter', 'cycle', 'car'] as const).map((vt) => (
                          <button
                            key={vt}
                            type="button"
                            onClick={() => updateForm('vehicleType', vt)}
                            className={cn(
                              'rounded-xl border py-2.5 text-xs font-semibold capitalize transition-colors',
                              form.vehicleType === vt
                                ? 'border-tomato bg-tomato text-cream'
                                : 'border-charcoal/15 text-charcoal hover:border-tomato/40'
                            )}
                          >
                            {vt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <InputField
                      icon={Truck}
                      label="Vehicle Number"
                      value={form.vehicleNumber}
                      onChange={(v) => updateForm('vehicleNumber', v.toUpperCase())}
                      placeholder="MH-01-AB-1234"
                    />
                    <div className="border-t border-charcoal/10 pt-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-warm-gray">
                        Bank Details (for earnings)
                      </p>
                      <div className="space-y-4">
                        <InputField
                          icon={CreditCard}
                          label="Bank Account Number"
                          value={form.bankAccountNumber}
                          onChange={(v) => updateForm('bankAccountNumber', v)}
                          placeholder="1234567890123"
                        />
                        <InputField
                          icon={CreditCard}
                          label="IFSC Code"
                          value={form.bankIfscCode}
                          onChange={(v) => updateForm('bankIfscCode', v.toUpperCase())}
                          placeholder="HDFC0001234"
                        />
                      </div>
                    </div>
                    <InputField
                      icon={Phone}
                      label="Emergency Contact"
                      value={form.emergencyContact}
                      onChange={(v) => updateForm('emergencyContact', v)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 rounded-xl border border-charcoal/15 px-6 py-3.5 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange px-6 py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {role === 'customer' ? (
                      isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Create Account
                        </>
                      )
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ============================================
                STEP 3: Review & Submit (only Restaurant/Delivery)
                ============================================ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-display text-3xl font-extrabold text-charcoal">
                  {getStepTitle()}
                </h1>
                <p className="mt-2 text-sm text-warm-gray">{getStepSubtitle()}</p>

                <div className="mt-8 space-y-3">
                  <ReviewRow label="Name" value={form.name} />
                  <ReviewRow label="Email" value={form.email} />
                  <ReviewRow label="Phone" value={form.phone} />

                  {role === 'restaurant' && (
                    <>
                      <ReviewRow label="Business Name" value={form.businessName} />
                      <ReviewRow label="FSSAI" value={form.fssaiNumber} mono />
                      {form.gstNumber && (
                        <ReviewRow label="GST" value={form.gstNumber} mono />
                      )}
                      <ReviewRow label="Address" value={form.address} />
                    </>
                  )}

                  {role === 'delivery' && (
                    <>
                      <ReviewRow label="License" value={form.licenseNumber} mono />
                      {form.aadhaarNumber && (
                        <ReviewRow label="Aadhaar" value={form.aadhaarNumber} mono />
                      )}
                      <ReviewRow label="Vehicle Type" value={form.vehicleType} />
                      {form.vehicleNumber && (
                        <ReviewRow label="Vehicle Number" value={form.vehicleNumber} mono />
                      )}
                    </>
                  )}
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-xl border border-charcoal/15 px-6 py-3.5 text-sm font-semibold text-charcoal/70 transition-colors hover:bg-charcoal/5 disabled:opacity-60"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-tomato to-orange px-6 py-3.5 text-sm font-bold text-cream shadow-warm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Links */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-warm-gray">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-tomato hover:underline">
                Log in
              </Link>
            </p>

            {/* 🔥 Partner Links */}
            {role === 'customer' && (
              <div className="rounded-xl bg-beige/50 p-3">
                <p className="text-xs text-warm-gray">
                  Want to be a partner?{' '}
                  <Link
                    to="/partner/restaurant"
                    className="font-semibold text-tomato hover:underline"
                  >
                    Restaurant
                  </Link>
                  {' · '}
                  <Link
                    to="/partner/delivery"
                    className="font-semibold text-tomato hover:underline"
                  >
                    Delivery
                  </Link>
                </p>
              </div>
            )}

            {(role === 'restaurant' || role === 'delivery') && (
              <div className="rounded-xl bg-beige/50 p-3">
                <p className="text-xs text-warm-gray">
                  Want to order food instead?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-tomato hover:underline"
                  >
                    Customer Signup
                  </Link>
                </p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-warm-gray">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-tomato">
              Terms
            </Link>{' '}
            &{' '}
            <Link to="/privacy" className="underline hover:text-tomato">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

function VerificationNotice({
  color,
  text,
}: {
  color: 'yellow' | 'blue'
  text: string
}) {
  const styles = {
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
  }
  return (
    <div className={cn('rounded-xl border p-3.5', styles[color])}>
      <p className="flex items-start gap-2 text-xs">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Verification required:</strong> {text}
        </span>
      </p>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-beige/40 px-4 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-warm-gray">
        {label}
      </span>
      <span className={cn('text-sm font-medium text-charcoal', mono && 'font-mono')}>
        {value}
      </span>
    </div>
  )
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-charcoal">
        {label} {required && <span className="text-tomato">*</span>}
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-charcoal/15 bg-white px-4 py-3 transition-colors focus-within:border-tomato">
        <Icon className="h-4 w-4 shrink-0 text-warm-gray" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-warm-gray"
        />
      </div>
    </div>
  )
}
// src/apps/admin/pages/Settings.tsx
import { useEffect, useMemo, useState } from 'react'
import {
  Save,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Mail,
  Smartphone,
  MessageSquare,
  Store,
  Bike,
  RotateCcw,
  ChevronDown,
  AlertCircle,
  Receipt,
} from 'lucide-react'
import { AdminButton } from '@/components/ui/AdminButton'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

// ============================================
// Types & defaults
// ============================================

type NumVal = number | ''

interface Settings {
  platformName: string
  supportEmail: string
  currency: string
  timezone: string
  commissionRate: NumVal
  deliveryFee: NumVal
  minOrderValue: NumVal
  maxDeliveryDistance: NumVal
  allowRestaurantSignup: boolean
  allowDeliverySignup: boolean
  enablePushNotifications: boolean
  enableEmailNotifications: boolean
  enableSmsNotifications: boolean
}

const STORAGE_KEY = 'sanfoody:adminSettings'

const DEFAULTS: Settings = {
  platformName: 'SanFoody',
  supportEmail: 'support@sanfoody.com',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  commissionRate: 15,
  deliveryFee: 40,
  minOrderValue: 99,
  maxDeliveryDistance: 10,
  allowRestaurantSignup: true,
  allowDeliverySignup: true,
  enablePushNotifications: true,
  enableEmailNotifications: true,
  enableSmsNotifications: false,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    /* ignore corrupt storage */
  }
  return DEFAULTS
}

type TabId = 'general' | 'business' | 'signup' | 'notifications'

const TABS: { id: TabId; label: string; desc: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', desc: 'Name, email, region', icon: Globe },
  { id: 'business', label: 'Business', desc: 'Fees & commission', icon: CreditCard },
  { id: 'signup', label: 'Signups', desc: 'Who can register', icon: Shield },
  { id: 'notifications', label: 'Notifications', desc: 'Push, email, SMS', icon: Bell },
]

const CURRENCY_SYMBOL: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' }

// ============================================
// Page
// ============================================

export function AdminSettings() {
  const { showToast } = useToast()

  const [saved, setSaved] = useState<Settings>(loadSettings)
  const [settings, setSettings] = useState<Settings>(saved)
  const [tab, setTab] = useState<TabId>('general')

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(saved), [settings, saved])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  const setNum = (key: keyof Settings, raw: string) =>
    setSettings((s) => ({ ...s, [key]: raw === '' ? '' : Number(raw) }))

  // ----- validation -----
  const errors = useMemo(() => {
    const e: Partial<Record<keyof Settings, string>> = {}
    if (!settings.platformName.trim()) e.platformName = 'Platform name is required'
    if (!/^\S+@\S+\.\S+$/.test(settings.supportEmail)) e.supportEmail = 'Enter a valid email address'

    const c = settings.commissionRate
    if (c === '') e.commissionRate = 'Required'
    else if (c < 0 || c > 100) e.commissionRate = 'Must be between 0 and 100'

    const f = settings.deliveryFee
    if (f === '') e.deliveryFee = 'Required'
    else if (f < 0) e.deliveryFee = 'Cannot be negative'

    const m = settings.minOrderValue
    if (m === '') e.minOrderValue = 'Required'
    else if (m < 0) e.minOrderValue = 'Cannot be negative'

    const d = settings.maxDeliveryDistance
    if (d === '') e.maxDeliveryDistance = 'Required'
    else if (d < 1) e.maxDeliveryDistance = 'Must be at least 1 km'
    return e
  }, [settings])

  const errorCount = Object.keys(errors).length
  const tabHasError = (id: TabId) => {
    const map: Record<TabId, (keyof Settings)[]> = {
      general: ['platformName', 'supportEmail'],
      business: ['commissionRate', 'deliveryFee', 'minOrderValue', 'maxDeliveryDistance'],
      signup: [],
      notifications: [],
    }
    return map[id].some((k) => errors[k])
  }

  // ----- actions -----
  const handleSave = () => {
    if (errorCount > 0) {
      showToast('error', 'Please fix the highlighted fields')
      const firstBad = TABS.find((t) => tabHasError(t.id))
      if (firstBad) setTab(firstBad.id)
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setSaved(settings)
      showToast('success', 'Settings saved successfully')
    } catch {
      showToast('error', 'Could not save settings')
    }
  }

  const handleDiscard = () => setSettings(saved)

  const handleResetDefaults = () => {
    if (!confirm('Reset all settings to their default values?')) return
    setSettings(DEFAULTS)
    showToast('info', 'Defaults restored. Click Save to apply.')
  }

  const sym = CURRENCY_SYMBOL[settings.currency] ?? '₹'

  // Fee preview
  const sample = 500
  const rate = typeof settings.commissionRate === 'number' ? settings.commissionRate : 0
  const fee = typeof settings.deliveryFee === 'number' ? settings.deliveryFee : 0
  const commission = (sample * rate) / 100
  const restaurantGets = sample - commission

  return (
    <div className="mx-auto max-w-[1200px] pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Settings</h1>
          <p className="mt-1 text-sm text-warm-gray">Configure how your platform works</p>
        </div>
        <AdminButton variant="secondary" onClick={handleResetDefaults}>
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </AdminButton>
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Section nav */}
        <nav className="scrollbar-none flex gap-2 overflow-x-auto rounded-2xl border border-charcoal/10 bg-white p-2 lg:flex-col lg:overflow-visible">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors lg:w-full',
                  active ? 'bg-tomato/10' : 'hover:bg-beige/60'
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                    active ? 'bg-tomato text-cream' : 'bg-beige/70 text-charcoal/60'
                  )}
                >
                  <t.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'flex items-center gap-1.5 text-sm font-semibold',
                      active ? 'text-tomato' : 'text-charcoal'
                    )}
                  >
                    {t.label}
                    {tabHasError(t.id) && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                  </span>
                  <span className="hidden text-xs text-warm-gray lg:block">{t.desc}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="space-y-5">
          {tab === 'general' && (
            <Section title="General" desc="Basic information about your platform" icon={Globe}>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Platform name" error={errors.platformName}>
                  <TextInput
                    value={settings.platformName}
                    onChange={(v) => set('platformName', v)}
                    invalid={!!errors.platformName}
                  />
                </Field>
                <Field
                  label="Support email"
                  hint="Customers see this address for help"
                  error={errors.supportEmail}
                >
                  <TextInput
                    type="email"
                    value={settings.supportEmail}
                    onChange={(v) => set('supportEmail', v)}
                    invalid={!!errors.supportEmail}
                    prefix={<Mail className="h-4 w-4" />}
                  />
                </Field>
                <Field label="Currency">
                  <Select
                    value={settings.currency}
                    onChange={(v) => set('currency', v)}
                    options={[
                      { value: 'INR', label: 'INR (₹) — Indian Rupee' },
                      { value: 'USD', label: 'USD ($) — US Dollar' },
                      { value: 'EUR', label: 'EUR (€) — Euro' },
                    ]}
                  />
                </Field>
                <Field label="Timezone">
                  <Select
                    value={settings.timezone}
                    onChange={(v) => set('timezone', v)}
                    options={[
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                    ]}
                  />
                </Field>
              </div>
            </Section>
          )}

          {tab === 'business' && (
            <>
              <Section title="Business rules" desc="Fees and limits applied to every order" icon={CreditCard}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Commission rate"
                    hint="Platform's cut from each restaurant order"
                    error={errors.commissionRate}
                  >
                    <TextInput
                      type="number"
                      value={String(settings.commissionRate)}
                      onChange={(v) => setNum('commissionRate', v)}
                      invalid={!!errors.commissionRate}
                      suffix="%"
                    />
                  </Field>
                  <Field label="Delivery fee" hint="Charged to the customer" error={errors.deliveryFee}>
                    <TextInput
                      type="number"
                      value={String(settings.deliveryFee)}
                      onChange={(v) => setNum('deliveryFee', v)}
                      invalid={!!errors.deliveryFee}
                      prefix={sym}
                    />
                  </Field>
                  <Field label="Minimum order value" error={errors.minOrderValue}>
                    <TextInput
                      type="number"
                      value={String(settings.minOrderValue)}
                      onChange={(v) => setNum('minOrderValue', v)}
                      invalid={!!errors.minOrderValue}
                      prefix={sym}
                    />
                  </Field>
                  <Field label="Max delivery distance" error={errors.maxDeliveryDistance}>
                    <TextInput
                      type="number"
                      value={String(settings.maxDeliveryDistance)}
                      onChange={(v) => setNum('maxDeliveryDistance', v)}
                      invalid={!!errors.maxDeliveryDistance}
                      suffix="km"
                    />
                  </Field>
                </div>
              </Section>

              {/* Live preview */}
              <section className="rounded-2xl border border-dashed border-tomato/30 bg-tomato/[0.03] p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-charcoal">
                  <Receipt className="h-4 w-4 text-tomato" />
                  Preview on a {sym}{sample} order
                </h3>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <PreviewItem label="Platform commission" value={`${sym}${commission.toFixed(2)}`} tone="tomato" />
                  <PreviewItem label="Restaurant receives" value={`${sym}${restaurantGets.toFixed(2)}`} />
                  <PreviewItem label="Customer delivery fee" value={`${sym}${fee}`} />
                </dl>
              </section>
            </>
          )}

          {tab === 'signup' && (
            <Section title="Signups" desc="Control who can register on the platform" icon={Shield}>
              <div className="space-y-3">
                <ToggleRow
                  icon={Store}
                  title="Restaurant signups"
                  desc="Allow new restaurants to register and submit documents for approval."
                  checked={settings.allowRestaurantSignup}
                  onChange={(v) => set('allowRestaurantSignup', v)}
                />
                <ToggleRow
                  icon={Bike}
                  title="Delivery partner signups"
                  desc="Allow new delivery partners to register and submit KYC for approval."
                  checked={settings.allowDeliverySignup}
                  onChange={(v) => set('allowDeliverySignup', v)}
                />
              </div>
              {(!settings.allowRestaurantSignup || !settings.allowDeliverySignup) && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  Signups are paused for{' '}
                  {!settings.allowRestaurantSignup && !settings.allowDeliverySignup
                    ? 'restaurants and delivery partners'
                    : !settings.allowRestaurantSignup
                      ? 'restaurants'
                      : 'delivery partners'}
                  . Existing accounts are not affected.
                </p>
              )}
            </Section>
          )}

          {tab === 'notifications' && (
            <Section title="Notifications" desc="Choose how the platform reaches users" icon={Bell}>
              <div className="space-y-3">
                <ToggleRow
                  icon={Smartphone}
                  title="Push notifications"
                  desc="Order updates and alerts sent to the mobile and web apps."
                  checked={settings.enablePushNotifications}
                  onChange={(v) => set('enablePushNotifications', v)}
                />
                <ToggleRow
                  icon={Mail}
                  title="Email notifications"
                  desc="Receipts, verification results and account emails."
                  checked={settings.enableEmailNotifications}
                  onChange={(v) => set('enableEmailNotifications', v)}
                />
                <ToggleRow
                  icon={MessageSquare}
                  title="SMS notifications"
                  desc="Text messages for OTPs and delivery updates. Carrier charges may apply."
                  checked={settings.enableSmsNotifications}
                  onChange={(v) => set('enableSmsNotifications', v)}
                />
              </div>
            </Section>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 transition-all duration-200 lg:pl-[18rem]',
          dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        )}
      >
        <div className="flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 rounded-2xl bg-charcoal px-5 py-3 text-cream shadow-2xl">
          <p className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            {errorCount > 0
              ? `${errorCount} field${errorCount !== 1 ? 's' : ''} need attention`
              : 'You have unsaved changes'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="px-3 text-sm font-semibold text-cream/80 hover:text-cream"
            >
              Discard
            </button>
            <AdminButton variant="primary" onClick={handleSave} disabled={errorCount > 0}>
              <Save className="h-4 w-4" />
              Save changes
            </AdminButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Building blocks
// ============================================

function Section({
  title,
  desc,
  icon: Icon,
  children,
}: {
  title: string
  desc: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-charcoal/10 bg-white p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-charcoal/5 pb-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-tomato/10 text-tomato">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">{title}</h2>
          <p className="text-xs text-warm-gray">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-charcoal">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-warm-gray">{hint}</p>
      ) : null}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  type = 'text',
  prefix,
  suffix,
  invalid,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  prefix?: React.ReactNode
  suffix?: string
  invalid?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-11 items-center overflow-hidden rounded-xl border bg-white transition-colors focus-within:border-tomato',
        invalid ? 'border-red-400' : 'border-charcoal/15'
      )}
    >
      {prefix && (
        <span className="grid h-full min-w-11 place-items-center border-r border-charcoal/10 bg-beige/50 px-3 text-sm font-semibold text-charcoal/60">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        min={type === 'number' ? 0 : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full min-w-0 bg-transparent px-3.5 text-sm text-charcoal outline-none"
      />
      {suffix && (
        <span className="grid h-full place-items-center border-l border-charcoal/10 bg-beige/50 px-3.5 text-sm font-semibold text-charcoal/60">
          {suffix}
        </span>
      )}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-charcoal/15 bg-white px-3.5 pr-10 text-sm text-charcoal outline-none transition-colors focus:border-tomato"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato/40',
        checked ? 'bg-green-500' : 'bg-charcoal/20'
      )}
    >
      <span
        className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}

function ToggleRow({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ElementType
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors',
        checked ? 'border-green-200 bg-green-50/40' : 'border-charcoal/10 bg-white'
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg',
            checked ? 'bg-green-100 text-green-700' : 'bg-beige/70 text-charcoal/50'
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-charcoal">{title}</p>
          <p className="mt-0.5 text-xs text-warm-gray">{desc}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={cn('hidden text-xs font-semibold sm:block', checked ? 'text-green-700' : 'text-warm-gray')}>
          {checked ? 'On' : 'Off'}
        </span>
        <Toggle checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  )
}

function PreviewItem({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'tomato'
}) {
  return (
    <div className="rounded-xl bg-white p-3.5">
      <dt className="text-xs text-warm-gray">{label}</dt>
      <dd className={cn('mt-1 font-display text-lg font-bold', tone === 'tomato' ? 'text-tomato' : 'text-charcoal')}>
        {value}
      </dd>
    </div>
  )
}
// src/apps/restaurant/pages/Settings.tsx
import { useEffect, useState } from 'react'
import { Save, Store, Clock, CreditCard, Loader2 } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/ui/Input'
import {
  useRestaurantProfile,
  useUpdateRestaurantSettings,
} from '@/api/restaurantHooks'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

interface SettingsForm {
  name: string
  description: string
  address: string
  image: string
  deliveryFee: number
  minOrderValue: number
  prepTimeMinutes: number
  isOpen: boolean
  isAcceptingOrders: boolean
  openingTime: string
  closingTime: string
}

const EMPTY_FORM: SettingsForm = {
  name: '',
  description: '',
  address: '',
  image: '',
  deliveryFee: 40,
  minOrderValue: 99,
  prepTimeMinutes: 20,
  isOpen: true,
  isAcceptingOrders: true,
  openingTime: '09:00',
  closingTime: '23:00',
}

export function RestaurantSettings() {
  const { data: profile, isLoading } = useRestaurantProfile()
  const updateMutation = useUpdateRestaurantSettings()
  const { showToast } = useToast()

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM)
  const [hasChanges, setHasChanges] = useState(false)

  // Load profile into form
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        description: profile.description || '',
        address: profile.address || '',
        image: profile.image || '',
        deliveryFee: profile.deliveryFee ?? 40,
        minOrderValue: profile.minOrderValue ?? 99,
        prepTimeMinutes: profile.prepTimeMinutes ?? 20,
        isOpen: profile.isOpen ?? true,
        isAcceptingOrders: profile.availability?.isAcceptingOrders ?? true,
        openingTime: profile.availability?.openingTime ?? '09:00',
        closingTime: profile.availability?.closingTime ?? '23:00',
      })
      setHasChanges(false)
    }
  }, [profile])

  const handleChange = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('error', 'Restaurant name is required')
      return
    }

    updateMutation.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        image: form.image.trim(),
        deliveryFee: form.deliveryFee,
        minOrderValue: form.minOrderValue,
        prepTimeMinutes: form.prepTimeMinutes,
        availability: {
          isAcceptingOrders: form.isAcceptingOrders,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
        },
      },
      {
        onSuccess: () => {
          showToast('success', 'Settings saved')
          setHasChanges(false)
        },
        onError: (err: any) => {
          showToast('error', err.message || 'Save failed')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-tomato" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Settings</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage your restaurant profile and services
          </p>
        </div>

        {hasChanges && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Restaurant Info */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Store className="h-5 w-5 text-tomato" />
            Restaurant Info
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Restaurant Name *
              </label>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Address
              </label>
              <Input
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Image URL
              </label>
              <Input
                value={form.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="aspect-video w-full rounded-xl object-cover"
                onError={(e) => {
                  ; (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Clock className="h-5 w-5 text-tomato" />
            Business Hours
          </h2>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                  Opening Time
                </label>
                <Input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => handleChange('openingTime', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                  Closing Time
                </label>
                <Input
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => handleChange('closingTime', e.target.value)}
                />
              </div>
            </div>

            <ToggleRow
              label="Restaurant Open"
              description="Visible to customers"
              value={form.isOpen}
              onChange={(v) => handleChange('isOpen', v)}
            />

            <ToggleRow
              label="Accepting Orders"
              description="Receive new orders"
              value={form.isAcceptingOrders}
              onChange={(v) => handleChange('isAcceptingOrders', v)}
            />
          </div>
        </Card>

        {/* Fees & Prep */}
        <Card className="col-span-full p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <CreditCard className="h-5 w-5 text-tomato" />
            Fees & Preparation
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Delivery Fee (₹)
              </label>
              <Input
                type="number"
                value={form.deliveryFee}
                onChange={(e) =>
                  handleChange('deliveryFee', parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Min Order Value (₹)
              </label>
              <Input
                type="number"
                value={form.minOrderValue}
                onChange={(e) =>
                  handleChange('minOrderValue', parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Prep Time (minutes)
              </label>
              <Input
                type="number"
                value={form.prepTimeMinutes}
                onChange={(e) =>
                  handleChange('prepTimeMinutes', parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {hasChanges && (
          <Button
            variant="ghost"
            onClick={() => {
              if (profile) {
                setForm({
                  name: profile.name,
                  description: profile.description || '',
                  address: profile.address || '',
                  image: profile.image || '',
                  deliveryFee: profile.deliveryFee ?? 40,
                  minOrderValue: profile.minOrderValue ?? 99,
                  prepTimeMinutes: profile.prepTimeMinutes ?? 20,
                  isOpen: profile.isOpen ?? true,
                  isAcceptingOrders:
                    profile.availability?.isAcceptingOrders ?? true,
                  openingTime: profile.availability?.openingTime ?? '09:00',
                  closingTime: profile.availability?.closingTime ?? '23:00',
                })
                setHasChanges(false)
              }
            }}
          >
            Discard
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          size="lg"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Toggle Row Component
// ============================================

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
      <div>
        <p className="text-sm font-medium text-charcoal">{label}</p>
        <p className="text-xs text-warm-gray">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          value ? 'bg-fresh-green' : 'bg-charcoal/20'
        )}
        aria-pressed={value}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
            value ? 'translate-x-5' : ''
          )}
        />
      </button>
    </div>
  )
}
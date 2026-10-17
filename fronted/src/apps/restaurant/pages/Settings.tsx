// src/apps/restaurant/pages/Settings.tsx
import { useEffect, useState, useRef } from 'react'
import { 
  Save, 
  Store, 
  Clock, 
  CreditCard, 
  Loader2, 
  Image as ImageIcon,
  Phone,
  Settings2,
  ShieldCheck,
  Percent,
  UploadCloud,
  Link as LinkIcon,
  X
} from 'lucide-react'
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
  
  contactPhone: string
  isPureVeg: boolean
  packagingCharge: number
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
  contactPhone: '',
  isPureVeg: false,
  packagingCharge: 0,
}

export function RestaurantSettings() {
  const { data: profile, isLoading } = useRestaurantProfile()
  const updateMutation = useUpdateRestaurantSettings()
  const { showToast } = useToast()

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM)
  const [hasChanges, setHasChanges] = useState(false)

  // 🔥 Image Upload State
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        contactPhone: (profile as any).contactPhone || '',
        isPureVeg: (profile as any).isPureVeg || false,
        packagingCharge: (profile as any).packagingCharge || 0,
      })
      
      // Set initial image mode based on existing image
      setImageMode(profile.image?.startsWith('data:image') ? 'upload' : 'url')
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

  // 🔥 File Upload Handler (Max 5MB for cover)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      handleChange('image', reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('error', 'Restaurant name is required')
      return
    }
    if (!form.contactPhone.trim()) {
      showToast('error', 'Contact phone is required')
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
        ...({ 
          contactPhone: form.contactPhone, 
          isPureVeg: form.isPureVeg, 
          packagingCharge: form.packagingCharge 
        } as any)
      },
      {
        onSuccess: () => {
          showToast('success', 'Settings saved successfully')
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-tomato" />
          <p className="text-sm font-medium text-warm-gray">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Settings</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Manage your restaurant profile, hours, and operations
          </p>
        </div>

        {hasChanges && (
          <span className="animate-pulse rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 shadow-sm ring-1 ring-yellow-200">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* 1. Restaurant Info */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-charcoal/10 pb-4">
            <Store className="h-5 w-5 text-tomato" />
            <h2 className="font-display text-lg font-bold text-charcoal">Restaurant Profile</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Restaurant Name <span className="text-tomato">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-beige/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Short Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Describe your cuisine, vibe, etc..."
                className="w-full rounded-xl border border-charcoal/15 bg-beige/30 px-4 py-3 text-sm outline-none focus:border-tomato focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Full Address
              </label>
              <Input
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="bg-beige/30 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray" />
                <Input
                  value={form.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-10 bg-beige/30 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Cover Image & Media (🔥 UPDATED) */}
        <Card className="p-6 flex flex-col">
          <div className="mb-5 flex items-center justify-between border-b border-charcoal/10 pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-tomato" />
              <h2 className="font-display text-lg font-bold text-charcoal">Cover Image</h2>
            </div>
            
            {/* 🔥 Image Mode Toggle */}
            <div className="flex rounded-full bg-beige/50 p-1 border border-charcoal/5">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  imageMode === 'url' ? 'bg-white text-tomato shadow-sm' : 'text-warm-gray hover:text-charcoal'
                )}
              >
                <LinkIcon className="h-3 w-3" /> URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                  imageMode === 'upload' ? 'bg-white text-tomato shadow-sm' : 'text-warm-gray hover:text-charcoal'
                )}
              >
                <UploadCloud className="h-3 w-3" /> Upload
              </button>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col">
            
            {/* URL Input (only in URL mode) */}
            {imageMode === 'url' && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                  Image URL
                </label>
                <Input
                  value={form.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-beige/30 focus:bg-white"
                />
              </div>
            )}

            {/* Upload Dropzone (only in Upload mode and no image selected) */}
            {imageMode === 'upload' && !form.image && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-1 min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-charcoal/15 bg-beige/20 transition-colors hover:border-tomato hover:bg-tomato/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">
                  <UploadCloud className="h-6 w-6 text-warm-gray" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-charcoal">Click to upload cover image</p>
                  <p className="text-xs text-warm-gray mt-1">JPG, PNG or WebP (max 5MB)</p>
                </div>
              </div>
            )}

            {/* Image Preview */}
            <div className={cn(
              "relative mt-2 flex-1 overflow-hidden rounded-2xl border border-charcoal/10 bg-beige/20",
              !form.image ? "hidden" : "min-h-[200px]"
            )}>
              {form.image && (
                <>
                  <img
                    src={form.image}
                    alt="Cover Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Invalid+Image+URL'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleChange('image', '')}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-charcoal/50 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {/* Change Image Button (Only in Upload mode) */}
                  {imageMode === 'upload' && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-charcoal shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                    >
                      Change Image
                    </button>
                  )}

                  <p className="absolute bottom-4 left-4 text-xs font-semibold text-white shadow-sm">
                    Live Preview
                  </p>
                </>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
          </div>
        </Card>

        {/* 3. Business Hours & Status */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-charcoal/10 pb-4">
            <Clock className="h-5 w-5 text-tomato" />
            <h2 className="font-display text-lg font-bold text-charcoal">Hours & Availability</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                  Opening Time
                </label>
                <Input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => handleChange('openingTime', e.target.value)}
                  className="bg-beige/30 focus:bg-white"
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
                  className="bg-beige/30 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
              <ToggleRow
                label="Restaurant Open"
                description="Show as 'Open' to customers"
                value={form.isOpen}
                onChange={(v) => handleChange('isOpen', v)}
              />
              <div className="h-px w-full bg-charcoal/5" />
              <ToggleRow
                label="Accepting Orders"
                description="Receive new order requests"
                value={form.isAcceptingOrders}
                onChange={(v) => handleChange('isAcceptingOrders', v)}
              />
            </div>
          </div>
        </Card>

        {/* 4. Operations & Preferences */}
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-charcoal/10 pb-4">
            <Settings2 className="h-5 w-5 text-tomato" />
            <h2 className="font-display text-lg font-bold text-charcoal">Operations</h2>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-3 rounded-2xl border border-charcoal/5 bg-beige/20 p-4">
              <ToggleRow
                label="Pure Veg Restaurant"
                description="Mark your entire menu as Vegetarian"
                value={form.isPureVeg}
                onChange={(v) => handleChange('isPureVeg', v)}
              />
              <div className="h-px w-full bg-charcoal/5" />
              <ToggleRow
                label="Auto-Accept Orders (Beta)"
                description="Automatically accept incoming orders"
                value={false}
                onChange={() => showToast('info', 'Auto-accept coming soon!')}
              />
            </div>
            
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-charcoal">
                <Percent className="h-4 w-4 text-warm-gray" />
                Packaging Charge (₹)
              </label>
              <Input
                type="number"
                value={form.packagingCharge}
                onChange={(e) => handleChange('packagingCharge', parseInt(e.target.value) || 0)}
                className="bg-beige/30 focus:bg-white"
              />
              <p className="mt-1.5 text-xs text-warm-gray">Extra charge added to each order</p>
            </div>
          </div>
        </Card>

        {/* 5. Fees & Prep Time */}
        <Card className="col-span-full p-6">
          <div className="mb-5 flex items-center gap-2 border-b border-charcoal/10 pb-4">
            <CreditCard className="h-5 w-5 text-tomato" />
            <h2 className="font-display text-lg font-bold text-charcoal">Fees & Preparation</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                className="bg-beige/30 focus:bg-white"
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
                className="bg-beige/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">
                Avg Prep Time (mins)
              </label>
              <Input
                type="number"
                value={form.prepTimeMinutes}
                onChange={(e) =>
                  handleChange('prepTimeMinutes', parseInt(e.target.value) || 0)
                }
                className="bg-beige/30 focus:bg-white"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 🔥 Sticky Save Button Bar */}
      <div className={cn(
        "fixed bottom-0 left-64 right-0 z-40 border-t border-charcoal/10 bg-white/90 p-4 backdrop-blur-md transition-transform duration-300",
        hasChanges ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
            <ShieldCheck className="h-5 w-5 text-fresh-green" />
            Make sure to save your changes
          </div>
          <div className="flex gap-3">
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
                    isAcceptingOrders: profile.availability?.isAcceptingOrders ?? true,
                    openingTime: profile.availability?.openingTime ?? '09:00',
                    closingTime: profile.availability?.closingTime ?? '23:00',
                    contactPhone: (profile as any).contactPhone || '',
                    isPureVeg: (profile as any).isPureVeg || false,
                    packagingCharge: (profile as any).packagingCharge || 0,
                  })
                  setHasChanges(false)
                }
              }}
              className="bg-white hover:bg-charcoal/5"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="min-w-[140px]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
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
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <p className="text-sm font-bold text-charcoal">{label}</p>
        <p className="text-xs text-warm-gray mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-tomato/20 focus:ring-offset-2',
          value ? 'bg-fresh-green' : 'bg-charcoal/20'
        )}
        aria-pressed={value}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
            value ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
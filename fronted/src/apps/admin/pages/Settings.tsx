import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/ui/Input'
import { Save, Shield, CreditCard, Bell, Globe, Mail } from 'lucide-react'

export function AdminSettings() {
  const [settings, setSettings] = useState({
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
  })

  const handleChange = (key: string, value: string | number | boolean) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = () => {
    // Save settings to backend/localStorage
    localStorage.setItem('sanfoody:adminSettings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal">Settings</h1>
      <p className="mt-1 text-sm text-warm-gray">Platform configuration</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Globe className="h-5 w-5 text-tomato" />
            General
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Platform Name</label>
              <Input value={settings.platformName} onChange={(e) => handleChange('platformName', e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Support Email</label>
              <Input type="email" value={settings.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm outline-none focus:border-tomato"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Business Settings */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <CreditCard className="h-5 w-5 text-tomato" />
            Business
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Commission Rate (%)</label>
              <Input type="number" value={settings.commissionRate} onChange={(e) => handleChange('commissionRate', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Delivery Fee (₹)</label>
              <Input type="number" value={settings.deliveryFee} onChange={(e) => handleChange('deliveryFee', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Minimum Order Value (₹)</label>
              <Input type="number" value={settings.minOrderValue} onChange={(e) => handleChange('minOrderValue', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Max Delivery Distance (km)</label>
              <Input type="number" value={settings.maxDeliveryDistance} onChange={(e) => handleChange('maxDeliveryDistance', parseInt(e.target.value))} />
            </div>
          </div>
        </Card>

        {/* Signup Settings */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Shield className="h-5 w-5 text-tomato" />
            Signup Settings
          </h2>
          <div className="mt-4 space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
              <span className="text-sm font-medium text-charcoal">Allow Restaurant Signups</span>
              <button
                type="button"
                onClick={() => handleChange('allowRestaurantSignup', !settings.allowRestaurantSignup)}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.allowRestaurantSignup ? 'bg-fresh-green' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.allowRestaurantSignup ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
              <span className="text-sm font-medium text-charcoal">Allow Delivery Partner Signups</span>
              <button
                type="button"
                onClick={() => handleChange('allowDeliverySignup', !settings.allowDeliverySignup)}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.allowDeliverySignup ? 'bg-fresh-green' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.allowDeliverySignup ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-charcoal">
            <Bell className="h-5 w-5 text-tomato" />
            Notifications
          </h2>
          <div className="mt-4 space-y-4">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
              <span className="text-sm font-medium text-charcoal">Push Notifications</span>
              <button
                type="button"
                onClick={() => handleChange('enablePushNotifications', !settings.enablePushNotifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.enablePushNotifications ? 'bg-fresh-green' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.enablePushNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
              <span className="text-sm font-medium text-charcoal">Email Notifications</span>
              <button
                type="button"
                onClick={() => handleChange('enableEmailNotifications', !settings.enableEmailNotifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.enableEmailNotifications ? 'bg-fresh-green' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.enableEmailNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-charcoal/10 p-4">
              <span className="text-sm font-medium text-charcoal">SMS Notifications</span>
              <button
                type="button"
                onClick={() => handleChange('enableSmsNotifications', !settings.enableSmsNotifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.enableSmsNotifications ? 'bg-fresh-green' : 'bg-charcoal/20'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings.enableSmsNotifications ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
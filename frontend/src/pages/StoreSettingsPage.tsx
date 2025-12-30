import React, { useEffect, useState } from 'react'
import { Save, Mail, Phone, MapPin, Globe } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type StoreSettings = {
  storeName: string
  email: string
  phone: string
  address: string
  website: string
  description: string
}

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/store/settings`)
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (e) {
      console.error('Error fetching settings:', e)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/store/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        setMessage('✓ Store settings saved!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('✗ Error saving settings')
      }
    } catch (e) {
      setMessage('✗ Error saving settings')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Store Settings</h1>
        <p className="text-slate-300">Manage your store information and contact details</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={saveSettings} className="card space-y-6">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Store Name *</label>
          <input
            required
            type="text"
            value={settings.storeName}
            onChange={e => setSettings({ ...settings, storeName: e.target.value })}
            placeholder="e.g., Coffee Bliss"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">Description</label>
          <textarea
            value={settings.description}
            onChange={e => setSettings({ ...settings, description: e.target.value })}
            placeholder="Tell us about your store..."
            rows={3}
            className="input-field"
          />
        </div>

        {/* Contact Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="hello@yourstore.com"
                className="input-field"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} /> Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="input-field"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} /> Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Main St, City, State ZIP"
                className="input-field"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Globe size={16} /> Website
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={e => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://yourstore.com"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="border-t pt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 flex-1"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

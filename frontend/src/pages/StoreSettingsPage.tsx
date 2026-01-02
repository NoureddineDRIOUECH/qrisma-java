import React, { useEffect, useState } from 'react'
import { Save, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

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
  const { darkMode } = useDarkMode()
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

  // Debug current session
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    const tokenPreview = token ? `${token.slice(0, 10)}...` : null
    console.log('[StoreSettingsPage] Session:', { userId, role, token: tokenPreview })
  }, [])

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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="mb-7 text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>Store Settings</h1>
        <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Manage your store information and contact details</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <form onSubmit={saveSettings} className={`card relative overflow-hidden space-y-6 border ${
        darkMode
          ? 'border-purple-700/50 bg-slate-900/30'
          : 'border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-[0_20px_70px_-40px_rgba(14,165,233,0.45)]'
      }`}>
        <div className={`absolute inset-0 pointer-events-none opacity-70 ${darkMode ? 'hidden' : ''}`} style={{
          background: 'radial-gradient(circle at 15% 20%, rgba(59,130,246,0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(14,165,233,0.12), transparent 30%), radial-gradient(circle at 45% 90%, rgba(99,102,241,0.10), transparent 38%)'
        }}></div>
        {/* Store Name */}
        <div>
          <label className={`block text-sm font-semibold mb-3 ${
            darkMode ? 'text-slate-300' : 'text-slate-900'
          }`}>Store Name *</label>
          <input
            required
            type="text"
            value={settings.storeName}
            onChange={e => setSettings({ ...settings, storeName: e.target.value })}
            placeholder="e.g., Coffee Bliss"
            className={`input-field ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
        </div>

        {/* Description */}
        <div>
          <label className={`block text-sm font-semibold mb-3 ${
            darkMode ? 'text-slate-300' : 'text-slate-900'
          }`}>Description</label>
          <textarea
            value={settings.description}
            onChange={e => setSettings({ ...settings, description: e.target.value })}
            placeholder="Tell us about your store..."
            rows={3}
            className={`input-field ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
        </div>

        {/* Contact Information */}
        <div className={`border-t pt-6 ${darkMode ? 'border-purple-700/30' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>Contact Information</h3>
          
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="hello@yourstore.com"
                className={`input-field ${
                  darkMode
                    ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                    : ''
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Phone size={16} /> Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className={`input-field ${
                  darkMode
                    ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                    : ''
                }`}
              />
            </div>

            {/* Address */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <MapPin size={16} /> Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="123 Main St, City, State ZIP"
                className={`input-field ${
                  darkMode
                    ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                    : ''
                }`}
              />
            </div>

            {/* Website */}
            <div>
              <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Globe size={16} /> Website
              </label>
              <input
                type="url"
                value={settings.website}
                onChange={e => setSettings({ ...settings, website: e.target.value })}
                placeholder="https://yourstore.com"
                className={`input-field ${
                  darkMode
                    ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                    : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className={`border-t pt-6 flex gap-3 ${darkMode ? 'border-purple-700/30' : ''}`}>
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

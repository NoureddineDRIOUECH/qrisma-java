import React, { useEffect, useState } from 'react'
import { Contact2, Mail, Phone, MapPin, RefreshCw, Copy, Check } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type Customer = {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
  balance?: number
}

export default function CustomersPage() {
  const { darkMode } = useDarkMode()
  const [items, setItems] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/scan/customers`)
      if (!res.ok) {
        throw new Error('Failed to load customers')
      }
      const data = await res.json()
      setItems(data || [])
    } catch (e: any) {
      setError(e?.message || 'Error loading customers')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Customers</h1>
          <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>View enrolled customers and their balances</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            darkMode
              ? 'bg-purple-700 text-white hover:bg-purple-600 disabled:bg-purple-900/50'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-200'
          }`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className={`p-3 rounded-lg border text-sm font-semibold ${
          darkMode ? 'bg-red-900/40 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {error}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <div className={`p-8 rounded-2xl border-2 text-center ${
          darkMode ? 'border-purple-700/50 bg-slate-900/30 text-slate-300' : 'border-slate-100 bg-slate-50 text-slate-600'
        }`}>
          No customers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(c => (
            <div
              key={c.id}
              className={`rounded-2xl p-4 border shadow-sm ${
                darkMode ? 'border-purple-700/40 bg-slate-900/40' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-800 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Contact2 size={18} />
                  </div>
                  <div>
                    <div className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {c.firstName || 'Customer'} {c.lastName || ''}
                    </div>
                    {c.balance !== undefined && (
                      <div className={darkMode ? 'text-purple-200 text-sm' : 'text-indigo-600 text-sm'}>
                        Balance: {c.balance} pts
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(c.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedId === c.id
                      ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Copy customer ID"
                >
                  {copiedId === c.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              {c.email && (
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Mail size={14} /> {c.email}
                </div>
              )}
              {c.phone && (
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <Phone size={14} /> {c.phone}
                </div>
              )}
              {c.address && (
                <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <MapPin size={14} /> {c.address}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

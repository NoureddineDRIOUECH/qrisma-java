import React, { useState } from 'react'
import { Scan, User, Gift, Plus, Minus, Search, CheckCircle, XCircle, Award, Zap, TrendingUp } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function EmployeePage() {
  const [passObjectId, setPassObjectId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [points, setPoints] = useState(1)
  const [redeemPoints, setRedeemPoints] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function lookup() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/api/scan/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passObjectId })
      })
      const json = await res.json()
      if (res.ok && json.customerId) {
        setResult(json)
        setMessage({ type: 'success', text: 'Customer found!' })
      } else {
        setMessage({ type: 'error', text: json.error || 'Customer not found' })
        setResult(null)
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Connection error' })
      setResult(null)
    }
    setLoading(false)
  }

  async function addPoints() {
    if (!result?.customerId) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/api/scan/${result.customerId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ADD_POINTS', points, employeeId: null })
      })
      const json = await res.json()
      if (res.ok) {
        setResult(prev => ({ ...prev, balance: json.newBalance }))
        setMessage({ type: 'success', text: `+${points} points added!` })
        setPoints(1)
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to add points' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Connection error' })
    }
    setLoading(false)
  }

  async function redeem() {
    if (!result?.customerId) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${API_BASE}/api/scan/${result.customerId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'REDEEM', points: redeemPoints, employeeId: null })
      })
      const json = await res.json()
      if (res.ok) {
        setResult(prev => ({ ...prev, balance: json.newBalance }))
        setMessage({ type: 'success', text: `${redeemPoints} points redeemed!` })
        setRedeemPoints(1)
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to redeem points' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Connection error' })
    }
    setLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && passObjectId) {
      lookup()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <Scan size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
            Point of Sale
          </h1>
          <p className="text-xl text-purple-200">Scan customer cards & manage rewards</p>
        </div>

        {/* Scan Input Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Scan size={18} className="text-indigo-600" />
            Customer Card ID
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={passObjectId}
                onChange={e => setPassObjectId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scan QR code or enter card ID..."
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-lg"
                autoFocus
              />
            </div>
            <button
              onClick={lookup}
              disabled={loading || !passObjectId}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Lookup
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up ${
            message.type === 'success' 
              ? 'bg-emerald-100 border-2 border-emerald-300 text-emerald-800' 
              : 'bg-red-100 border-2 border-red-300 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span className="font-semibold text-lg">{message.text}</span>
          </div>
        )}

        {/* Customer Info & Actions */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* Customer Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{result.firstName || 'Customer'} {result.lastName || ''}</h2>
                      <p className="text-purple-200">{result.email || ''}</p>
                    </div>
                  </div>
                  <Award size={40} className="text-white/40" />
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-purple-100">Current Balance</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{result.balance || 0}</span>
                      <span className="text-2xl text-purple-200">pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Points Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Plus size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Add Points</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Points Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={points}
                      onChange={e => setPoints(parseInt(e.target.value || '1'))}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-lg font-semibold"
                    />
                  </div>
                  
                  {/* Quick Add Buttons */}
                  <div className="flex gap-2">
                    {[1, 5, 10, 20].map(val => (
                      <button
                        key={val}
                        onClick={() => setPoints(val)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-emerald-100 border-2 border-slate-200 hover:border-emerald-400 rounded-lg font-semibold text-slate-700 transition-all"
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={addPoints}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <TrendingUp size={20} />
                    Add {points} Points
                  </button>
                </div>
              </div>

              {/* Redeem Points Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center">
                    <Gift size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Redeem</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Points to Redeem</label>
                    <input
                      type="number"
                      min="1"
                      max={result.balance || 0}
                      value={redeemPoints}
                      onChange={e => setRedeemPoints(parseInt(e.target.value || '1'))}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-lg font-semibold"
                    />
                  </div>
                  
                  {/* Quick Redeem Buttons */}
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map(val => (
                      <button
                        key={val}
                        onClick={() => setRedeemPoints(Math.min(val, result.balance || 0))}
                        disabled={val > (result.balance || 0)}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-orange-100 border-2 border-slate-200 hover:border-orange-400 rounded-lg font-semibold text-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={redeem}
                    disabled={loading || redeemPoints > (result.balance || 0)}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Minus size={20} />
                    Redeem {redeemPoints} Points
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !message && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border border-white/20">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={48} className="text-slate-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">Ready to Scan</h3>
            <p className="text-slate-500 text-lg">Enter or scan a customer card ID to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
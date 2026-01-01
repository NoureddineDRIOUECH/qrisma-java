import React, { useState } from 'react'
import { User, Mail, Phone, CreditCard, CheckCircle, Wallet, Award, Sparkles } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function EnrollPage() {
  const urlParams = new URLSearchParams(window.location.search)
  const programId = urlParams.get('programId') || ''

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saveJwt, setSaveJwt] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!programId) {
      setMessage('Program ID is required')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/programs/${programId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone })
      })
      const json = await res.json()
      if (res.ok) {
        setSaveJwt(json.saveJwt)
        setMessage('success')
      } else {
        setMessage(json.error || 'Enrollment failed')
      }
    } catch (e) {
      setMessage('Connection error')
    }
    setLoading(false)
  }

  function openWallet() {
    if (!saveJwt) return
    const url = `https://pay.google.com/gp/v/save/${saveJwt}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {!saveJwt ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20 animate-slide-up">
            {/* Header */}
            <div className="text-center space-y-3">
              <img src="/images/Logoqrisma.png" alt="QRisma" className="h-20 w-auto mx-auto object-contain mb-4" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Join Our Rewards
              </h1>
              <p className="text-slate-600">Sign up and start earning rewards today!</p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Error Message */}
              {message && message !== 'success' && (
                <div className="p-4 bg-red-100 border-2 border-red-300 text-red-800 rounded-xl text-sm font-medium">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Enroll & Add to Wallet
                  </>
                )}
              </button>
            </form>

            {/* Benefits */}
            <div className="pt-4 border-t-2 border-slate-200 space-y-3">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                What you'll get:
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  Earn points on every purchase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  Access to exclusive rewards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                  Digital loyalty card in Google Wallet
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-white/20 animate-slide-up">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle size={40} className="text-white" />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Welcome Aboard!</h2>
              <p className="text-lg text-slate-600">You're now enrolled in our loyalty program</p>
            </div>

            {/* Customer Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 text-left border-2 border-indigo-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">Your Details:</p>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Name:</strong> {firstName} {lastName}</p>
                {email && <p><strong>Email:</strong> {email}</p>}
                {phone && <p><strong>Phone:</strong> {phone}</p>}
              </div>
            </div>

            {/* Add to Wallet Button */}
            <button
              onClick={openWallet}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              <Wallet size={24} />
              Add to Google Wallet
            </button>

            <p className="text-sm text-slate-500">
              Your digital loyalty card will be added to your Google Wallet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
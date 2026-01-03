import React, { useState } from 'react'
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CheckCircleIcon,
  WalletIcon,
  TrophyIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid'

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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-64 w-64 bg-indigo-600/30 blur-3xl rounded-full animate-blob"></div>
        <div className="absolute top-10 right-10 h-72 w-72 bg-purple-500/25 blur-3xl rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/3 h-60 w-60 bg-pink-500/20 blur-3xl rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6 text-indigo-100">
          <img src="/images/logoqr.png" alt="QRisma" className="h-12 w-auto" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-200/80">Loyalty enrollment</p>
            <h1 className="text-2xl font-bold">Add your card & start earning</h1>
          </div>
          <span className="ml-auto text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/15">
            Program ID: {programId || '—'}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Left column: story and perks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <TrophyIcon className="w-6 h-6 text-amber-300" />
                <div>
                  <p className="text-sm text-indigo-100/80">Member perks</p>
                  <p className="text-xl font-semibold">Rewards that feel premium</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-indigo-50/90">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" /> Earn points with every purchase
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" /> Unlock exclusive rewards & tiers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" /> Keep your card in Google Wallet
                </li>
              </ul>
              <div className="mt-5 flex items-center gap-3 text-xs text-indigo-100/70">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Secure</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">1 min signup</span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Free forever</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 text-indigo-50 shadow-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-200/80 mb-2">How it works</p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600/60 flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold">Fill your details</p>
                    <p className="text-indigo-100/80">We create your loyalty profile instantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-600/60 flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold">Add to Wallet</p>
                    <p className="text-indigo-100/80">Tap the button to save your pass to Google Wallet.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-pink-600/60 flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold">Earn & redeem</p>
                    <p className="text-indigo-100/80">Scan your card in-store to collect and spend points.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: form / success */}
          <div className="lg:col-span-3">
            {!saveJwt ? (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/30 animate-slide-up">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Step 1 of 2</p>
                    <h2 className="text-3xl font-bold text-slate-900">Enroll in seconds</h2>
                    <p className="text-slate-600">Tell us how to reach you and we will mint your pass.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                    <SparklesIcon className="w-4 h-4 text-purple-600" /> Instant issuance
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                      <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
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
                          <UserIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
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
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <div className="relative">
                        <EnvelopeIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
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
                        <PhoneIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {message && message !== 'success' && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-start gap-2">
                      <div className="mt-0.5">⚠️</div>
                      <div>{message}</div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <CreditCardIcon className="w-5 h-5" />
                        Enroll & Add to Wallet
                      </>
                    )}
                  </button>
                </form>

                {/* Benefits */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                    What you'll get
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      10 pts per visit (example), bonus tiers unlocked fast
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      Instant digital card, no plastic needed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      Exclusive offers for members-only drops
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/30 animate-slide-up">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircleIcon className="w-10 h-10 text-white" />
                </div>

                {/* Success Message */}
                <div className="space-y-2 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-500">Step 2 of 2</p>
                  <h2 className="text-3xl font-bold text-slate-900">Card ready to save</h2>
                  <p className="text-lg text-slate-600">Add it to Google Wallet and start earning now.</p>
                </div>

                {/* Card preview */}
                <div className="bg-gradient-to-br from-sky-100 via-white to-emerald-100 rounded-3xl text-slate-900 p-5 shadow-xl border border-slate-200 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 h-20 w-20 bg-white/60 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">QRisma Rewards</p>
                      <p className="text-xl font-semibold">Member Card</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-xs text-slate-700">Active</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-600" /> {firstName || 'Your'} {lastName || 'Name'}
                    </p>
                    {email && (
                      <p className="flex items-center gap-2 text-slate-600">
                        <EnvelopeIcon className="w-4 h-4" /> {email}
                      </p>
                    )}
                    {phone && (
                      <p className="flex items-center gap-2 text-slate-600">
                        <PhoneIcon className="w-4 h-4" /> {phone}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-700">
                    <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Points ready</span>
                    <span className="px-3 py-1 rounded-full bg-white/80 border border-slate-200">Wallet compatible</span>
                  </div>
                </div>

                {/* Add to Wallet Button */}
                <button
                  onClick={openWallet}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <WalletIcon className="w-6 h-6" />
                  Add to Google Wallet
                </button>

                <p className="text-sm text-slate-500 text-center">
                  Your digital loyalty card will be added to your Google Wallet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
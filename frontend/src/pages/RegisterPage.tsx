import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Store, Phone, Globe, MapPin, Award, CheckCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: account, 2: store onboarding
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [store, setStore] = useState({
    storeName: '',
    address: '',
    phone: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (step === 1) {
      // Validate passwords
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      // Move to step 2
      setError('')
      setStep(2)
      return
    }

    // Step 2: Create account + store
    setLoading(true)
    setError('')
    try {
      // Register owner
      const registerRes = await fetch(`${API_BASE}/api/auth/signup-owner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName
        })
      })

      if (!registerRes.ok) {
        const data = await registerRes.json()
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Save store settings
      await fetch(`${API_BASE}/api/store/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 1,
          ...store,
          description: '',
          email: form.email
        })
      })

      // Auto-login
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      })

      const loginData = await loginRes.json()
      if (loginRes.ok) {
        localStorage.setItem('token', loginData.token || 'auth-token')
        localStorage.setItem('userId', loginData.userId)
        localStorage.setItem('role', loginData.role)
        navigate('/owner/dashboard')
      }
    } catch (e) {
      setError('Connection error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding & Steps */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Award size={32} className="text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent">
                QRisma
              </h1>
            </div>
            <p className="text-2xl font-semibold text-purple-100">Start Building Loyalty Today</p>
          </div>

          <div className="space-y-4">
            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step >= 1 ? 'bg-white/10 backdrop-blur-lg border-white/20' : 'bg-white/5 border-white/10'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step >= 1 ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-slate-600'}`}>
                {step > 1 ? <CheckCircle size={20} className="text-white" /> : <User size={20} className="text-white" />}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Create Account</h3>
                <p className="text-purple-200/70">Set up your account credentials</p>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step >= 2 ? 'bg-white/10 backdrop-blur-lg border-white/20' : 'bg-white/5 border-white/10'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step >= 2 ? 'bg-gradient-to-br from-indigo-400 to-purple-500' : 'bg-slate-600'}`}>
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Store Details</h3>
                <p className="text-purple-200/70">Tell us about your business</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 border border-white/20">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              QRisma
            </h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? 'Create Your Account' : 'Set Up Your Store'}
            </h2>
            <p className="text-slate-600">
              {step === 1 ? 'Start your loyalty program journey' : 'Just a few more details'}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full transition-all ${step >= 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-200'}`}></div>
            <div className={`flex-1 h-2 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-200'}`}></div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="hello@yourstore.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Store Name *</label>
                  <div className="relative">
                    <Store size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={store.storeName}
                      onChange={e => setStore({ ...store, storeName: e.target.value })}
                      placeholder="Coffee Bliss"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={store.address}
                      onChange={e => setStore({ ...store, address: e.target.value })}
                      placeholder="123 Main St, City"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={store.phone}
                      onChange={e => setStore({ ...store, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                  <div className="relative">
                    <Globe size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={store.website}
                      onChange={e => setStore({ ...store, website: e.target.value })}
                      placeholder="https://yourstore.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <ArrowRight size={20} /> {step === 1 ? 'Continue' : 'Complete Registration'}
                </>
              )}
            </button>

            {/* Back button for step 2 */}
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Back
              </button>
            )}
          </form>

          {/* Login Link (step 1 only) */}
          {step === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">Already have an account?</span>
                </div>
              </div>

              <Link
                to="/login"
                className="block w-full text-center py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

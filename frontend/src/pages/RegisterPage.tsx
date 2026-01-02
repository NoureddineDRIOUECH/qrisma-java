import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Store, Phone, Globe, MapPin, Award, CheckCircle, X, Eye, EyeOff } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
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
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [storeNameError, setStoreNameError] = useState('')

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email is required')
      return false
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password')
      return false
    } else if (confirmPassword !== form.password) {
      setConfirmPasswordError('Passwords do not match')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  // First name validation
  const validateFirstName = (name: string) => {
    if (!name.trim()) {
      setFirstNameError('First name is required')
      return false
    }
    setFirstNameError('')
    return true
  }

  // Store name validation
  const validateStoreName = (name: string) => {
    if (!name.trim()) {
      setStoreNameError('Store name is required')
      return false
    }
    setStoreNameError('')
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm({ ...form, email: value })
    if (value) validateEmail(value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm({ ...form, password: value })
    if (value) validatePassword(value)
    // Also validate confirm password if it exists
    if (form.confirmPassword) validateConfirmPassword(form.confirmPassword)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm({ ...form, confirmPassword: value })
    if (value) validateConfirmPassword(value)
  }

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm({ ...form, firstName: value })
    if (value) validateFirstName(value)
  }

  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStore({ ...store, storeName: value })
    if (value) validateStoreName(value)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    if (step === 1) {
      // Validate all fields
      const firstNameValid = validateFirstName(form.firstName)
      const emailValid = validateEmail(form.email)
      const passwordValid = validatePassword(form.password)
      const confirmPasswordValid = validateConfirmPassword(form.confirmPassword)
      
      if (!firstNameValid || !emailValid || !passwordValid || !confirmPasswordValid) return
      
      // Move to step 2
      setError('')
      setSuccess('')
      setStep(2)
      return
    }

    // Step 2: Validate store name
    const storeNameValid = validateStoreName(store.storeName)
    if (!storeNameValid) return

    // Create account + store
    setLoading(true)
    setError('')
    setSuccess('')
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
        if (data.error === 'Email already exists') {
          setError('This email is already registered')
        } else if (data.error?.includes('email')) {
          setError('Invalid email address')
        } else {
          setError(data.error || 'Registration failed')
        }
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
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => navigate('/owner/dashboard'), 1500)
      }
    } catch (e) {
      setError('Connection error. Please check your internet and try again')
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
              {/* Icon removed */}
              <img src="/images/logoqr.png" alt="QRisma" className="h-22 w-auto object-contain -ml-20" />
            </div>
            <p className="text-2xl font-semibold text-purple-100">Start Building Loyalty Today</p>
          </div>

          <div className="space-y-4">
            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step >= 1 ? 'bg-white/10 backdrop-blur-lg border-white/20' : 'bg-white/5 border-white/10'}`}>
              {step > 1 ? <CheckCircle size={24} className="text-white flex-shrink-0 mt-1" /> : <User size={24} className="text-white flex-shrink-0 mt-1" />}
              <div>
                <h3 className="font-semibold text-lg text-white">Create Account</h3>
                <p className="text-purple-200/70">Set up your account credentials</p>
              </div>
            </div>

            <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step >= 2 ? 'bg-white/10 backdrop-blur-lg border-white/20' : 'bg-white/5 border-white/10'}`}>
              <Store size={24} className="text-white flex-shrink-0 mt-1" />
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
            <img src="/images/logoqr.png" alt="QRisma" className="h-12 w-auto mx-auto object-contain" />
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

          {/* Success Toast */}
          {success && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {step === 1 ? (
              <>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">First Name *</label>
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={handleFirstNameChange}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="John"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        firstNameError 
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : focusedField === 'firstName'
                          ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {firstNameError && (
                    <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                      <X size={14} /> {firstNameError}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <div className="relative">
                    <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="Doe"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        focusedField === 'lastName'
                        ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                        : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleEmailChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="hello@yourstore.com"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        emailError 
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : focusedField === 'email'
                          ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                      <X size={14} /> {emailError}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Password *</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handlePasswordChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        passwordError 
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : focusedField === 'password'
                          ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                      <X size={14} /> {passwordError}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        confirmPasswordError 
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : focusedField === 'confirmPassword'
                          ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                      <X size={14} /> {confirmPasswordError}
                    </p>
                  )}
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
                      value={store.storeName}
                      onChange={handleStoreNameChange}
                      onFocus={() => setFocusedField('storeName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="Coffee Bliss"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        storeNameError 
                          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : focusedField === 'storeName'
                          ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                          : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {storeNameError && (
                    <p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
                      <X size={14} /> {storeNameError}
                    </p>
                  )}
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
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="123 Main St, City"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        focusedField === 'address'
                        ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                        : 'border-slate-200 focus:border-indigo-500'
                      }`}
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
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        focusedField === 'phone'
                        ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                        : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                  <div className="relative">
                    <Globe size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={store.website}
                      onChange={e => setStore({ ...store, website: e.target.value })}
                      onFocus={() => setFocusedField('website')}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      placeholder="www.yourstore.com"
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed ${
                        focusedField === 'website'
                        ? 'border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                        : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top">
                <X size={18} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (step === 1 && (!!emailError || !!passwordError || !!confirmPasswordError || !!firstNameError)) || (step === 2 && !!storeNameError)}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {step === 1 ? 'Validating...' : 'Creating Account...'}
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
                disabled={loading}
                className="w-full py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

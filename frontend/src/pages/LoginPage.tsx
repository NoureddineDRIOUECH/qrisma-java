import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, Rocket, Wallet, Award, Eye, EyeOff, CheckCircle, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Validation states
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

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
    }
    setPasswordError('')
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
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate before submit
    const emailValid = validateEmail(form.email)
    const passwordValid = validatePassword(form.password)
    
    if (!emailValid || !passwordValid) return

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        // Save token and user info
        localStorage.setItem('token', data.token || 'auth-token')
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('role', data.role)
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => navigate('/owner/dashboard'), 1500)
      } else {
        // Better error messages
        if (data.error === 'User not found') {
          setError('No account found with this email address')
        } else if (data.error === 'Invalid password') {
          setError('Incorrect password. Please try again')
        } else if (data.error === 'Invalid credentials') {
          setError('Invalid email or password')
        } else {
          setError(data.error || 'Login failed. Please try again')
        }
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
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logoqr.png" alt="QRisma" className="h-22 w-auto object-contain -ml-20" />
            </div>
            <p className="text-2xl font-semibold text-purple-100">Loyalty Programs, Simplified</p>
            <p className="text-lg text-purple-200/80">Build customer loyalty with beautiful digital cards powered by Google Wallet</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <Rocket size={24} className="text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-white">Easy Setup</h3>
                <p className="text-purple-200/70">Create loyalty programs in minutes with our intuitive interface</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <Wallet size={24} className="text-white flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-white">Google Wallet</h3>
                <p className="text-purple-200/70">Customers add cards directly to their mobile wallets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 border border-white/20">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <img src="/images/logoqr.png" alt="QRisma" className="h-12 w-auto mx-auto object-contain" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          {/* Success Toast */}
          {success && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
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
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Password</label>
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
              disabled={loading || !!emailError || !!passwordError}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">New to QRisma?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full text-center py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  )
}

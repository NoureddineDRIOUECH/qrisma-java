import React, { useEffect, useState } from 'react'
import { User, Lock, Phone, Mail, Check } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function PasswordUpdateForm() {
  const { darkMode } = useDarkMode()
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('✗ Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('✗ Password must be at least 6 characters')
      return
    }
    
    setPasswordLoading(true)
    setPasswordMessage('')
    try {
      const userId = localStorage.getItem('userId')
      const res = await fetch(`${API_BASE}/api/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      if (res.ok) {
        setPasswordMessage('✓ Password updated successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setPasswordMessage(''), 3000)
      } else {
        const data = await res.json()
        setPasswordMessage('✗ ' + (data.error || 'Failed to update password'))
      }
    } catch (e) {
      setPasswordMessage('✗ Error updating password')
    }
    setPasswordLoading(false)
  }

  return (
    <form onSubmit={updatePassword} className="space-y-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>Current Password</label>
        <input
          type="password"
          required
          value={passwordForm.currentPassword}
          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          className={`input-field w-full ${
            darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
          }`}
          placeholder="••••••••"
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>New Password</label>
        <input
          type="password"
          required
          value={passwordForm.newPassword}
          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          className={`input-field w-full ${
            darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
          }`}
          placeholder="••••••••"
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          darkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>Confirm New Password</label>
        <input
          type="password"
          required
          value={passwordForm.confirmPassword}
          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          className={`input-field w-full ${
            darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
          }`}
          placeholder="••••••••"
        />
      </div>

      {passwordMessage && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          passwordMessage.includes('✓') 
            ? darkMode ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800' 
            : darkMode ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
        }`}>
          {passwordMessage.includes('✓') && <Check size={18} />}
          {passwordMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={passwordLoading}
        className="btn-primary w-full md:w-auto"
      >
        {passwordLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}

export default function ProfilePage() {
  const { darkMode } = useDarkMode()
  const [form, setForm] = useState<any>({ email:'', firstName:'', lastName:'', phone:'' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Debug current session
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    const tokenPreview = token ? `${token.slice(0, 10)}...` : null
    console.log('[ProfilePage] Session:', { userId, role, token: tokenPreview })
  }, [])

  useEffect(()=>{ 
    fetch(`${API_BASE}/api/profile`).then(r=>r.json()).then(setForm) 
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/profile`, { 
        method: 'PUT', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify(form) 
      })
      if (res.ok) {
        setMessage('✓ Profile updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (e) {
      setMessage('✗ Error saving profile')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      <div className="mb-7 text-center">
        <h1 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>Account Settings</h1>
        <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Manage your owner profile and preferences</p>
      </div>

      <form onSubmit={save} className="max-w-2xl mx-auto space-y-6">
        <div className={`card relative overflow-hidden ${
          darkMode ? 'border-purple-700/50 bg-slate-900/30' : 'border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-[0_20px_70px_-40px_rgba(14,165,233,0.45)]'
        }`}>
          <div className={`absolute inset-0 pointer-events-none opacity-70 ${darkMode ? 'hidden' : ''}`} style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 32%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.12), transparent 28%), radial-gradient(circle at 50% 90%, rgba(79,70,229,0.10), transparent 38%)'
          }}></div>
          <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <User size={24} className={darkMode ? 'text-purple-400' : 'text-indigo-600'} />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>Email</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className={darkMode ? 'text-slate-400' : 'text-slate-400'} />
                <input 
                  placeholder="your@email.com" 
                  value={form.email||''} 
                  onChange={e=>setForm({...form,email:e.target.value})} 
                  className={`input-field flex-1 ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>Phone</label>
              <div className="flex items-center gap-2">
                <Phone size={18} className={darkMode ? 'text-slate-400' : 'text-slate-400'} />
                <input 
                  placeholder="+1 (555) 000-0000" 
                  value={form.phone||''} 
                  onChange={e=>setForm({...form,phone:e.target.value})} 
                  className={`input-field flex-1 ${
                    darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>First Name</label>
              <input 
                placeholder="John" 
                value={form.firstName||''} 
                onChange={e=>setForm({...form,firstName:e.target.value})} 
                className={`input-field ${
                  darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>Last Name</label>
              <input 
                placeholder="Doe" 
                value={form.lastName||''} 
                onChange={e=>setForm({...form,lastName:e.target.value})} 
                className={`input-field ${
                  darkMode ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400' : ''
                }`}
              />
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.includes('✓') 
                ? darkMode ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-800' 
                : darkMode ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800'
            }`}>
              {message.includes('✓') && <Check size={18} />}
              {message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full md:w-auto"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className={`card relative overflow-hidden ${
          darkMode ? 'border-purple-700/50 bg-slate-900/30' : 'border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-[0_20px_70px_-40px_rgba(14,165,233,0.45)]'
        }`}>
          <div className={`absolute inset-0 pointer-events-none opacity-70 ${darkMode ? 'hidden' : ''}`} style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), transparent 32%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.12), transparent 28%), radial-gradient(circle at 50% 90%, rgba(79,70,229,0.10), transparent 38%)'
          }}></div>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <Lock size={20} className={darkMode ? 'text-orange-400' : 'text-orange-600'} />
            Change Password
          </h2>
          <PasswordUpdateForm />
        </div>
      </form>
    </div>
  )
}

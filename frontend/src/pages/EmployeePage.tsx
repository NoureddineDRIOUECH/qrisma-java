import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scan, User, Gift, Plus, Minus, Search, CheckCircle, XCircle, Award, Zap, TrendingUp, Clock, ArrowUpRight, ArrowDownLeft, Camera, X } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'
import { Html5Qrcode } from 'html5-qrcode'

const API_BASE = import.meta.env.VITE_API_BASE || ''

interface TransactionRecord {
  id: string
  type: string
  points: number
  note: string
  createdAt: string
}

export default function EmployeePage() {
  const navigate = useNavigate()
  const { darkMode } = useDarkMode()
  const [isOwner, setIsOwner] = useState(false)
  const [passObjectId, setPassObjectId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [points, setPoints] = useState(1)
  const [redeemPoints, setRedeemPoints] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([])
  const [scannerActive, setScannerActive] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerInitialized = useRef(false)

  // Debug current session
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    const tokenPreview = token ? `${token.slice(0, 10)}...` : null
    console.log('[EmployeePage] Session:', { userId, role, token: tokenPreview })
    const roleCheck = (role || '').toLowerCase()
    setIsOwner(roleCheck === 'owner')
  }, [])

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrCodeRef.current && scannerActive) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [scannerActive])

  async function startScanner() {
    setScannerActive(true)
    setMessage(null)
    
    // Wait a brief moment for the DOM element to render
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      // Check if camera permissions are available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Request camera permission first
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          // Stop the stream immediately, we just needed to request permission
          stream.getTracks().forEach(track => track.stop())
        } catch (permErr: any) {
          throw new Error(`Camera permission denied: ${permErr.message}`)
        }
      }

      if (!scannerInitialized.current) {
        const element = document.getElementById('qr-reader-employee')
        if (!element) {
          throw new Error('Scanner element not found')
        }
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-employee')
        scannerInitialized.current = true
      }

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // Stop scanner
        await stopScanner()
        
        // Set the card ID and auto-lookup
        setPassObjectId(decodedText)
        
        // Trigger lookup with the scanned code
        await lookupCustomer(decodedText)
      }

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      // Try to start with back camera first, then fall back to any available camera
      try {
        await html5QrCodeRef.current!.start(
          { facingMode: 'environment' },
          config,
          qrCodeSuccessCallback,
          undefined
        )
      } catch (err) {
        // If back camera fails, try with front camera
        try {
          await html5QrCodeRef.current!.start(
            { facingMode: 'user' },
            config,
            qrCodeSuccessCallback,
            undefined
          )
        } catch (err2) {
          // Try with deviceId as last resort
          const devices = await Html5Qrcode.getCameras()
          if (devices && devices.length > 0) {
            await html5QrCodeRef.current!.start(
              devices[0].id,
              config,
              qrCodeSuccessCallback,
              undefined
            )
          } else {
            throw new Error('No cameras available')
          }
        }
      }
    } catch (err: any) {
      console.error('Scanner error:', err)
      let errorMessage = 'Failed to start camera. '
      
      const errMsg = err.message || err.toString()
      
      if (err.name === 'NotAllowedError' || errMsg.includes('Permission') || errMsg.includes('permission denied')) {
        errorMessage = '🔒 Camera access denied. Please click the camera icon in your browser address bar and allow access.'
      } else if (err.name === 'NotFoundError' || errMsg.includes('No cameras')) {
        errorMessage = '📷 No camera detected on this device.'
      } else if (err.name === 'NotReadableError' || errMsg.includes('in use')) {
        errorMessage = '⚠️ Camera is already being used by another application. Please close other apps using the camera.'
      } else if (errMsg.includes('HTTPS') || errMsg.includes('secure')) {
        errorMessage = '🔐 Camera requires secure connection (HTTPS). Please use HTTPS or localhost.'
      } else if (errMsg.includes('not found')) {
        errorMessage = '❌ Scanner element not ready. Please try again.'
      } else {
        errorMessage = `❌ Camera error: ${errMsg.substring(0, 100)}`
      }
      
      setMessage({ type: 'error', text: errorMessage })
      setScannerActive(false)
      scannerInitialized.current = false
      html5QrCodeRef.current = null
    }
  }

  async function stopScanner() {
    if (html5QrCodeRef.current) {
      try {
        if (scannerActive) {
          await html5QrCodeRef.current.stop()
          html5QrCodeRef.current.clear()
        }
      } catch (err) {
        console.error('Stop scanner error:', err)
      } finally {
        setScannerActive(false)
      }
    } else {
      setScannerActive(false)
    }
  }

  async function lookupCustomer(cardId: string) {
    console.log('[QR Scan] Looking up customer with card ID:', cardId)
    setLoading(true)
    setMessage(null)
    setTransactionHistory([])
    try {
      const res = await fetch(`${API_BASE}/api/scan/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passObjectId: cardId })
      })
      const json = await res.json()
      console.log('[QR Scan] Full customer data received:', json)
      
      if (res.ok && json.customerId) {
        console.log('[QR Scan] Customer Details:', {
          customerId: json.customerId,
          firstName: json.firstName,
          lastName: json.lastName,
          fullName: `${json.firstName || ''} ${json.lastName || ''}`.trim(),
          email: json.email || 'No email',
          phone: json.phone || 'No phone',
          address: json.address || 'No address',
          balance: json.balance ?? 0,
          transactionCount: json.transactions?.length || 0,
          allFields: Object.keys(json)
        })
        setResult(json)
        setMessage({ type: 'success', text: 'Customer found!' })
        // Fetch recent transactions if available
        if (json.transactions && Array.isArray(json.transactions)) {
          console.log('[QR Scan] Transactions:', json.transactions)
          setTransactionHistory(json.transactions.slice(0, 5))
        }
      } else {
        console.log('[QR Scan] Customer not found or error:', json.error)
        setMessage({ type: 'error', text: json.error || 'Customer not found' })
        setResult(null)
      }
    } catch (e) {
      console.error('[QR Scan] Connection error:', e)
      setMessage({ type: 'error', text: 'Connection error' })
      setResult(null)
    }
    setLoading(false)
  }

  async function lookup() {
    await lookupCustomer(passObjectId)
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
        // Add to transaction history
        setTransactionHistory(prev => [{
          id: Date.now().toString(),
          type: 'ADD_POINTS',
          points,
          note: 'Points added',
          createdAt: new Date().toISOString()
        }, ...prev].slice(0, 5))
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
        // Add to transaction history
        setTransactionHistory(prev => [{
          id: Date.now().toString(),
          type: 'REDEEM',
          points: redeemPoints,
          note: 'Points redeemed',
          createdAt: new Date().toISOString()
        }, ...prev].slice(0, 5))
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
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900'
        : 'bg-gradient-to-br from-white via-purple-50 to-indigo-50'
    } relative overflow-hidden`}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${
          darkMode ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
          darkMode ? 'bg-indigo-500' : 'bg-indigo-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
          darkMode ? 'bg-pink-500' : 'bg-pink-300'
        }`}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {isOwner && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 border ${
                darkMode
                  ? 'bg-purple-700/50 text-purple-200 border-purple-600 hover:bg-purple-700'
                  : 'bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 text-indigo-900 border-indigo-200 hover:shadow-lg'
              }`}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse mx-auto ${
            darkMode
              ? 'bg-gradient-to-br from-purple-400 to-indigo-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <Scan size={32} className="text-white" />
          </div>
          <h1 className={`text-5xl font-bold ${
            darkMode
              ? 'bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Point of Sale
          </h1>
          <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-slate-600'}`}>
            Scan customer cards & manage rewards
          </p>
        </div>

        {/* Scan Input Card */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-6 border backdrop-blur-xl transition-all ${
          darkMode
            ? 'bg-slate-800/50 border-purple-700/50'
            : 'bg-white/95 border-white/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <label className={`block text-sm font-semibold flex items-center gap-2 ${
              darkMode ? 'text-purple-200' : 'text-indigo-700'
            }`}>
              <Scan size={18} />
              Customer Card ID
            </label>
            {!scannerActive ? (
              <button
                type="button"
                onClick={startScanner}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  darkMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Camera size={18} />
                Scan QR
              </button>
            ) : (
              <button
                type="button"
                onClick={stopScanner}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <X size={18} />
                Stop
              </button>
            )}
          </div>

          {/* QR Scanner Container */}
          {scannerActive && (
            <div className="mb-4">
              <div id="qr-reader-employee" className={`rounded-xl overflow-hidden border-2 ${
                darkMode ? 'border-purple-500' : 'border-indigo-500'
              }`}></div>
              <p className={`text-xs text-center mt-2 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Position the QR code within the frame
              </p>
            </div>
          )}

          {/* Manual Input */}
          {!scannerActive && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                  darkMode ? 'text-slate-500' : 'text-slate-400'
                }`} />
                <input
                  type="text"
                  value={passObjectId}
                  onChange={e => setPassObjectId(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && passObjectId && lookup()}
                  placeholder="Scan QR code or enter card ID..."
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-colors text-lg ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                  }`}
                  autoFocus
                />
              </div>
              <button
                onClick={lookup}
                disabled={loading || !passObjectId}
                className={`px-8 py-4 rounded-xl font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-xl'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-2xl'
                }`}
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
          )}
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slide-up border-2 ${
            message.type === 'success' 
              ? darkMode
                ? 'bg-emerald-900/50 border-emerald-600 text-emerald-200'
                : 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : darkMode
              ? 'bg-red-900/50 border-red-600 text-red-200'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span className="font-semibold text-lg">{message.text}</span>
          </div>
        )}

        {/* Customer Info & Actions */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            {/* Customer Card */}
            <div className={`rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden ${
              darkMode
                ? 'bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600'
                : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'
            }`}>
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
                      <p className="text-purple-200">{result.email || 'No email'}</p>
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
              <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-xl transition-all ${
                darkMode
                  ? 'bg-slate-800/50 border-emerald-600/30'
                  : 'bg-white/95 border-white/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Plus size={24} className="text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Points</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Points Amount</label>
                    <input
                      type="number"
                      min="1"
                      value={points}
                      onChange={e => setPoints(parseInt(e.target.value || '1'))}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg font-semibold ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  
                  {/* Quick Add Buttons */}
                  <div className="flex gap-2">
                    {[1, 5, 10, 20].map(val => (
                      <button
                        key={val}
                        onClick={() => setPoints(val)}
                        className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all border-2 ${
                          points === val
                            ? darkMode
                              ? 'bg-emerald-600/50 border-emerald-500 text-emerald-200'
                              : 'bg-emerald-100 border-emerald-400 text-emerald-700'
                            : darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={addPoints}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-2xl'
                    }`}
                  >
                    <TrendingUp size={20} />
                    Add {points} Points
                  </button>
                </div>
              </div>

              {/* Redeem Points Card */}
              <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-xl transition-all ${
                darkMode
                  ? 'bg-slate-800/50 border-orange-600/30'
                  : 'bg-white/95 border-white/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center">
                    <Gift size={24} className="text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Redeem</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>Points to Redeem</label>
                    <input
                      type="number"
                      min="1"
                      max={result.balance || 0}
                      value={redeemPoints}
                      onChange={e => setRedeemPoints(parseInt(e.target.value || '1'))}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-lg font-semibold ${
                        darkMode
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-orange-500'
                          : 'bg-white border-slate-200 text-slate-900 focus:border-orange-500'
                      }`}
                    />
                  </div>
                  
                  {/* Quick Redeem Buttons */}
                  <div className="flex gap-2">
                    {[5, 10, 25, 50].map(val => (
                      <button
                        key={val}
                        onClick={() => setRedeemPoints(Math.min(val, result.balance || 0))}
                        disabled={val > (result.balance || 0)}
                        className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all border-2 ${
                          redeemPoints === val
                            ? darkMode
                              ? 'bg-orange-600/50 border-orange-500 text-orange-200'
                              : 'bg-orange-100 border-orange-400 text-orange-700'
                            : darkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:border-orange-500 disabled:opacity-40'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-400 hover:bg-orange-50 disabled:opacity-40'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={redeem}
                    disabled={loading || redeemPoints > (result.balance || 0)}
                    className={`w-full py-3.5 rounded-xl font-bold text-lg text-white transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      darkMode
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:shadow-lg'
                        : 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-2xl'
                    }`}
                  >
                    <Minus size={20} />
                    Redeem {redeemPoints} Points
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            {transactionHistory.length > 0 && (
              <div className={`rounded-2xl shadow-xl p-6 border backdrop-blur-xl ${
                darkMode
                  ? 'bg-slate-800/50 border-purple-700/30'
                  : 'bg-white/95 border-white/20'
              }`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Clock size={20} />
                  Recent Transactions
                </h3>
                <div className="space-y-3">
                  {transactionHistory.map((txn) => (
                    <div key={txn.id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      darkMode
                        ? 'bg-slate-700/50 hover:bg-slate-700'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          txn.type === 'ADD_POINTS'
                            ? darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                            : darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {txn.type === 'ADD_POINTS' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {txn.type === 'ADD_POINTS' ? 'Points Added' : 'Points Redeemed'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Just now
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${
                        txn.type === 'ADD_POINTS'
                          ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
                          : darkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>
                        {txn.type === 'ADD_POINTS' ? '+' : '-'}{txn.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !message && (
          <div className={`rounded-3xl shadow-xl p-12 text-center border backdrop-blur-xl ${
            darkMode
              ? 'bg-slate-800/30 border-purple-700/30'
              : 'bg-white/80 border-white/20'
          }`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              darkMode
                ? 'bg-slate-700'
                : 'bg-gradient-to-br from-slate-200 to-slate-300'
            }`}>
              <Zap size={48} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
            </div>
            <h3 className={`text-2xl font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-slate-700'
            }`}>Ready to Scan</h3>
            <p className={`text-lg ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Enter or scan a customer card ID to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
import React, { useEffect, useState } from 'react'
import { Users, Store, TrendingUp, Wallet, Gift, Clock, ArrowRight } from 'lucide-react'
import { apiGet } from '../utils/api'
import { useDarkMode } from '../context/DarkModeContext'

interface TransactionRecord {
  id: string
  customerId: string
  employeeId?: string
  type: string
  points: number
  note: string
  createdAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<TransactionRecord[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const { darkMode } = useDarkMode()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const role = localStorage.getItem('role')
    const tokenPreview = token ? `${token.slice(0, 10)}...` : null
    console.log('[DashboardPage] Session:', { userId, role, token: tokenPreview })
  }, [])

  useEffect(() => {
    apiGet('/api/dashboard/stats').then(r=>r.json()).then(setStats)
  }, [])

  useEffect(() => {
    setActivityLoading(true)
    apiGet('/api/activity/recent')
      .then(r => r.json())
      .then(data => {
        setRecentActivity(Array.isArray(data) ? data : [])
        setActivityLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch recent activity:', error)
        setActivityLoading(false)
      })
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <div 
      className={`animate-slide-up rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden group ${
        darkMode
          ? `border-purple-700/50 bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800 hover:border-purple-600/70`
          : color
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
            darkMode ? 'text-purple-300' : 'text-slate-600'
          }`}>{title}</p>
          <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`${darkMode ? 'text-purple-400' : 'text-slate-700'}`} size={24} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <p className={`text-4xl font-bold mb-1 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>{value}</p>
          <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return dateString
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'ADD_POINTS':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950'
      case 'REDEEM':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950'
      case 'TRANSFER':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
      default:
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-900'
    }
  }

  const TransactionRow = ({ transaction }: { transaction: TransactionRecord }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
      darkMode
        ? 'bg-slate-700/50 hover:bg-slate-700/70'
        : 'bg-slate-50 hover:bg-slate-100'
    }`}>
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
          <ArrowRight size={20} />
        </div>
        <div className="flex-1">
          <p className={`font-semibold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {transaction.type.replace(/_/g, ' ')}
          </p>
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {transaction.note || 'Transaction'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg transition-colors duration-300 ${
          transaction.type.toUpperCase() === 'ADD_POINTS'
            ? darkMode ? 'text-emerald-400' : 'text-emerald-600'
            : darkMode ? 'text-orange-400' : 'text-orange-600'
        }`}>
          {transaction.type.toUpperCase() === 'ADD_POINTS' ? '+' : '-'}{transaction.points}
        </p>
        <p className={`text-xs flex items-center justify-end gap-1 transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Clock size={12} />
          {formatDate(transaction.createdAt)}
        </p>
      </div>
    </div>
  )

  return (
    <div className={`space-y-8 p-5 rounded-3xl transition-colors duration-300 ${
      darkMode
        ? ''
        : 'bg-gradient-to-br from-white via-sky-50 to-indigo-50 border border-sky-100 shadow-[0_24px_80px_-38px_rgba(14,165,233,0.45)]'
    }`}>
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>Dashboard</h1>
        <p className={`text-lg transition-colors duration-300 ${
          darkMode ? 'text-slate-300' : 'text-slate-600'
        }`}>Welcome back! Here's your loyalty program overview.</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Total Customers" 
            value={stats.customers} 
            icon={Users}
            color="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100"
            delay={0}
          />
          <StatCard 
            title="Employees" 
            value={stats.employees} 
            icon={Store}
            color="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100"
            delay={100}
          />
          <StatCard 
            title="Programs" 
            value={stats.programs} 
            icon={TrendingUp}
            color="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100"
            delay={200}
          />
          <StatCard 
            title="Transactions" 
            value={stats.transactions} 
            icon={Wallet}
            color="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
            delay={300}
          />
          <StatCard 
            title="Total Points" 
            value={stats.totalPoints?.toLocaleString()} 
            icon={Gift}
            color="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            delay={400}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className={`animate-pulse text-lg ${darkMode ? 'text-white' : 'text-slate-600'}`}>Loading analytics...</div>
        </div>
      )}

      <div className={`mt-8 rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 ${
        darkMode
          ? 'border-purple-700/50 bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800'
          : 'border-sky-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50 shadow-[0_16px_60px_-30px_rgba(14,165,233,0.4)]'
      }`}>
        <div className="mb-6">
          <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>Recent Activity</h2>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>View your latest transaction history</p>
        </div>
        {activityLoading ? (
          <div className={`text-center py-12 rounded-xl border-2 transition-colors duration-300 ${
            darkMode
              ? 'border-purple-700/50 bg-slate-900/30'
              : 'border-slate-100 bg-slate-50'
          }`}>
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Loading transactions...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-xl border-2 transition-colors duration-300 ${
            darkMode
              ? 'border-purple-700/50 bg-slate-900/30'
              : 'border-slate-100 bg-slate-50'
          }`}>
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>No recent transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Users, Store, TrendingUp, Wallet, Gift } from 'lucide-react'
import { apiGet } from '../utils/api'
import { useDarkMode } from '../context/DarkModeContext'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const { darkMode } = useDarkMode()

  useEffect(() => {
    apiGet('/api/dashboard/stats').then(r=>r.json()).then(setStats)
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

  return (
    <div className="space-y-6">
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
          <div className="animate-pulse text-white text-lg">Loading analytics...</div>
        </div>
      )}

      <div className={`mt-8 rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 ${
        darkMode
          ? 'border-purple-700/50 bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800'
          : 'border-slate-200 bg-white'
      }`}>
        <div className="mb-6">
          <h2 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>Recent Activity</h2>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>View your latest transaction history</p>
        </div>
        <div className={`text-center py-12 rounded-xl border-2 transition-colors duration-300 ${
          darkMode
            ? 'border-purple-700/50 bg-slate-900/30'
            : 'border-slate-100 bg-slate-50'
        }`}>
          <p className={`transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>No recent transactions yet</p>
        </div>
      </div>
    </div>
  )
}

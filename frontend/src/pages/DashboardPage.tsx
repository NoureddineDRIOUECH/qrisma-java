import React, { useEffect, useState } from 'react'
import { Users, Store, TrendingUp, Wallet, Gift } from 'lucide-react'
import { apiGet } from '../utils/api'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  useEffect(() => {
    apiGet('/api/dashboard/stats').then(r=>r.json()).then(setStats)
  }, [])

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <div 
      className={`animate-slide-up rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden group ${color}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
          <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110`}>
            <Icon className="text-slate-700" size={24} />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-4xl font-bold text-slate-900 mb-1">{value}</p>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here's your loyalty program overview.</p>
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

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-slate-500 text-center py-8">No recent transactions yet</p>
      </div>
    </div>
  )
}

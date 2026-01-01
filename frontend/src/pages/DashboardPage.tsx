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
      className={`animate-slide-up card hover:scale-105 transition-transform border-l-4 ${color}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <Icon className={`text-white p-3 rounded-lg ${color.replace('border', 'bg')}`} size={48} />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-300">Welcome back! Here's your loyalty program overview.</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Total Customers" 
            value={stats.customers} 
            icon={Users}
            color="border-indigo-500 bg-indigo-50"
            delay={0}
          />
          <StatCard 
            title="Employees" 
            value={stats.employees} 
            icon={Store}
            color="border-pink-500 bg-pink-50"
            delay={100}
          />
          <StatCard 
            title="Programs" 
            value={stats.programs} 
            icon={TrendingUp}
            color="border-emerald-500 bg-emerald-50"
            delay={200}
          />
          <StatCard 
            title="Transactions" 
            value={stats.transactions} 
            icon={Wallet}
            color="border-orange-500 bg-orange-50"
            delay={300}
          />
          <StatCard 
            title="Total Points" 
            value={stats.totalPoints?.toLocaleString()} 
            icon={Gift}
            color="border-blue-500 bg-blue-50"
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

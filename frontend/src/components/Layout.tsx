import React from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, UserCircle, BarChart3, LogOut, Menu, Ticket } from 'lucide-react'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const NavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === to
          ? 'bg-white/20 text-white font-semibold'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
    >
      <Icon size={20} />
      <span className={sidebarOpen ? '' : 'hidden'}>{label}</span>
    </Link>
  )

  return (
    <div className="min-h-screen bg-ink-cream text-ink-dark">
      <div className="flex">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen bg-gradient-to-b from-ink-blue to-ink-dark text-white shadow-2xl transition-all duration-300 sticky top-0`}>
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && <img src="/images/Logoqrisma.png" alt="QRisma" className="h-10 mb-2 object-contain" />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded">
              <Menu size={20} />
            </button>
          </div>
          <nav className="space-y-2 px-3 mt-6">
            <NavItem to="/owner/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem to="/owner/programs" label="Programs" icon={Ticket} />
            <NavItem to="/owner/employees" label="Employees" icon={Users} />
            <NavItem to="/owner/store" label="Store" icon={Settings} />
            <NavItem to="/owner/profile" label="Profile" icon={UserCircle} />
            <div className="border-t border-white/10 pt-2 mt-4" />
            <NavItem to="/employee" label="POS" icon={BarChart3} />
          </nav>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-ink-gray shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="font-semibold text-lg text-ink-dark">Owner Console</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-ink-dark/60">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <button onClick={handleLogout} className="p-2 hover:bg-ink-gray/30 rounded-lg transition-colors" title="Logout">
                <LogOut size={18} className="text-ink-dark" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

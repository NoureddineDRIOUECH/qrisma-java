import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, UserCircle, BarChart2, LogOut, Menu, Ticket, Moon, Sun, ChevronDown } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(true)
  const { darkMode, setDarkMode } = useDarkMode()
  const [profileOpen, setProfileOpen] = useState(false)
  const [userName, setUserName] = useState('Owner')
  const [userEmail, setUserEmail] = useState('')

  // Load user info
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')
    
    if (userId && token) {
      // Fetch user profile from backend
      fetch('http://localhost:8080/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.firstName && data.lastName) {
            setUserName(`${data.firstName} ${data.lastName}`)
          } else if (data.firstName) {
            setUserName(data.firstName)
          }
          setUserEmail(data.email || '')
        })
        .catch(err => {
          // Fallback if API fails
          setUserName(`User ${userId.slice(0, 8)}`)
          setUserEmail(`user_${userId.slice(0, 6)}@qrisma.io`)
        })
    }
  }, [])
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    navigate('/login')
  }
  
  const NavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ripple ${
        pathname === to 
          ? 'bg-white/20 text-white font-semibold' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className={sidebarOpen ? '' : 'hidden'}>{label}</span>
    </Link>
  )

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'
    }`}>
      <div className="flex">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen transition-all duration-300 shadow-2xl sticky top-0 ${
          darkMode
            ? 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900'
            : 'bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900'
        } text-white`}>
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && <img src="/images/logoqr.png" alt="QRisma" className="h-10 mb-2 object-contain" />}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded ripple">
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
            <NavItem to="/employee" label="POS" icon={BarChart2} />
          </nav>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className={`h-16 backdrop-blur-md border-b transition-all duration-300 flex items-center justify-between px-6 sticky top-0 z-40 ${
            darkMode
              ? 'bg-slate-900/50 border-purple-800/30'
              : 'bg-white/80 border-slate-200'
          }`}>
            <div className={`font-semibold text-lg transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>Owner Console</div>
            <div className="flex items-center gap-4">
              <span className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all ripple ${
                  darkMode
                    ? 'bg-gradient-to-br from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-yellow-300 shadow-lg'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
                title="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`p-2 rounded-lg transition-all ripple flex items-center gap-2 ${
                    darkMode
                      ? 'bg-gradient-to-br from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  <UserCircle size={18} />
                  <ChevronDown size={16} className={`transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
                    darkMode
                      ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-purple-700/50'
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className={`p-4 border-b transition-colors duration-300 ${
                      darkMode ? 'border-purple-700/30' : 'border-slate-200'
                    }`}>
                      <p className={`font-semibold transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>{userName}</p>
                      <p className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-purple-300' : 'text-slate-500'
                      }`}>{userEmail}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          navigate('/owner/profile')
                          setProfileOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ripple flex items-center gap-2 ${
                          darkMode
                            ? 'hover:bg-purple-700/30 text-purple-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <UserCircle size={16} /> Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          navigate('/owner/store')
                          setProfileOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ripple flex items-center gap-2 ${
                          darkMode
                            ? 'hover:bg-purple-700/30 text-purple-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Settings size={16} /> Store Settings
                      </button>
                      <hr className={`my-2 transition-colors duration-300 ${
                        darkMode ? 'border-purple-700/30' : 'border-slate-200'
                      }`} />
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ripple flex items-center gap-2 ${
                          darkMode
                            ? 'hover:bg-red-900/30 text-red-300'
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className={`flex-1 overflow-auto p-6 max-w-7xl mx-auto w-full transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4`}>
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        .ripple {
          position: relative;
          overflow: hidden;
        }

        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .ripple:active::before {
          animation: ripple-animation 0.6s ease-out;
        }

        @keyframes ripple-animation {
          to {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import EnrollPage from './src/pages/EnrollPage'
import EmployeePage from './src/pages/EmployeePage'
import OwnerPage from './src/pages/OwnerPage'
import Layout from './src/components/Layout'
import DashboardPage from './src/pages/DashboardPage'
import EmployeesPage from './src/pages/EmployeesPage'
import ProgramsPage from './src/pages/ProgramsPage'
import StoreSettingsPage from './src/pages/StoreSettingsPage'
import ProfilePage from './src/pages/ProfilePage'
import LoginPage from './src/pages/LoginPage'
import RegisterPage from './src/pages/RegisterPage'
import './index.css'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage/>} />

        {/* Owner Console */}
        <Route path="/owner" element={<PrivateRoute><Layout/></PrivateRoute>}>
          <Route index element={<DashboardPage/>} />
          <Route path="dashboard" element={<DashboardPage/>} />
          <Route path="programs" element={<ProgramsPage/>} />
          <Route path="employees" element={<EmployeesPage/>} />
          <Route path="store" element={<StoreSettingsPage/>} />
          <Route path="profile" element={<ProfilePage/>} />
        </Route>

        {/* Public Routes */}
        <Route path="/enroll" element={<EnrollPage/>} />
        <Route path="/employee" element={<EmployeePage/>} />

        {/* Home */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={
          <div className="container">
            <h2 className="text-3xl font-bold mb-4">QRisma Loyalty System</h2>
            <div className="space-y-2">
              <div><Link to="/owner" className="text-blue-600 underline">Owner Dashboard</Link> - Create loyalty programs</div>
              <div><Link to="/employee" className="text-blue-600 underline">Employee Scanner</Link> - Scan customer passes</div>
              <div className="text-sm text-gray-600 mt-4">Customers use the enrollment link shared by the owner</div>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
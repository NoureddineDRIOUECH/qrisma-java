import React, { useEffect, useState } from 'react'
import { Trash, Pencil, Check, X, Plus } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type Employee = { id: string, email: string, firstName?: string, lastName?: string, phone?: string }

export default function EmployeesPage() {
  const { darkMode } = useDarkMode()
  const [items, setItems] = useState<Employee[]>([])
  const [form, setForm] = useState<any>({ email: '', firstName: '', lastName: '', phone: '', password: '' })
  const [editing, setEditing] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch(`${API_BASE}/api/employees`)
    setItems(await res.json())
  }
  useEffect(()=>{ load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/employees`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (res.ok) { 
      setForm({ email:'', firstName:'', lastName:'', phone:'', password:'' })
      load() 
    }
    setLoading(false)
  }

  async function update(id: string) {
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/employees/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(editing) })
    if (res.ok) { 
      setEditing(null)
      load() 
    }
    setLoading(false)
  }

  async function remove(id: string) {
    setLoading(true)
    await fetch(`${API_BASE}/api/employees/${id}`, { method: 'DELETE' })
    load()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>Team Members</h1>
        <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Manage your employee access and credentials</p>
      </div>

      <form onSubmit={create} className={`card ${
        darkMode
          ? 'border-purple-700/50 bg-slate-900/30'
          : 'bg-gradient-to-r from-indigo-50 to-purple-50'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>Add New Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input 
            required
            placeholder="Email" 
            value={form.email} 
            onChange={e=>setForm({...form,email:e.target.value})} 
            className={`input-field text-sm ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
          <input 
            placeholder="First Name" 
            value={form.firstName} 
            onChange={e=>setForm({...form,firstName:e.target.value})} 
            className={`input-field text-sm ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
          <input 
            placeholder="Last Name" 
            value={form.lastName} 
            onChange={e=>setForm({...form,lastName:e.target.value})} 
            className={`input-field text-sm ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
          <input 
            placeholder="Phone" 
            value={form.phone} 
            onChange={e=>setForm({...form,phone:e.target.value})} 
            className={`input-field text-sm ${
              darkMode
                ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                : ''
            }`}
          />
          <button 
            type="submit"
            disabled={loading}
            className="btn-primary lg:col-span-1 col-span-full flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className={`card text-center py-12 ${
          darkMode
            ? 'border-purple-700/50 bg-slate-900/30'
            : 'bg-white'
        }`}>
          <p className={`text-lg ${
            darkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>No employees yet. Add your first team member above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((emp, idx) => (
            <div 
              key={emp.id} 
              className={`card hover:shadow-xl transition-all animate-slide-up border ${
                darkMode
                  ? 'border-purple-700/50 bg-gradient-to-br from-slate-800 via-purple-900/30 to-slate-800'
                  : 'border-slate-200 bg-white'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  {editing?.id === emp.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input value={editing.email} onChange={e=>setEditing({...editing!,email:e.target.value})} className={`input-field text-sm ${
                        darkMode
                          ? 'bg-slate-700 text-white border-slate-600'
                          : ''
                      }`} />
                      <input value={editing.firstName||''} onChange={e=>setEditing({...editing!,firstName:e.target.value})} className={`input-field text-sm ${
                        darkMode
                          ? 'bg-slate-700 text-white border-slate-600'
                          : ''
                      }`} />
                      <input value={editing.lastName||''} onChange={e=>setEditing({...editing!,lastName:e.target.value})} className={`input-field text-sm ${
                        darkMode
                          ? 'bg-slate-700 text-white border-slate-600'
                          : ''
                      }`} />
                      <input value={editing.phone||''} onChange={e=>setEditing({...editing!,phone:e.target.value})} className={`input-field text-sm ${
                        darkMode
                          ? 'bg-slate-700 text-white border-slate-600'
                          : ''
                      }`} />
                    </div>
                  ) : (
                    <div>
                      <div className={`font-semibold ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}>{emp.firstName || emp.email.split('@')[0]} {emp.lastName||''}</div>
                      <div className={`text-sm mt-1 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>{emp.email} {emp.phone && `• ${emp.phone}`}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing?.id === emp.id ? (
                    <>
                      <button 
                        onClick={()=>update(emp.id)} 
                        disabled={loading}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-emerald-600/80 text-white hover:bg-emerald-700'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={()=>setEditing(null)} 
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-slate-600 text-slate-100 hover:bg-slate-500'
                            : 'bg-slate-300 text-slate-900 hover:bg-slate-400'
                        }`}
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={()=>setEditing(emp)} 
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={()=>remove(emp.id)} 
                        disabled={loading}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? 'bg-red-600/80 text-white hover:bg-red-700'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <Trash size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

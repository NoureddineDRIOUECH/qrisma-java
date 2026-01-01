import React, { useEffect, useState } from 'react'
import { Trash, Pencil, Check, X, Plus } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type Employee = { id: string, email: string, firstName?: string, lastName?: string, phone?: string }

export default function EmployeesPage() {
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
        <h1 className="text-3xl font-bold text-white mb-2">Team Members</h1>
        <p className="text-slate-300">Manage your employee access and credentials</p>
      </div>

      <form onSubmit={create} className="card bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">Add New Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <input 
            required
            placeholder="Email" 
            value={form.email} 
            onChange={e=>setForm({...form,email:e.target.value})} 
            className="input-field text-sm"
          />
          <input 
            placeholder="First Name" 
            value={form.firstName} 
            onChange={e=>setForm({...form,firstName:e.target.value})} 
            className="input-field text-sm"
          />
          <input 
            placeholder="Last Name" 
            value={form.lastName} 
            onChange={e=>setForm({...form,lastName:e.target.value})} 
            className="input-field text-sm"
          />
          <input 
            placeholder="Phone" 
            value={form.phone} 
            onChange={e=>setForm({...form,phone:e.target.value})} 
            className="input-field text-sm"
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
        <div className="card text-center py-12">
          <p className="text-slate-500 text-lg">No employees yet. Add your first team member above!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((emp, idx) => (
            <div 
              key={emp.id} 
              className="card hover:shadow-xl transition-all animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  {editing?.id === emp.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <input value={editing.email} onChange={e=>setEditing({...editing!,email:e.target.value})} className="input-field text-sm" />
                      <input value={editing.firstName||''} onChange={e=>setEditing({...editing!,firstName:e.target.value})} className="input-field text-sm" />
                      <input value={editing.lastName||''} onChange={e=>setEditing({...editing!,lastName:e.target.value})} className="input-field text-sm" />
                      <input value={editing.phone||''} onChange={e=>setEditing({...editing!,phone:e.target.value})} className="input-field text-sm" />
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-slate-900">{emp.firstName || emp.email.split('@')[0]} {emp.lastName||''}</div>
                      <div className="text-sm text-slate-500 mt-1">{emp.email} {emp.phone && `• ${emp.phone}`}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing?.id === emp.id ? (
                    <>
                      <button 
                        onClick={()=>update(emp.id)} 
                        disabled={loading}
                        className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={()=>setEditing(null)} 
                        className="p-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={()=>setEditing(emp)} 
                        className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={()=>remove(emp.id)} 
                        disabled={loading}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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

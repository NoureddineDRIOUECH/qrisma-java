import React, { useEffect, useState, useRef } from 'react'
import { Plus, Trash2, Edit2, Check, X, Copy, Download, QrCode, ChevronDown } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { apiGet, apiPost, apiDelete } from '../utils/api'

const API_BASE = import.meta.env.VITE_API_BASE || ''

type Program = { id: string, name: string, description: string, pointsPerAction: number, active: boolean, templateJson?: string }
type Template = { design?: { logoUrl: string, backgroundUrl: string, backgroundColor: string }, rewards?: Array<{rewardName: string, stampsRequired: number}>, termsOfUseText?: string, usageDescription?: string }
type DialogMode = null | 'add' | 'edit'

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [form, setForm] = useState({ name: '', description: '', pointsPerAction: 1, active: true })
  const [editing, setEditing] = useState<Program | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [expandedQR, setExpandedQR] = useState<string | null>(null)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [templateForm, setTemplateForm] = useState<Template>({})
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [dialogForm, setDialogForm] = useState({ name: '', description: '', pointsPerAction: 1, active: true })
  const [dialogTemplate, setDialogTemplate] = useState<Template>({ design: {}, rewards: [], termsOfUseText: '', usageDescription: '' })
  const [dialogEditingId, setDialogEditingId] = useState<string | null>(null)
  const qrRefs = useRef<Record<string, HTMLDivElement>>({})

  useEffect(() => {
    apiGet('/api/programs').then(r => r.json()).then(setPrograms)
  }, [])

  function openAddDialog() {
    setDialogForm({ name: '', description: '', pointsPerAction: 1, active: true })
    setDialogTemplate({ design: {}, rewards: [], termsOfUseText: '', usageDescription: '' })
    setDialogEditingId(null)
    setDialogMode('add')
  }

  function openEditDialog(prog: Program) {
    setDialogForm({ name: prog.name, description: prog.description, pointsPerAction: prog.pointsPerAction, active: prog.active })
    try {
      const template = prog.templateJson ? JSON.parse(prog.templateJson) : { design: {}, rewards: [], termsOfUseText: '', usageDescription: '' }
      setDialogTemplate(template)
    } catch {
      setDialogTemplate({ design: {}, rewards: [], termsOfUseText: '', usageDescription: '' })
    }
    setDialogEditingId(prog.id)
    setDialogMode('edit')
  }

  async function saveDialog() {
    if (!dialogForm.name) {
      setMessage('✗ Program name required')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const payload = { ...dialogForm, templateJson: JSON.stringify(dialogTemplate) }
      const res = await apiPost('/api/programs', payload)
      if (res.ok) {
        setMessage(dialogMode === 'add' ? '✓ Program created!' : '✓ Program updated!')
        setTimeout(() => setMessage(''), 3000)
        setDialogMode(null)
        apiGet('/api/programs').then(r => r.json()).then(setPrograms)
      }
    } catch (e) {
      setMessage('✗ Error saving program')
    }
    setLoading(false)
  }

  async function create(e: React.FormEvent) {
    e.preventDefault()
    openAddDialog()
  }

  async function update(id: string) {
    if (!editing) return
    setLoading(true)
    setMessage('')
    try {
      const res = await apiPost('/api/programs', editing)
      if (res.ok) {
        setEditing(null)
        setMessage('✓ Program updated!')
        setTimeout(() => setMessage(''), 3000)
        apiGet('/api/programs').then(r => r.json()).then(setPrograms)
      }
    } catch (e) {
      setMessage('✗ Error updating program')
    }
    setLoading(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this program?')) return
    setLoading(true)
    try {
      const res = await apiDelete(`/api/programs/${id}`)
      if (res.ok) {
        setPrograms(programs.filter(p => p.id !== id))
        setMessage('✓ Program deleted!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (e) {
      setMessage('✗ Error deleting program')
    }
    setLoading(false)
  }

  function getEnrollUrl(id: string) {
    return `${window.location.origin}/enroll?programId=${id}`
  }

  function downloadQR(id: string, name: string) {
    const element = qrRefs.current[id]?.querySelector('svg')
    if (element) {
      const svg = new XMLSerializer().serializeToString(element)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `${name.replace(/\s+/g, '-')}-qr.png`
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svg)
    }
  }

  function openTemplateEditor(prog: Program) {
    try {
      const template = prog.templateJson ? JSON.parse(prog.templateJson) : { design: {}, rewards: [], termsOfUseText: '', usageDescription: '' }
      setTemplateForm(template)
      setExpandedTemplate(prog.id)
    } catch {
      setTemplateForm({ design: {}, rewards: [], termsOfUseText: '', usageDescription: '' })
      setExpandedTemplate(prog.id)
    }
  }

  async function saveTemplate(progId: string) {
    setLoading(true)
    try {
      const res = await apiPost('/api/programs', { id: progId, templateJson: JSON.stringify(templateForm) })
      if (res.ok) {
        setMessage('✓ Template saved!')
        setTimeout(() => setMessage(''), 3000)
        setExpandedTemplate(null)
        apiGet('/api/programs').then(r => r.json()).then(setPrograms)
      }
    } catch (e) {
      setMessage('✗ Error saving template')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Loyalty Programs</h1>
          <p className="text-slate-300">Create and manage your loyalty card programs</p>
        </div>
        <button
          onClick={openAddDialog}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> New Program
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('✓') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 text-lg">No programs yet. Click "New Program" to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs.map((prog, idx) => (
            <div
              key={prog.id}
              className="card hover:shadow-xl transition-all animate-slide-up flex flex-col"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{prog.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{prog.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                      {prog.pointsPerAction} pt/action
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${prog.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                      {prog.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDialog(prog)}
                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                    title="Edit Program"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => remove(prog.id)}
                    disabled={loading}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Delete Program"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border-t pt-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-slate-600">Enrollment QR Code</p>
                  <button
                    onClick={() => downloadQR(prog.id, prog.name)}
                    className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                    title="Download QR"
                  >
                    <Download size={16} />
                  </button>
                </div>

                {expandedQR === prog.id ? (
                  <div className="flex justify-center mb-3">
                    <div ref={el => { if (el) qrRefs.current[prog.id] = el }} className="bg-white p-4 rounded-lg">
                      <QRCodeSVG
                        value={getEnrollUrl(prog.id)}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedQR(prog.id)}
                    className="w-full p-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode size={16} /> Show QR Code
                  </button>
                )}

                {expandedQR === prog.id && (
                  <button
                    onClick={() => setExpandedQR(null)}
                    className="w-full mt-2 p-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Hide QR
                  </button>
                )}
              </div>

              {/* Enrollment Link */}
              <div className="border-t pt-4 mt-auto">
                <p className="text-xs font-medium text-slate-600 mb-2">Enrollment Link:</p>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                  <input
                    type="text"
                    readOnly
                    value={getEnrollUrl(prog.id)}
                    className="flex-1 bg-transparent text-xs text-slate-600 font-mono outline-none truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getEnrollUrl(prog.id))
                      setMessage('✓ Link copied!')
                      setTimeout(() => setMessage(''), 2000)
                    }}
                    className="p-2 bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Modal */}
      {dialogMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {dialogMode === 'add' ? 'Create New Program' : 'Edit Program'}
              </h2>
              <button
                onClick={() => setDialogMode(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 text-lg">Program Information</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Program Name *</label>
                  <input
                    value={dialogForm.name}
                    onChange={e => setDialogForm({ ...dialogForm, name: e.target.value })}
                    placeholder="e.g., Coffee Loyalty"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={dialogForm.description}
                    onChange={e => setDialogForm({ ...dialogForm, description: e.target.value })}
                    placeholder="What is this program about?"
                    rows={2}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Points Per Action</label>
                  <input
                    type="number"
                    min="1"
                    value={dialogForm.pointsPerAction}
                    onChange={e => setDialogForm({ ...dialogForm, pointsPerAction: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Design Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-slate-900 text-lg">Design</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={dialogTemplate.design?.logoUrl || ''}
                    onChange={e => setDialogTemplate({...dialogTemplate, design: {...dialogTemplate.design, logoUrl: e.target.value}})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/bg.png"
                    value={dialogTemplate.design?.backgroundUrl || ''}
                    onChange={e => setDialogTemplate({...dialogTemplate, design: {...dialogTemplate.design, backgroundUrl: e.target.value}})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={dialogTemplate.design?.backgroundColor || '#72461d'}
                      onChange={e => setDialogTemplate({...dialogTemplate, design: {...dialogTemplate.design, backgroundColor: e.target.value}})}
                      className="h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={dialogTemplate.design?.backgroundColor || '#72461d'}
                      onChange={e => setDialogTemplate({...dialogTemplate, design: {...dialogTemplate.design, backgroundColor: e.target.value}})}
                      placeholder="#72461d"
                      className="input-field flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Rewards Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-slate-900 text-lg">Rewards</h3>
                {dialogTemplate.rewards?.map((reward, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Reward Name</label>
                      <input
                        type="text"
                        value={reward.rewardName}
                        onChange={e => {
                          const newRewards = [...(dialogTemplate.rewards || [])]
                          newRewards[i].rewardName = e.target.value
                          setDialogTemplate({...dialogTemplate, rewards: newRewards})
                        }}
                        placeholder="e.g., Free Drink"
                        className="input-field"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Stamps Required</label>
                      <input
                        type="number"
                        min="1"
                        value={reward.stampsRequired}
                        onChange={e => {
                          const newRewards = [...(dialogTemplate.rewards || [])]
                          newRewards[i].stampsRequired = parseInt(e.target.value) || 1
                          setDialogTemplate({...dialogTemplate, rewards: newRewards})
                        }}
                        className="input-field"
                      />
                    </div>
                    <button
                      onClick={() => setDialogTemplate({...dialogTemplate, rewards: dialogTemplate.rewards?.filter((_, j) => j !== i)})}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setDialogTemplate({...dialogTemplate, rewards: [...(dialogTemplate.rewards || []), {rewardName: '', stampsRequired: 1}]})}
                  className="w-full p-3 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={18} /> Add Reward
                </button>
              </div>

              {/* Terms Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-slate-900 text-lg">Terms & Usage</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Usage Description</label>
                  <textarea
                    placeholder="e.g., Earn 1 point per purchase."
                    value={dialogTemplate.usageDescription || ''}
                    onChange={e => setDialogTemplate({...dialogTemplate, usageDescription: e.target.value})}
                    rows={2}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Terms of Use</label>
                  <textarea
                    placeholder="e.g., Valid in-store only."
                    value={dialogTemplate.termsOfUseText || ''}
                    onChange={e => setDialogTemplate({...dialogTemplate, termsOfUseText: e.target.value})}
                    rows={2}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-3">
                {dialogMode === 'edit' && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this program?')) {
                        remove(dialogEditingId!)
                        setDialogMode(null)
                      }
                    }}
                    disabled={loading}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Trash2 size={18} /> Delete Program
                  </button>
                )}
                <button
                  onClick={() => setDialogMode(null)}
                  className="flex-1 p-3 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDialog}
                  disabled={loading}
                  className="flex-1 p-3 btn-primary flex items-center justify-center gap-2 font-medium"
                >
                  <Check size={18} /> {loading ? 'Saving...' : 'Save Program'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

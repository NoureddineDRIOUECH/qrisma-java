import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export default function OwnerPage() {
  const [programName, setProgramName] = useState('')
  const [description, setDescription] = useState('')
  const [pointsPerAction, setPointsPerAction] = useState(1)
  const [templateJson, setTemplateJson] = useState(`{
  "design": {
    "logoUrl": "https://placehold.co/660x660",
    "backgroundUrl": "https://placehold.co/1032x336",
    "backgroundColor": "#72461d"
  },
  "rewards": [
    { "stampsRequired": 10, "rewardName": "Free Drink" },
    { "stampsRequired": 20, "rewardName": "Free Dessert" }
  ],
  "usageDescription": "Earn 1 point per purchase.",
  "termsOfUseText": "Valid in-store only."
}`)
  const [message, setMessage] = useState('')
  const [programId, setProgramId] = useState('')

  async function createProgram(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/programs`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ 
        name: programName, 
        description, 
        pointsPerAction,
        templateJson,
        active: true 
      })
    })
    const json = await res.json()
    if (res.ok) {
      setProgramId(json.id)
      setMessage('Program created! Share the enroll link below.')
    } else {
      setMessage(json.error || 'error creating program')
    }
  }

  const enrollUrl = programId ? `${window.location.origin}/enroll?programId=${programId}` : ''

  return (
    <div className="container">
      <h1 className="text-2xl font-semibold">Owner - Create Loyalty Program</h1>
      
      <form onSubmit={createProgram} className="space-y-3 mt-4">
        <input 
          required 
          placeholder="Program Name" 
          value={programName} 
          onChange={e=>setProgramName(e.target.value)} 
          className="w-full p-2 border rounded"
        />
        <textarea 
          placeholder="Description" 
          value={description} 
          onChange={e=>setDescription(e.target.value)} 
          className="w-full p-2 border rounded"
          rows={3}
        />
        <div>
          <label className="block text-sm mb-1">Points per action:</label>
          <input 
            type="number" 
            value={pointsPerAction} 
            onChange={e=>setPointsPerAction(parseInt(e.target.value)||1)} 
            className="w-32 p-2 border rounded"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Template JSON (design + rewards):</label>
          <textarea
            value={templateJson}
            onChange={e=>setTemplateJson(e.target.value)}
            rows={8}
            className="w-full p-2 border rounded font-mono text-sm"
          />
          <p className="text-xs text-gray-600 mt-1">Include a rewards array with stampsRequired and rewardName.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Create Program</button>
      </form>

      {message && <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">{message}</div>}

      {enrollUrl && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded">
          <p className="text-sm font-semibold mb-2">Customer Enrollment Link:</p>
          <a href={enrollUrl} target="_blank" className="text-blue-600 underline break-all">
            {enrollUrl}
          </a>
          <p className="text-xs text-gray-600 mt-2">Share this link with customers to enroll</p>
        </div>
      )}
    </div>
  )
}

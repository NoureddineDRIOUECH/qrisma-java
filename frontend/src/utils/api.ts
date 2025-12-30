const API_BASE = import.meta.env.VITE_API_BASE || ''

export function getAuthHeaders() {
  const userId = localStorage.getItem('userId')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (userId) {
    headers['X-User-Id'] = userId
  }
  return headers
}

export async function apiGet(url: string) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: getAuthHeaders()
  })
  return response
}

export async function apiPost(url: string, body: any) {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  })
  return response
}

export async function apiDelete(url: string) {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return response
}

export { API_BASE }

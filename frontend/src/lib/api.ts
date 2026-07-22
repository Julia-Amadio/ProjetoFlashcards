import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

type ApiErrorBody = { message?: string; detail?: string; errors?: Record<string, string> }

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let body: ApiErrorBody | undefined
    try { body = await response.json() as ApiErrorBody } catch { /* resposta sem JSON */ }
    const fallback = response.status === 401
      ? 'E-mail ou senha incorretos.'
      : response.status >= 500
        ? 'O servidor encontrou um problema. Tente novamente.'
        : 'Não foi possível concluir a solicitação.'
    throw new ApiError(body?.message || body?.detail || fallback, response.status)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const api = {
  login: (email: string, password: string) =>
    request<string>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (data: { name: string; email: string; password: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
}

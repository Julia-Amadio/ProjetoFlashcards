import type { DeckSummary, User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

type ApiErrorBody = { message?: string; detail?: string; errors?: Record<string, string> }
type LoginResponse = { token: string }

export const SESSION_UNAUTHORIZED_EVENT = 'karta:session-unauthorized'

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      'Não foi possível conectar ao servidor. Confirme se o backend está rodando na porta 8080.',
      0,
    )
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(SESSION_UNAUTHORIZED_EVENT))
    }
    let body: ApiErrorBody | undefined
    try { body = await response.json() as ApiErrorBody } catch { /* resposta sem JSON */ }
    const fallback = response.status === 401
      ? 'E-mail ou senha incorretos.'
      : response.status >= 500
        ? 'O servidor encontrou um problema. Tente novamente.'
        : 'Não foi possível concluir a solicitação.'
    const validationMessage = body?.errors
      ? Object.values(body.errors).join(' ')
      : undefined
    throw new ApiError(body?.message || body?.detail || validationMessage || fallback, response.status)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T

  const contentType = response.headers.get('content-type') || ''
  return (contentType.includes('application/json') ? JSON.parse(text) : text) as T
}

export const api = {
  login: async (email: string, password: string) => {
    const response = await request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!response?.token || typeof response.token !== 'string') {
      throw new ApiError('O servidor retornou uma resposta de login inválida.', 502)
    }
    return response.token
  },

  register: (data: { name: string; email: string; password: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),

  listDecks: (token: string, signal?: AbortSignal) =>
    request<DeckSummary[]>('/decks', { signal }, token),
}

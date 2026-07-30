import type { ApiFlashcard, ApiStudyProgress, ApiUserPreferences, DeckSummary, User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || '/api'

type ApiErrorBody = { message?: string; detail?: string; errors?: Record<string, string> }
type LoginResponse = { token: string; user: User }
// GET /decks e GET /users agora vêm paginados (Page<T> do Spring Data) — só usamos o
// conteúdo da primeira página por enquanto, sem UI de paginação ainda.
type PageResponse<T> = { content: T[] }

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

async function requestMedia(
  path: string,
  token: string,
  signal?: AbortSignal,
): Promise<Blob | null> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      signal,
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(
      'Não foi possível conectar ao servidor. Confirme se o backend está rodando na porta 8080.',
      0,
    )
  }

  // Cards criados manualmente não têm mídia; nesse caso, 404 é um resultado esperado.
  if (response.status === 404) return null
  if (response.status === 401) {
    window.dispatchEvent(new Event(SESSION_UNAUTHORIZED_EVENT))
  }
  if (!response.ok) {
    throw new ApiError('Não foi possível carregar a mídia deste cartão.', response.status)
  }

  return response.blob()
}

export const api = {
  login: async (email: string, password: string) => {
    const response = await request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!response?.token || typeof response.token !== 'string' || !response.user?.id) {
      throw new ApiError('O servidor retornou uma resposta de login inválida.', 502)
    }
    return { token: response.token, user: response.user }
  },

  register: (data: { name: string; email: string; password: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (userId: string, token: string, data: { name?: string; password?: string }) =>
    request<User>(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }, token),

  listDecks: (token: string, signal?: AbortSignal) =>
    request<PageResponse<DeckSummary>>('/decks', { signal }, token).then(page => page.content),

  getDeck: (id: number, token: string, signal?: AbortSignal) =>
    request<DeckSummary>(`/decks/${id}`, { signal }, token),

  listFlashcards: (deckId: number, token: string, signal?: AbortSignal) =>
    request<ApiFlashcard[]>(`/decks/${deckId}/flashcards`, { signal }, token),

  getFlashcardImage: (flashcardId: number, token: string, signal?: AbortSignal) =>
    requestMedia(`/flashcards/${flashcardId}/image`, token, signal),

  getFlashcardWordAudio: (flashcardId: number, token: string, signal?: AbortSignal) =>
    requestMedia(`/flashcards/${flashcardId}/audio/word`, token, signal),

  getFlashcardSentenceAudio: (flashcardId: number, token: string, signal?: AbortSignal) =>
    requestMedia(`/flashcards/${flashcardId}/audio/sentence`, token, signal),

  getFavorites: (userId: string, token: string, signal?: AbortSignal) =>
    request<DeckSummary[]>(`/users/${userId}/favorites`, { signal }, token),

  addFavorite: (userId: string, deckId: number, token: string) =>
    request<void>(`/users/${userId}/favorites/${deckId}`, { method: 'POST' }, token),

  removeFavorite: (userId: string, deckId: number, token: string) =>
    request<void>(`/users/${userId}/favorites/${deckId}`, { method: 'DELETE' }, token),

  getStudyProgress: (userId: string, deckId: number, token: string, signal?: AbortSignal) =>
    request<ApiStudyProgress>(`/users/${userId}/study-progress/${deckId}`, { signal }, token),

  saveStudyProgress: (
    userId: string,
    deckId: number,
    token: string,
    progress: { index: number; revealed: boolean; completed: boolean; results: ApiStudyProgress['results'] },
  ) =>
    request<ApiStudyProgress>(
      `/users/${userId}/study-progress/${deckId}`,
      { method: 'PUT', body: JSON.stringify(progress) },
      token,
    ),

  getPreferences: (userId: string, token: string, signal?: AbortSignal) =>
    request<ApiUserPreferences>(`/users/${userId}/preferences`, { signal }, token),

  savePreferences: (userId: string, token: string, preferences: ApiUserPreferences) =>
    request<ApiUserPreferences>(
      `/users/${userId}/preferences`,
      { method: 'PUT', body: JSON.stringify(preferences) },
      token,
    ),
}

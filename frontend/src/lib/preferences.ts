import { api } from './api'
import type { ApiUserPreferences } from '../types'

export type StudyPreferences = ApiUserPreferences

export const defaultPreferences: StudyPreferences = {
  dailyGoal: 10,
  autoplayAudio: false,
  confirmExit: true,
}

const allowedDailyGoals = [5, 10, 15, 20, 30]

// Busca as preferências salvas no backend (GET /users/{userId}/preferences).
// Se o usuário nunca configurou nada (ou a chamada falha), devolve os padrões do app.
export async function loadPreferences(
  userId: string,
  token: string,
  signal?: AbortSignal,
): Promise<StudyPreferences> {
  try {
    const response = await api.getPreferences(userId, token, signal)
    return allowedDailyGoals.includes(response.dailyGoal)
      ? response
      : { ...response, dailyGoal: defaultPreferences.dailyGoal }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return defaultPreferences
  }
}

// Salva as preferências no backend. Devolve true/false pra tela mostrar confirmação ou erro.
export async function savePreferences(userId: string, token: string, preferences: StudyPreferences): Promise<boolean> {
  try {
    await api.savePreferences(userId, token, preferences)
    return true
  } catch {
    return false
  }
}

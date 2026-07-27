import { api } from './api'
import type { ApiStudyProgress } from '../types'

export type StudyResults = {
  again: number
  almost: number
  easy: number
}

export type StudyProgress = {
  index: number
  revealed: boolean
  completed: boolean
  results: StudyResults
}

const emptyResults: StudyResults = { again: 0, almost: 0, easy: 0 }
export const emptyStudyProgress: StudyProgress = { index: 0, revealed: false, completed: false, results: emptyResults }

function fromApi(progress: ApiStudyProgress): StudyProgress {
  return {
    index: progress.index,
    revealed: progress.revealed,
    completed: progress.completed,
    results: progress.results,
  }
}

// Busca o progresso salvo no backend (GET /users/{userId}/study-progress/{deckId}).
// Se o usuário nunca estudou esse deck (ou a chamada falha), devolve progresso zerado —
// a sessão de estudo sempre consegue começar do zero em vez de travar a tela.
export async function loadStudyProgress(
  userId: string,
  deckId: number,
  token: string,
  signal?: AbortSignal,
): Promise<StudyProgress> {
  try {
    const response = await api.getStudyProgress(userId, deckId, token, signal)
    return fromApi(response)
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return emptyStudyProgress
  }
}

// Salva (upsert) o progresso no backend. Falha aqui não deve travar a sessão de estudo em
// andamento — o usuário continua revisando os cartões mesmo que a persistência falhe.
export function saveStudyProgress(userId: string, deckId: number, token: string, progress: StudyProgress) {
  return api.saveStudyProgress(userId, deckId, token, progress).catch(() => undefined)
}

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
  updatedAt: string
}

const emptyResults: StudyResults = { again: 0, almost: 0, easy: 0 }

function storageKey(email: string, deckId: number) {
  return `karta.study.${email}.${deckId}`
}

export function loadStudyProgress(email: string, deckId: number, cardCount: number): StudyProgress {
  const fallback: StudyProgress = { index: 0, revealed: false, completed: false, results: emptyResults, updatedAt: '' }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(email, deckId)) || 'null') as Partial<StudyProgress> | null
    if (!saved) return fallback
    return {
      index: Math.min(Math.max(Number(saved.index) || 0, 0), cardCount - 1),
      revealed: saved.revealed === true,
      completed: saved.completed === true,
      results: {
        again: Math.max(Number(saved.results?.again) || 0, 0),
        almost: Math.max(Number(saved.results?.almost) || 0, 0),
        easy: Math.max(Number(saved.results?.easy) || 0, 0),
      },
      updatedAt: typeof saved.updatedAt === 'string' ? saved.updatedAt : '',
    }
  } catch {
    return fallback
  }
}

export function saveStudyProgress(email: string, deckId: number, progress: Omit<StudyProgress, 'updatedAt'>) {
  localStorage.setItem(storageKey(email, deckId), JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }))
}

export function progressPercentage(progress: StudyProgress, cardCount: number) {
  if (progress.completed) return 100
  const answered = progress.results.again + progress.results.almost + progress.results.easy
  return Math.round((Math.min(answered, cardCount) / cardCount) * 100)
}

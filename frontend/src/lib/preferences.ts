export type StudyPreferences = {
  dailyGoal: number
  autoplayAudio: boolean
  confirmExit: boolean
}

export const defaultPreferences: StudyPreferences = {
  dailyGoal: 10,
  autoplayAudio: false,
  confirmExit: true,
}

function storageKey(email: string) {
  return `karta.preferences.${email}`
}

export function loadPreferences(email: string): StudyPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(email)) || '{}') as Partial<StudyPreferences>
    return {
      dailyGoal: [5, 10, 15, 20, 30].includes(saved.dailyGoal ?? 0) ? saved.dailyGoal! : defaultPreferences.dailyGoal,
      autoplayAudio: typeof saved.autoplayAudio === 'boolean' ? saved.autoplayAudio : defaultPreferences.autoplayAudio,
      confirmExit: typeof saved.confirmExit === 'boolean' ? saved.confirmExit : defaultPreferences.confirmExit,
    }
  } catch {
    return defaultPreferences
  }
}

export function savePreferences(email: string, preferences: StudyPreferences) {
  localStorage.setItem(storageKey(email), JSON.stringify(preferences))
}

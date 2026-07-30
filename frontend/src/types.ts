export type User = {
  id: string
  name: string
  email: string
  role: 'ROLE_USER' | 'ROLE_ADMIN'
  createdAt: string
}

export type Session = {
  token: string
  email: string
  user?: User
}

export type DeckSummary = {
  id: number
  title: string
  description: string | null
  language: string
  difficultyLevel: string | null
}

// Corpo enviado para POST /decks/generate (DeckGenerateDTO no backend)
export type DeckGenerateRequest = {
  topic: string
  language: string
  difficultyLevel?: string
}

export type Deck = {
  id: number
  title: string
  language: string
  speechLanguage: string
  difficultyLevel: string
  description: string
  cardCount: number
  progress: number
  accent: string
  symbol: string
}

export type Flashcard = {
  word: string
  phonetic: string
  translation: string
  sentence: string
  sentenceTranslation: string
}

// Formato devolvido por GET /decks/{deckId}/flashcards (FlashcardDTO no backend)
export type ApiFlashcard = {
  id: number
  targetWord: string
  phoneticReading: string | null
  nativeTranslation: string
  partOfSpeech: string | null
  targetSentence: string | null
  sentencePhonetic: string | null
  sentenceTranslation: string | null
}

// Formato devolvido por GET/PUT /users/{userId}/study-progress/{deckId} (StudyProgressDTO no backend)
export type ApiStudyResults = {
  again: number
  almost: number
  easy: number
}

export type ApiStudyProgress = {
  deckId: number
  index: number
  revealed: boolean
  completed: boolean
  results: ApiStudyResults
  updatedAt: string | null
}

// Formato devolvido por GET/PUT /users/{userId}/preferences (UserPreferencesDTO no backend)
export type ApiUserPreferences = {
  dailyGoal: number
  autoplayAudio: boolean
  confirmExit: boolean
}

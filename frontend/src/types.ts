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

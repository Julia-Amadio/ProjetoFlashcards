import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { loadPreferences } from '../lib/preferences'
import { loadStudyProgress, saveStudyProgress } from '../lib/studyProgress'
import { StudyPage } from './StudyPage'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../lib/api', () => ({
  api: {
    getDeck: vi.fn(),
    listFlashcards: vi.fn(),
    getFlashcardImage: vi.fn(),
    getFlashcardWordAudio: vi.fn(),
    getFlashcardSentenceAudio: vi.fn(),
  },
}))
vi.mock('../lib/preferences', async importOriginal => {
  const original = await importOriginal<typeof import('../lib/preferences')>()
  return { ...original, loadPreferences: vi.fn() }
})
vi.mock('../lib/studyProgress', async importOriginal => {
  const original = await importOriginal<typeof import('../lib/studyProgress')>()
  return { ...original, loadStudyProgress: vi.fn(), saveStudyProgress: vi.fn() }
})

describe('StudyPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      session: {
        token: 'token',
        email: 'ana@example.com',
        user: {
          id: 'user-id',
          name: 'Ana',
          email: 'ana@example.com',
          role: 'ROLE_USER',
          createdAt: '2026-01-01T00:00:00Z',
        },
      },
      sessionExpired: false,
      login: vi.fn(),
      register: vi.fn(),
      updateProfile: vi.fn(),
      logout: vi.fn(),
    })
    vi.mocked(api.getDeck).mockResolvedValue({
      id: 4,
      title: 'Inglês básico',
      description: null,
      language: 'Inglês',
      difficultyLevel: 'A1',
    })
    vi.mocked(api.listFlashcards).mockResolvedValue([{
      id: 8,
      targetWord: 'hello',
      phoneticReading: '/həˈloʊ/',
      nativeTranslation: 'olá',
      partOfSpeech: null,
      targetSentence: 'Hello, how are you?',
      sentencePhonetic: null,
      sentenceTranslation: 'Olá, como você está?',
    }])
    vi.mocked(loadStudyProgress).mockResolvedValue({
      index: 0,
      revealed: false,
      completed: false,
      results: { again: 0, almost: 0, easy: 0 },
    })
    vi.mocked(loadPreferences).mockResolvedValue({
      dailyGoal: 10,
      autoplayAudio: false,
      confirmExit: false,
    })
    vi.mocked(api.getFlashcardImage).mockResolvedValue(null)
    vi.mocked(api.getFlashcardWordAudio).mockResolvedValue(null)
    vi.mocked(api.getFlashcardSentenceAudio).mockResolvedValue(null)
    vi.mocked(saveStudyProgress).mockResolvedValue(undefined)
  })

  it('revela a resposta e conclui uma sessão', async () => {
    const user = userEvent.setup()
    render(<StudyPage deckId={4} navigate={vi.fn()} />)

    const flashcard = await screen.findByRole('button', { name: /hello\. Pressione para revelar/ })
    await user.click(flashcard)
    expect(screen.getByRole('heading', { name: 'olá' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Fácil!/ }))
    expect(await screen.findByRole('heading', { name: 'Muito bem!' })).toBeInTheDocument()
    expect(screen.getByText('Você revisou todos os 1 cartões deste deck.')).toBeInTheDocument()
  })
})

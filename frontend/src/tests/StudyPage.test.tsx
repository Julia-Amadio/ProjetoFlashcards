import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyPage } from '../pages/StudyPage'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'mock-token', user: { id: 'u1' } },
  }),
}))

vi.mock('../lib/api', () => ({
  api: {
    getDeck: vi.fn(),
    listFlashcards: vi.fn(),
  },
}))

vi.mock('../lib/preferences', () => ({
  defaultPreferences: { dailyGoal: 10, autoplayAudio: false, confirmExit: false },
  loadPreferences: vi.fn().mockResolvedValue({ dailyGoal: 10, autoplayAudio: false, confirmExit: false }),
}))

vi.mock('../lib/studyProgress', () => ({
  emptyStudyProgress: { index: 0, revealed: false, completed: false, results: { again: 0, almost: 0, easy: 0 } },
  loadStudyProgress: vi.fn().mockResolvedValue({ index: 0, revealed: false, completed: false, results: { again: 0, almost: 0, easy: 0 } }),
  saveStudyProgress: vi.fn().mockResolvedValue(true),
}))

import { api } from '../lib/api'

const mockCards = [
  { targetWord: '勇气', phoneticReading: 'yǒngqì', nativeTranslation: 'coragem', targetSentence: 'Sentence', sentenceTranslation: 'Trad' },
  { targetWord: '猫', phoneticReading: 'māo', nativeTranslation: 'gato', targetSentence: 'Sentence 2', sentenceTranslation: 'Trad 2' },
]

describe('StudyPage', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getDeck).mockResolvedValue({ id: 1, title: 'Chinese', language: 'Mandarim', difficultyLevel: 'Easy' })
    vi.mocked(api.listFlashcards).mockResolvedValue(mockCards as any)
  })

  it('renders card and reveals answer on click', async () => {
    const user = userEvent.setup()
    render(<StudyPage deckId={1} navigate={navigate} />)

    await screen.findByText('勇气')
    expect(screen.queryByText('coragem')).not.toBeInTheDocument()

    const card = screen.getByRole('button', { name: /Pressione para revelar a resposta/i })
    await user.click(card)

    expect(screen.getByRole('heading', { name: 'coragem' })).toBeInTheDocument()
  })

  it('advances through study session to completion state', async () => {
    const user = userEvent.setup()
    render(<StudyPage deckId={1} navigate={navigate} />)

    // Card 1
    await screen.findByText('勇气')
    await user.click(screen.getByRole('button', { name: /Pressione para revelar a resposta/i }))
    await user.click(screen.getByRole('button', { name: /Fácil!/i }))

    // Card 2
    expect(await screen.findByText('猫')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pressione para revelar a resposta/i }))
    await user.click(screen.getByRole('button', { name: /Ainda não/i }))

    // Completion View
    expect(await screen.findByRole('heading', { name: 'Muito bem!' })).toBeInTheDocument()
    expect(screen.getByText('SESSÃO CONCLUÍDA')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts (Space to reveal, 1-3 to rate)', async () => {
    const user = userEvent.setup()
    render(<StudyPage deckId={1} navigate={navigate} />)

    await screen.findByText('勇气')

    // Space to reveal
    await user.keyboard(' ')
    expect(screen.getByRole('heading', { name: 'coragem' })).toBeInTheDocument()

    // Key '3' for Easy rating
    await user.keyboard('3')
    expect(await screen.findByText('猫')).toBeInTheDocument()
  })

})
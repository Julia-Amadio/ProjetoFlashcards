import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AdminFlashcardsPage } from './AdminFlashcardsPage'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../lib/api', () => ({
  api: {
    getDeck: vi.fn(),
    listFlashcards: vi.fn(),
    createFlashcard: vi.fn(),
    updateFlashcard: vi.fn(),
    deleteFlashcard: vi.fn(),
  },
}))

describe('AdminFlashcardsPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      session: {
        token: 'token',
        email: 'admin@example.com',
        user: {
          id: 'admin-id',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'ROLE_ADMIN',
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
      language: 'english',
      difficultyLevel: 'A1',
    })
    vi.mocked(api.listFlashcards).mockResolvedValue([])
  })

  it('cria um flashcard e atualiza a lista', async () => {
    vi.mocked(api.createFlashcard).mockResolvedValue({
      id: 8,
      targetWord: 'hello',
      phoneticReading: null,
      nativeTranslation: 'olá',
      partOfSpeech: null,
      targetSentence: null,
      sentencePhonetic: null,
      sentenceTranslation: null,
    })
    const user = userEvent.setup()
    render(<AdminFlashcardsPage deckId={4} navigate={vi.fn()} />)

    expect(await screen.findByRole('heading', { name: 'Inglês básico' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Palavra ou expressão *'), 'hello')
    await user.type(screen.getByLabelText('Tradução *'), 'olá')
    await user.click(screen.getByRole('button', { name: 'Criar flashcard' }))

    expect(api.createFlashcard).toHaveBeenCalledWith(4, 'token', expect.objectContaining({
      targetWord: 'hello',
      nativeTranslation: 'olá',
    }))
    expect(await screen.findByRole('heading', { name: 'hello' })).toBeInTheDocument()
    expect(screen.getByText('olá')).toBeInTheDocument()
  })
})

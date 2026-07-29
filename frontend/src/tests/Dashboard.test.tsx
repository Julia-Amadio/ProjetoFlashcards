import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Dashboard } from '../pages/Dashboard'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'mock-token', user: { id: 'u1', name: 'Alex' }, email: 'alex@test.com' },
  }),
}))

vi.mock('../lib/api', () => ({
  api: {
    listDecks: vi.fn(),
    getFavorites: vi.fn(),
    listFlashcards: vi.fn(),
    getStudyProgress: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  },
}))

import { api } from '../lib/api'

const mockDecks = [
  { id: 1, title: 'Mandarin Basics', language: 'Mandarim', difficultyLevel: 'Iniciante' },
  { id: 2, title: 'English Verbs', language: 'Inglês', difficultyLevel: 'Intermediário' },
]

describe('Dashboard', () => {
  const navigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.listDecks).mockResolvedValue(mockDecks)
    vi.mocked(api.getFavorites).mockResolvedValue([{ id: 1 }])
    vi.mocked(api.listFlashcards).mockResolvedValue([{ id: 101 }, { id: 102 }])
    vi.mocked(api.getStudyProgress).mockResolvedValue({
      completed: false,
      results: { again: 1, almost: 0, easy: 0 },
    })
  })

  it('renders loading state initially and then decks', async () => {
    render(<Dashboard navigate={navigate} />)

    expect(screen.getByText('Carregando decks')).toBeInTheDocument()
    expect(await screen.findByText('Mandarin Basics')).toBeInTheDocument()
    expect(screen.getByText('English Verbs')).toBeInTheDocument()
  })

  it('filters decks by search query', async () => {
    const user = userEvent.setup()
    render(<Dashboard navigate={navigate} />)

    await screen.findByText('Mandarin Basics')
    const searchInput = screen.getByRole('textbox', { name: /Buscar por deck ou idioma/i })

    await user.type(searchInput, 'Inglês')
    expect(screen.queryByText('Mandarin Basics')).not.toBeInTheDocument()
    expect(screen.getByText('English Verbs')).toBeInTheDocument()
  })

  it('filters decks by favorites when favoritesOnly is true', async () => {
    render(<Dashboard navigate={navigate} favoritesOnly={true} />)

    await screen.findByText('Mandarin Basics')
    expect(screen.queryByText('English Verbs')).not.toBeInTheDocument()
  })

  it('toggles favorite status when heart button is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(api.removeFavorite).mockResolvedValueOnce()

    render(<Dashboard navigate={navigate} />)
    await screen.findByText('Mandarin Basics')

    const favButton = screen.getByRole('button', { name: /Remover Mandarin Basics dos favoritos/i })
    await user.click(favButton)

    expect(api.removeFavorite).toHaveBeenCalledWith('u1', 1, 'mock-token')
  })

  it('navigates to study session when clicking "Começar deck"', async () => {
    const user = userEvent.setup()
    render(<Dashboard navigate={navigate} />)

    await screen.findByText('Mandarin Basics')
    const startButtons = screen.getAllByRole('button', { name: /Começar deck/i })
    await user.click(startButtons[0])

    expect(navigate).toHaveBeenCalledWith('/study/1')
  })
})
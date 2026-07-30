import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { GenerateDeckPage } from './GenerateDeckPage'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('../lib/api', () => ({
  api: { generateDeck: vi.fn() },
}))

describe('GenerateDeckPage', () => {
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
  })

  it('gera um deck e permite abrir o resultado', async () => {
    vi.mocked(api.generateDeck).mockResolvedValue({
      id: 12,
      title: 'Saudações em inglês',
      description: 'Deck gerado',
      language: 'english',
      difficultyLevel: 'A1',
    })
    const navigate = vi.fn()
    const user = userEvent.setup()
    render(<GenerateDeckPage navigate={navigate} />)

    await user.type(screen.getByLabelText(/^Tópico do deck/), 'saudações para viagens')
    await user.click(screen.getByRole('button', { name: 'Gerar deck' }))

    expect(api.generateDeck).toHaveBeenCalledWith('token', {
      topic: 'saudações para viagens',
      language: 'english',
      difficultyLevel: 'A1',
    })
    expect(await screen.findByText('Saudações em inglês')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir deck' }))
    expect(navigate).toHaveBeenCalledWith('/study/12')
  })
})

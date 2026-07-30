import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../context/AuthContext'
import { AuthPage } from './AuthPage'

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }))

const login = vi.fn()
const register = vi.fn()

describe('AuthPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      sessionExpired: false,
      login,
      register,
      updateProfile: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('envia as credenciais e navega depois do login', async () => {
    const navigate = vi.fn()
    const user = userEvent.setup()
    render(<AuthPage mode="login" navigate={navigate} />)

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Password1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(login).toHaveBeenCalledWith('ana@example.com', 'Password1')
    expect(navigate).toHaveBeenCalledWith('/')
  })

  it('mostra o erro devolvido pela autenticação', async () => {
    login.mockRejectedValueOnce(new Error('E-mail ou senha incorretos.'))
    const user = userEvent.setup()
    render(<AuthPage mode="login" navigate={vi.fn()} />)

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Password1')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
  })
})

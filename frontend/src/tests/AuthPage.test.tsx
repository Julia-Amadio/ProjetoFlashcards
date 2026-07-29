import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthPage } from '../pages/AuthPage'

const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    sessionExpired: false,
  }),
}))

vi.mock('../components/Logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

describe('AuthPage', () => {
  const navigate = vi.fn()

  it('renders login mode correctly', () => {
    render(<AuthPage mode="login" navigate={navigate} />)

    expect(screen.getByText('QUE BOM VER VOCÊ')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Continue aprendendo.' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/Nome de usuário/i)).not.toBeInTheDocument()
  })

  it('renders register mode correctly', () => {
    render(<AuthPage mode="register" navigate={navigate} />)

    expect(screen.getByText('COMECE SUA JORNADA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Crie sua conta.' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome de usuário/i)).toBeInTheDocument()
  })

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthPage mode="login" navigate={navigate} />)

    const passwordInput = screen.getByPlaceholderText('mínimo de 8 caracteres') as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: /Mostrar senha/i })

    expect(passwordInput.type).toBe('password')

    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    expect(screen.getByRole('button', { name: /Ocultar senha/i })).toBeInTheDocument()
  })

  it('submits login form and navigates home on success', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce(undefined)

    render(<AuthPage mode="login" navigate={navigate} />)

    await user.type(screen.getByLabelText(/E-mail/i), 'user@test.com')
    await user.type(screen.getByPlaceholderText('mínimo de 8 caracteres'), 'Password123')
    await user.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'Password123')
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/'))
  })

  it('displays error message when authentication fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'))

    render(<AuthPage mode="login" navigate={navigate} />)

    await user.type(screen.getByLabelText(/E-mail/i), 'user@test.com')
    await user.type(screen.getByPlaceholderText('mínimo de 8 caracteres'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /Entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
  })

  it('triggers navigation when switch button is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthPage mode="login" navigate={navigate} />)

    await user.click(screen.getByRole('button', { name: /Criar agora/i }))
    expect(navigate).toHaveBeenCalledWith('/register')
  })
})
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NotFoundPage } from '../pages/NotFoundPage'

describe('NotFoundPage', () => {
  it('renders correctly and handles return navigation', async () => {
    const navigate = vi.fn()
    const user = userEvent.setup()

    render(<NotFoundPage navigate={navigate} />)

    expect(screen.getByText('Página não encontrada')).toBeInTheDocument()
    
    const backButton = screen.getByRole('button', { name: /Voltar ao painel/i })
    await user.click(backButton)

    expect(navigate).toHaveBeenCalledWith('/')
  })
})
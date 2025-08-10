import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders heading and button', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /vite \+ react/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument()
  })
})


import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from '../src/App'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { useColorScheme, createTheme } from '@mui/material/styles'

function Probe() {
  const { mode, systemMode } = useColorScheme()
  const resolved = (mode === 'system' ? (systemMode ?? 'light') : (mode ?? 'light')) as 'light' | 'dark'
  return <div data-testid="resolved-mode">{resolved}</div>
}

function mockPrefersColorScheme(dark: boolean) {
  // @ts-expect-error: define matchMedia for tests
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: dark ? query.includes('prefers-color-scheme: dark') : query.includes('prefers-color-scheme: light'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe('Dark mode — system default', () => {
  afterEach(() => {
    // no-op
  })

  it('defaults to dark when system prefers dark', async () => {
    mockPrefersColorScheme(true)
    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
        <Probe />
      </ThemeProvider>
    )
    expect(screen.getByTestId('resolved-mode').textContent).toBe('dark')
  })

  it('defaults to light when system prefers light', async () => {
    mockPrefersColorScheme(false)
    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
        <Probe />
      </ThemeProvider>
    )
    expect(screen.getByTestId('resolved-mode').textContent).toBe('light')
  })
})

describe('Dark mode — toggle control', () => {
  afterEach(() => {
    // no-op
  })

  it('renders a top-right icon button to toggle theme and flips theme on click', async () => {
    mockPrefersColorScheme(false)
    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
        <Probe />
      </ThemeProvider>
    )

    const btn = screen.getByRole('button', { name: /toggle color mode/i })
    expect(screen.getByTestId('resolved-mode').textContent).toBe('light')
    // First click selects explicit light when starting from system
    await userEvent.click(btn)
    // It may still be light after first click
    expect(screen.getByTestId('resolved-mode').textContent).toBe('light')
    // Second click selects dark
    await userEvent.click(btn)
    expect(screen.getByTestId('resolved-mode').textContent).toBe('dark')
  })
})

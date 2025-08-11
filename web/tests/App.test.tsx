import { render, screen } from '@testing-library/react'
import App from '../src/App'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'

describe('App', () => {
  beforeAll(() => {
    // Mock getUserMedia and video.play for JSDOM
    // @ts-expect-error augment window for tests
    global.navigator.mediaDevices = {
      getUserMedia: async () => ({ getTracks: () => [{ stop: () => {} }] }) as any,
    } as any
    // @ts-expect-error override prototype method for tests
    HTMLMediaElement.prototype.play = () => Promise.resolve()
  })

  it('renders heading and controls', () => {
    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    )
    expect(
      screen.getByRole('heading', { name: /lower that — web/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /preferred content description/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../src/api/client'
import App from '../src/App'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'

describe('App error paths', () => {
  beforeEach(() => {
    // Ensure real timers each test
    vi.useRealTimers()
  })

  it('handles analyzeImage rejection without crashing', async () => {
    // Happy path for webcam + canvas
    // @ts-expect-error augment window for tests
    global.navigator.mediaDevices = {
      getUserMedia: async () => ({ getTracks: () => [{ stop: () => {} }] }) as any,
    } as any
    // @ts-expect-error override prototype method for tests
    HTMLMediaElement.prototype.play = () => Promise.resolve()
    // Canvas mocks
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      // @ts-expect-error simplified mock context
      () => ({ drawImage: vi.fn() })
    )
    // @ts-expect-error define toBlob for tests
    HTMLCanvasElement.prototype.toBlob = function (cb: (b: Blob | null) => void) {
      cb(new Blob(['fake-bytes'], { type: 'image/jpeg' }))
    }
    // FileReader sync
    // @ts-expect-error override for tests
    global.FileReader = class {
      result: string | ArrayBuffer | null = 'data:image/jpeg;base64,ZmFrZQ=='
      onloadend: null | (() => void) = null
      onerror: null | (() => void) = null
      readAsDataURL() { this.onloadend && this.onloadend() }
    } as any

    // Make interval fire immediately
    const realSetInterval = global.setInterval
    // @ts-expect-error override for tests
    global.setInterval = (cb: TimerHandler): any => { if (typeof cb === 'function') cb(); return 1 as any }

    vi.spyOn(api, 'analyzeImage').mockRejectedValue(new Error('boom'))

    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    )

    // App stays rendered and responsive even if analysis fails
    expect(await screen.findByRole('heading', { name: /lower that — web/i })).toBeInTheDocument()
    // Results area remains present
    expect(screen.getByText(/results log/i)).toBeInTheDocument()

    global.setInterval = realSetInterval
  })

  it('handles webcam init failure gracefully', async () => {
    // Force getUserMedia to reject
    // @ts-expect-error augment window for tests
    global.navigator.mediaDevices = {
      getUserMedia: async () => { throw new Error('no camera') },
    } as any

    // Silence expected console.error noise
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    )

    // App still renders heading and UI
    expect(screen.getByRole('heading', { name: /lower that — web/i })).toBeInTheDocument()

    // ensure no crash (we saw heading), and clean up
    errSpy.mockRestore()
  })
})

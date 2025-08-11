import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import * as api from '../src/api/client'
import App from '../src/App'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { createTheme } from '@mui/material/styles'

describe('App behavior', () => {
  beforeAll(() => {
    // Mock getUserMedia and video.play
    // @ts-expect-error augment window for tests
    global.navigator.mediaDevices = {
      getUserMedia: async () => ({ getTracks: () => [{ stop: () => {} }] }) as any,
    } as any
    // @ts-expect-error override prototype method for tests
    HTMLMediaElement.prototype.play = () => Promise.resolve()

    // Provide a minimal canvas implementation
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      // @ts-expect-error simplified mock context
      () => ({ drawImage: vi.fn() })
    )
    // jsdom may not implement toBlob; add a stub
    // @ts-expect-error define toBlob for tests
    HTMLCanvasElement.prototype.toBlob = function (cb: (b: Blob | null) => void) {
      cb(new Blob(['fake-bytes'], { type: 'image/jpeg' }))
    }

    // Make FileReader synchronous for blob->dataURL conversion
    // @ts-expect-error override for tests
    global.FileReader = class {
      result: string | ArrayBuffer | null = 'data:image/jpeg;base64,ZmFrZQ=='
      onloadend: null | (() => void) = null
      onerror: null | (() => void) = null
      readAsDataURL() {
        // Immediately trigger load end
        this.onloadend && this.onloadend()
      }
    } as any
  })

  it('toggles running and logs an analysis tick', async () => {
    // Make the interval fire immediately to simplify test
    const realSetInterval = global.setInterval
    // @ts-expect-error override for tests
    global.setInterval = (cb: TimerHandler): any => {
      // invoke once synchronously
      if (typeof cb === 'function') cb()
      return 1 as any
    }
    const analyzeSpy = vi.spyOn(api, 'analyzeImage').mockResolvedValue({
      tv_content_description: 'Tick OK',
      should_mute_tv: true,
    })

    render(
      <ThemeProvider theme={createTheme({ colorSchemes: { dark: true } })}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    )

    // Button starts as Stop; click to pause then click to resume
    const btn = await screen.findByRole('button', { name: /start/i })
    await userEvent.click(btn)
    expect(btn).toHaveTextContent(/stop/i)
    await userEvent.click(btn)
    expect(btn).toHaveTextContent(/start/i)

    // Expect analyzeImage called and log rendered
    await waitFor(() => {
      expect(analyzeSpy).toHaveBeenCalled()
      const rows = screen.getAllByText('Tick OK')
      expect(rows.length).toBeGreaterThanOrEqual(1)
      const flags = screen.getAllByText(/should_mute_tv: true/i)
      expect(flags.length).toBeGreaterThanOrEqual(1)
    })

    // restore
    global.setInterval = realSetInterval
  })
})

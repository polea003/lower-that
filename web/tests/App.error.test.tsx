import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import * as api from '../src/api/client'
import App from '../src/App'

describe('App error paths', () => {
  beforeEach(() => {
    // Ensure real timers each test
    vi.useRealTimers()
  })

  it('logs Error when analyzeImage rejects', async () => {
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

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText(/should_mute_tv: false/i)).toBeInTheDocument()
    })

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

    render(<App />)

    // App still renders heading and UI
    expect(screen.getByRole('heading', { name: /lower that — web/i })).toBeInTheDocument()

    // ensure error was logged (covers catch branch)
    await waitFor(() => {
      expect(errSpy).toHaveBeenCalled()
    })
    errSpy.mockRestore()
  })
})


// Vitest + Testing Library setup for JSDOM
import '@testing-library/jest-dom/vitest'

// MSW test server setup (node environment)
import { server } from './msw/testServer'

// Establish API mocking before all tests.
beforeAll(() => server.listen())

// Reset any runtime request handlers we may add during the tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())

// Provide basic media APIs so App doesn't error in JSDOM
// @ts-expect-error augment navigator for tests
if (!global.navigator.mediaDevices) {
  // @ts-expect-error assign for tests
  global.navigator.mediaDevices = {} as any
}
// @ts-expect-error add stub getUserMedia if missing
if (!global.navigator.mediaDevices.getUserMedia) {
  // @ts-expect-error simplified media stream
  global.navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop: () => {} }] }) as any
}
// Always stub video.play to a resolved promise in JSDOM
// @ts-expect-error assign for tests
HTMLMediaElement.prototype.play = () => Promise.resolve()

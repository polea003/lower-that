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


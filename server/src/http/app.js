import express from 'express'
import cors from 'cors'
import { router as analyzeRouter } from './routes/analyze.js'

export const createHttpApp = (deps = {}) => {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Healthcheck
  app.get('/health', (_req, res) => res.json({ ok: true }))

  // API routes
  app.use('/api', analyzeRouter(deps))

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500
    res.status(status).json({ error: err.message || 'Internal Server Error' })
  })

  return app
}


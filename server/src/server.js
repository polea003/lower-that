import { createHttpApp } from './http/app.js'
import { visionAnalysisService } from './services/visionAnalysisService.js'
import { logger } from './utils/logger.js'

const PORT = process.env.PORT || 3000

const app = createHttpApp({ visionAnalysisService })

app.listen(PORT, () => {
  logger.info(`HTTP server listening on http://localhost:${PORT}`)
})


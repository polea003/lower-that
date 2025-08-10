import { createHttpApp } from './http/app.js'
import { visionAnalysisService } from './services/visionAnalysisService.js'
import { tvRemoteService } from './services/tvRemoteService.js'
import { tvRemoteNoopService } from './services/tvRemoteNoopService.js'
import { environment } from './config/environment.js'
import { logger } from './utils/logger.js'

const PORT = process.env.PORT || 3000

const app = createHttpApp({
  visionAnalysisService,
  tvRemoteService: environment.tvControlEnabled ? tvRemoteService : tvRemoteNoopService,
})

app.listen(PORT, () => {
  logger.info(`HTTP server listening on http://localhost:${PORT}`)
})

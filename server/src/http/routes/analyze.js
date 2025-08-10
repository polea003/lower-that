import { Router } from 'express'
import multer from 'multer'
import { CONTENT_TYPES } from '../../config/constants.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const createBadRequest = (message) => {
  const err = new Error(message)
  err.name = 'BadRequestError'
  err.statusCode = 400
  return err
}

export const router = (deps = {}) => {
  const r = Router()
  const { visionAnalysisService, tvRemoteService } = deps
  if (!visionAnalysisService || typeof visionAnalysisService.analyzeVideoContent !== 'function') {
    throw new Error('visionAnalysisService with analyzeVideoContent is required')
  }
  if (!tvRemoteService || typeof tvRemoteService.toggleMute !== 'function') {
    throw new Error('tvRemoteService with toggleMute is required')
  }
  let isMuted = false

  r.post('/analyze', upload.single('image'), async (req, res, next) => {
    try {
      const { contentDescription = CONTENT_TYPES.SPORTING_EVENT, imageBase64 } = req.body || {}
      let base64 = imageBase64

      if (!base64) {
        const file = req.file
        if (!file || !file.buffer) {
          throw createBadRequest('Missing image or imageBase64')
        }
        base64 = file.buffer.toString('base64')
      }

      const result = await visionAnalysisService.analyzeVideoContent(base64, contentDescription)

      // Always apply mute logic server-side based on analysis
      if (!isMuted && result.should_mute_tv) {
        await tvRemoteService.toggleMute()
        isMuted = true
      } else if (isMuted && !result.should_mute_tv) {
        await tvRemoteService.toggleMute()
        isMuted = false
      }

      res.json({ ...result, server_isMuted: isMuted })
    } catch (err) {
      next(err)
    }
  })

  return r
}

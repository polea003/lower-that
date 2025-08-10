import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createHttpApp } from '../../src/http/app.js'

const mockService = () => ({
  analyzeVideoContent: vi.fn(async (imageBase64, contentDescription) => ({
    tv_content_description: `desc for ${contentDescription}`,
    should_mute_tv: false,
    echo_len: imageBase64?.length || 0,
  })),
})

describe('POST /api/analyze', () => {
  let app
  let service

  beforeEach(() => {
    service = mockService()
    app = createHttpApp({ visionAnalysisService: service })
  })

  it('returns 400 when no image provided', async () => {
    const res = await request(app).post('/api/analyze').send({})
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('accepts JSON with imageBase64', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ imageBase64: 'QUJD', contentDescription: 'custom' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(200)
    expect(service.analyzeVideoContent).toHaveBeenCalledWith('QUJD', 'custom')
    expect(res.body).toMatchObject({ should_mute_tv: false })
  })

  it('accepts multipart file upload', async () => {
    const buffer = Buffer.from('abc')
    const res = await request(app)
      .post('/api/analyze')
      .field('contentDescription', 'from-file')
      .attach('image', buffer, { filename: 'test.jpg', contentType: 'image/jpeg' })
    expect(res.status).toBe(200)
    expect(service.analyzeVideoContent).toHaveBeenCalled()
    const [base64Arg, descArg] = service.analyzeVideoContent.mock.calls[0]
    expect(descArg).toBe('from-file')
    expect(typeof base64Arg).toBe('string')
    expect(base64Arg.length).toBeGreaterThan(0)
  })

  it('accepts multipart with only file (no fields)', async () => {
    const buffer = Buffer.from('xyz')
    const res = await request(app)
      .post('/api/analyze')
      .attach('image', buffer, { filename: 'only.jpg', contentType: 'image/jpeg' })
    expect(res.status).toBe(200)
  })

  it('uses default content description when not provided', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ imageBase64: 'QUJD' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(200)
    const [, descArg] = service.analyzeVideoContent.mock.calls.pop()
    expect(typeof descArg).toBe('string')
    expect(descArg.length).toBeGreaterThan(0)
  })

  it('returns 500 when service throws', async () => {
    service.analyzeVideoContent.mockRejectedValueOnce(new Error('boom'))
    const res = await request(app)
      .post('/api/analyze')
      .send({ imageBase64: 'xxx' })
      .set('Content-Type', 'application/json')
    expect(res.status).toBe(500)
    expect(res.body).toHaveProperty('error')
  })
})

describe('app plumbing', () => {
  let app
  beforeEach(() => {
    app = createHttpApp({ visionAnalysisService: mockService() })
  })

  it('responds to /health', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })

  it('throws at startup when missing visionAnalysisService', () => {
    // Create app without the required dependency should throw
    expect(() => createHttpApp({})).toThrow(/visionAnalysisService/)
  })
})

import { analyzeImage } from '../../src/api/client'
import { server } from '../msw/testServer'
import { http, HttpResponse } from 'msw'

describe('api/client analyzeImage', () => {
  it('posts to /api/analyze and returns parsed result', async () => {
    const blob = new Blob(['fake-bytes'], { type: 'image/jpeg' })
    const data = await analyzeImage(blob, { contentDescription: 'desc' })
    expect(data).toEqual({
      tv_content_description: expect.any(String),
      should_mute_tv: expect.any(Boolean),
    })
  })

  it('supports string input by wrapping into Blob', async () => {
    // Using default MSW handler; this exercises the string/Blob branch
    const data = await analyzeImage('STRING-CONTENT', { contentDescription: 'string-desc' })
    expect(data).toEqual({
      tv_content_description: expect.any(String),
      should_mute_tv: expect.any(Boolean),
    })
  })

  it('throws on non-OK response', async () => {
    server.use(
      http.post('/api/analyze', async () => new HttpResponse(null, { status: 500 }))
    )
    await expect(analyzeImage(new Blob(["bad"], { type: 'image/jpeg' }), { contentDescription: 'err' })).rejects.toThrow(
      /Analyze failed: 500/
    )
  })
})


import { analyzeImage } from './client'

describe('api/client analyzeImage', () => {
  it('posts to /api/analyze and returns parsed result', async () => {
    const blob = new Blob(['fake-bytes'], { type: 'image/jpeg' })
    const data = await analyzeImage(blob)
    expect(data).toEqual({
      tv_content_description: expect.any(String),
      should_mute_tv: expect.any(Boolean),
    })
  })
})


export type AnalyzeResponse = {
  tv_content_description: string
  should_mute_tv: boolean
}

export async function analyzeImage(image: Blob | string): Promise<AnalyzeResponse> {
  const isBlob = typeof image !== 'string'
  const body = new FormData()
  body.append('image', isBlob ? image : new Blob([image], { type: 'text/plain' }), 'image.jpg')

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body,
  })
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`)
  return res.json() as Promise<AnalyzeResponse>
}


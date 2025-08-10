import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/analyze', async ({ request }) => {
    // you could assert form data here if needed
    return HttpResponse.json({
      tv_content_description: 'Mocked description. User content matches.',
      should_mute_tv: false,
    })
  }),
]


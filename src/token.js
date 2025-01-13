import { TokenJS } from 'token.js'
import { systemPrompt } from './prompts.js'

const tokenjs = new TokenJS()

export async function analyzeImage(image_url) {

  const completion = await tokenjs.chat.completions.create({
    provider: 'openai',
    model: 'gpt-4o-mini',
    response_format: { type: "json_object" },
    messages: [
        {
            role: "user",
            content: [
                { type: "text", text: systemPrompt },
                {
                    type: "image_url",
                    image_url: {
                        url: image_url,
                        detail: "low",
                    },
                },
            ],
        }
    ],
  })
  console.log(completion)
  //   console.log(completion.choices[0])
  return completion.choices[0].message.content
}


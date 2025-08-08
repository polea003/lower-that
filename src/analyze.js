import OpenAI from "openai";
import { getSystemPrompt } from './prompts.js'

export async function analyzeImage(image_url, contentDescription) {
    const client = new OpenAI();
    const systemPrompt = getSystemPrompt(contentDescription)

    const response = await client.responses.create({
        model: "gpt-5-nano",
        instructions: systemPrompt,
        reasoning: { effort: "low" },
        input: [
            {
                role: "user",
                content: [
                    {
                        type: "input_image",
                        image_url: image_url,
                        detail: "low",
                    },
                ],
            }
        ],
        store: false,
        text: {
            format: {
                type: "json_schema",
                name: "tv_analysis_result",
                schema: {
                    type: "object",
                    properties: {
                        tv_content_description: { type: "string" },
                        should_mute_tv: { type: "boolean" }
                    },
                    required: ["tv_content_description", "should_mute_tv"],
                    additionalProperties: false
                },
                strict: true
            }
        }
    });

  console.log(response)
  return response.output_text
}


import OpenAI from "openai";
import { systemPrompt } from './prompts.js'


export async function analyzeImage(image_url) {
    const client = new OpenAI();

    const response = await client.responses.create({
        model: "gpt-4.1-nano",
        instructions: systemPrompt,
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
                        image_description: { type: "string" },
                        is_commercial: { type: "boolean" }
                    },
                    required: ["image_description", "is_commercial"],
                    additionalProperties: false
                },
                strict: true
            }
        }
    });

  console.log(response)
  return response.output_text
}


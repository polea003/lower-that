import OpenAI from 'openai';
import { AI_CONFIG } from '../config/constants.js';
import { environment } from '../config/environment.js';
import { logger } from '../utils/logger.js';

class VisionAnalysisError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'VisionAnalysisError';
    this.cause = cause;
  }
}

class VisionAnalysisService {
  constructor() {
    this.client = new OpenAI({
      apiKey: environment.openai.apiKey
    });
    logger.info('VisionAnalysisService initialized');
  }

  _createSystemPrompt(contentDescription) {
    return `You are an assistant optimized for muting/unmuting the tv based on the user's preferences.

User's preferred content: ${contentDescription}.

With that in mind, follow these directions:

1. Analyze the provided photo to identify the content that appears on the tv screen.

2. Respond with a JSON object containing two fields: "tv_content_description" and "should_mute_tv".

3. For the "tv_content_description" field, respond with 2 short sentences.
The first sentence is a description of what you see on the tv screen. Only describe the content on the tv. Nothing else in the image.
The second sentence should evaluate if the content on the tv is the user's preferred content.

4. For the "should_mute_tv" field, assign a boolean value:
   - True: If the tv screen IS NOT showing ${contentDescription}
   - False: If the tv screen IS showing ${contentDescription}.`.trim();
  }

  async analyzeVideoContent(imageBase64, contentDescription) {
    logger.debug('Analyzing video content with OpenAI Vision API...');

    try {
      const systemPrompt = this._createSystemPrompt(contentDescription);

      const response = await this.client.responses.create({
        model: AI_CONFIG.MODEL,
        instructions: systemPrompt,
        reasoning: { effort: AI_CONFIG.REASONING_EFFORT },
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_image',
                image_url: imageBase64,
                detail: AI_CONFIG.IMAGE_DETAIL_LEVEL,
              },
            ],
          }
        ],
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: 'tv_analysis_result',
            schema: {
              type: 'object',
              properties: {
                tv_content_description: { type: 'string' },
                should_mute_tv: { type: 'boolean' }
              },
              required: ['tv_content_description', 'should_mute_tv'],
              additionalProperties: false
            },
            strict: true
          }
        }
      });

      logger.debug('Vision analysis completed successfully');
      return JSON.parse(response.output_text);
      
    } catch (error) {
      const analysisError = new VisionAnalysisError('Failed to analyze video content', error);
      logger.error('Vision analysis failed:', error);
      throw analysisError;
    }
  }
}

export const visionAnalysisService = new VisionAnalysisService();
import { AnalysisInput, AnalysisResult } from '../types/index.js';

// Placeholder deterministic analysis with clear seam for LLM integration
export async function analyzeContent(input: AnalysisInput): Promise<AnalysisResult> {
  const text = input.description.toLowerCase();
  const shouldLower = /loud|explosion|action|yell|shout/.test(text);
  return {
    description: input.description,
    verdict: shouldLower ? 'lower' : 'ok',
    confidence: shouldLower ? 0.8 : 0.7,
  };
}

export type AnalysisInput = {
  description: string;
  imageBase64?: string | null;
};

export type AnalysisResult = {
  description: string;
  verdict: 'ok' | 'lower';
  confidence: number; // 0..1
};

export class ApplicationError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
  }
}

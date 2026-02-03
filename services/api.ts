import { AdVariant, BrandBrief, GenerationResponse } from '../types';

export interface HealthStatus {
  cliAvailable: boolean;
  cliVersion?: string;
  apiKeyPresent: boolean;
  model: string;
  message?: string;
}

export const getHealth = async (): Promise<HealthStatus> => {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Health check failed');
  }
  return res.json();
};

export const generateAds = async (brief: BrandBrief): Promise<GenerationResponse> => {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Generation failed');
  }

  return res.json();
};

export const generateVisual = async (payload: {
  variant: AdVariant;
  brandName: string;
  productName: string;
  language: string;
  aspectRatio: string;
}): Promise<{ svg: string }> => {
  const res = await fetch('/api/generate-visual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || 'Visual generation failed');
  }

  return res.json();
};

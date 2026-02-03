import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from './promptBuilder.js';

test('buildPrompt includes key brief data and constraints', () => {
  const brief = {
    brandName: 'Nova',
    productName: 'Serum',
    category: 'Beauty',
    audience: 'Women 25-40',
    painPoints: 'Dull skin',
    benefits: 'Glow fast',
    offer: '-20%',
    differentiators: 'Clean',
    proof: '4.8/5',
    constraints: 'No medical claims',
    objective: 'Sales',
    placements: ['Feed', 'Reels'],
    aspectRatio: '4:5',
    tone: 'Warm',
    language: 'Français',
    variants: 3,
    budget: '2000',
  };

  const prompt = buildPrompt(brief);
  assert.match(prompt, /EXACTEMENT 3 variantes/i);
  assert.match(prompt, /Aspect ratio: 4:5/i);
  assert.match(prompt, /Chaque variante doit proposer un angle unique/i);
  assert.match(prompt, /FORMAT JSON STRICT/i);
});

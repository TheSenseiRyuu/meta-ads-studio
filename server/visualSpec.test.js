import test from 'node:test';
import assert from 'node:assert/strict';
import { getDimensions, getSafeZone, buildVisualPrompt } from './visualSpec.js';

test('getDimensions respects aspect ratio override', () => {
  const dimensions = getDimensions({ placement: 'Feed', aspectRatio: '1:1' });
  assert.deepEqual(dimensions, { width: 1080, height: 1080 });
});

test('getSafeZone returns stricter margins for 9:16', () => {
  const safeZone = getSafeZone({ placement: 'Stories', aspectRatio: '9:16' });
  assert.equal(safeZone.top, 12);
  assert.equal(safeZone.bottom, 20);
});

test('buildVisualPrompt includes size and safe zone specs', () => {
  const prompt = buildVisualPrompt({
    variant: {
      objective: 'Sales',
      tone: 'Warm',
      headline: 'Glow now',
      primaryText: 'Glow in 7 days.',
      offer: '',
      proof: '',
      cta: 'Shop Now',
      visualConcept: 'Minimal luxe',
      imagePrompt: 'Premium skincare ad',
    },
    brandName: 'Nova',
    productName: 'Serum',
    language: 'Français',
    aspectRatio: '4:5',
    placement: 'Feed',
  });
  assert.match(prompt, /Taille: 1080x1350/);
  assert.match(prompt, /SAFE ZONE/);
});

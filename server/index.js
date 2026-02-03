import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { buildPrompt } from './promptBuilder.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const execFileAsync = promisify(execFile);
const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const extractResponse = (payload) => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (payload.response) return payload.response;
  if (payload.output) return payload.output;
  if (payload.text) return payload.text;
  if (payload.candidates?.[0]?.content?.parts) {
    const textPart = payload.candidates[0].content.parts.find((part) => part.text);
    return textPart?.text || '';
  }
  return '';
};

const parseJsonSafe = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
};

const runGemini = async ({ prompt, model, responseType = 'json' }) => {
  const args = ['--prompt', prompt, '--output-format', 'json'];
  if (model) {
    args.push('--model', model);
  }

  const { stdout } = await execFileAsync('gemini', args, {
    env: process.env,
    maxBuffer: 1024 * 1024 * 10,
  });

  const parsed = parseJsonSafe(stdout);
  if (!parsed) {
    throw new Error('Gemini CLI returned non-JSON output.');
  }

  const responseText = extractResponse(parsed);
  if (!responseText) {
    throw new Error('Gemini CLI returned empty response.');
  }

  if (responseType === 'text') {
    return responseText;
  }

  const responseJson = parseJsonSafe(responseText);
  if (!responseJson) {
    throw new Error('Gemini response is not valid JSON.');
  }

  return responseJson;
};

app.get('/api/health', async (_req, res) => {
  try {
    const { stdout } = await execFileAsync('gemini', ['--version'], { env: process.env });
    const apiKeyPresent = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      cliAvailable: true,
      cliVersion: stdout.trim(),
      apiKeyPresent,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    });
  } catch (error) {
    res.json({
      cliAvailable: false,
      apiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      message: error?.message || 'Gemini CLI not available.',
    });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { brief } = req.body || {};
    if (!brief) {
      return res.status(400).json({ message: 'Brief manquant.' });
    }

    const prompt = buildPrompt(brief);
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const responseJson = await runGemini({ prompt, model, responseType: 'json' });

    return res.json(responseJson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Erreur Gemini CLI.',
    });
  }
});

const extractSvg = (text) => {
  if (!text) return null;
  const match = text.match(/<svg[\s\S]*?<\/svg>/i);
  return match ? match[0] : null;
};

app.post('/api/generate-visual', async (req, res) => {
  try {
    const { variant, brandName, productName, language, aspectRatio } = req.body || {};
    if (!variant) {
      return res.status(400).json({ message: 'Variant manquant.' });
    }

    const placement = variant.placement || 'Feed';
    const placementDimensions = {
      Feed: { width: 1080, height: 1350 },
      Reels: { width: 1080, height: 1920 },
      Stories: { width: 1080, height: 1920 },
      Explore: { width: 1080, height: 1080 },
      Messenger: { width: 1200, height: 628 },
    };
    const ratioDimensions = {
      '1:1': { width: 1080, height: 1080 },
      '4:5': { width: 1080, height: 1350 },
      '9:16': { width: 1080, height: 1920 },
      '1.91:1': { width: 1200, height: 628 },
    };

    const normalizedRatio = typeof aspectRatio === 'string' ? aspectRatio : 'Auto';
    const size =
      normalizedRatio !== 'Auto' && ratioDimensions[normalizedRatio]
        ? ratioDimensions[normalizedRatio]
        : placementDimensions[placement] || placementDimensions.Feed;

    const getSafeZone = () => {
      if (normalizedRatio === '9:16' || placement === 'Stories' || placement === 'Reels') {
        return { top: 12, bottom: 20, side: 6 };
      }
      if (normalizedRatio === '4:5' || placement === 'Feed') {
        return { top: 8, bottom: 10, side: 6 };
      }
      if (normalizedRatio === '1:1' || placement === 'Explore') {
        return { top: 8, bottom: 8, side: 8 };
      }
      if (normalizedRatio === '1.91:1' || placement === 'Messenger') {
        return { top: 10, bottom: 10, side: 8 };
      }
      return { top: 8, bottom: 8, side: 8 };
    };
    const safeZone = getSafeZone();
    const prompt = `
Tu es un designer senior spécialisé Meta Ads.
Crée un VISUEL publicitaire sous forme de SVG.
Le SVG doit être complet, autonome, et sans ressources externes.

MARQUE: ${brandName || ''}
PRODUIT: ${productName || ''}
PLACEMENT: ${placement}
ASPECT RATIO: ${normalizedRatio}
OBJECTIF: ${variant.objective}
TON: ${variant.tone}
LANGUE: ${language || 'Français'}

COPIES:
- Headline: ${variant.headline}
- Primary text: ${variant.primaryText}
- Offer: ${variant.offer || ''}
- Proof: ${variant.proof || ''}
- CTA: ${variant.cta}

CONCEPT: ${variant.visualConcept}
PROMPT IMAGE: ${variant.imagePrompt}

SPÉCIFICATIONS:
    - Taille: ${size.width}x${size.height}.
    - Inclure un fond élégant, un espace produit (placeholder graphique), et une zone texte lisible.
    - SAFE ZONE: laisser vides ${safeZone.top}% en haut, ${safeZone.bottom}% en bas, ${safeZone.side}% sur les côtés (pas de textes/logos critiques).
    - Utiliser des formes vectorielles simples, gradients doux, typographie lisible.
- Ne pas inclure d'images externes ni de textes personnels.
- Sortir UNIQUEMENT le SVG (commence par <svg> et finit par </svg>).
`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const responseText = await runGemini({ prompt, model, responseType: 'text' });
    const svg = extractSvg(responseText);

    if (!svg) {
      throw new Error('Impossible de générer un SVG valide.');
    }

    return res.json({ svg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Erreur génération visuel.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

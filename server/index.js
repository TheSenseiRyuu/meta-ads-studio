import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';
import { buildPrompt } from './promptBuilder.js';
import { buildVisualPrompt, getImageAspectRatio, PLACEMENTS } from './visualSpec.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const getAiClient = (apiKey) => new GoogleGenAI({ apiKey });

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

const createId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeVariants = (data, brief) => {
  if (!data?.variants || !Array.isArray(data.variants)) return data;
  const fallbackPlacement = brief?.placements?.[0] || 'Feed';
  const allowedCtas = new Set(['Shop Now', 'Learn More', 'Sign Up', 'Get Quote', 'Download']);

  return {
    ...data,
    variants: data.variants.map((variant, index) => {
      const placement = PLACEMENTS.includes(variant.placement) ? variant.placement : fallbackPlacement;
      const format = variant.format || `${placement} · ${brief?.aspectRatio || 'Auto'}`;
      const keywords = Array.isArray(variant.keywords)
        ? variant.keywords
        : String(variant.keywords || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
      return {
        ...variant,
        id: variant.id || `${createId()}-${index + 1}`,
        placement,
        format,
        keywords,
        cta: allowedCtas.has(variant.cta) ? variant.cta : 'Learn More',
        offer: variant.offer || '',
        proof: variant.proof || '',
        visualConcept: variant.visualConcept || `${variant.headline} - ${variant.primaryText}`,
        imagePrompt: variant.imagePrompt || `${variant.visualConcept} ${variant.primaryText}`,
      };
    }),
  };
};

const getTextFromResponse = (response) => {
  if (!response) return '';
  if (response.text) return response.text;
  const parts = response.candidates?.[0]?.content?.parts || [];
  const textPart = parts.find((part) => part.text);
  return textPart?.text || '';
};

app.get('/api/health', async (_req, res) => {
  try {
    const apiKeyPresent = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      cliAvailable: apiKeyPresent,
      cliVersion: apiKeyPresent ? 'API' : null,
      apiKeyPresent,
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
      imageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview',
      imageSize: process.env.GEMINI_IMAGE_SIZE || '2K',
    });
  } catch (error) {
    res.json({
      cliAvailable: false,
      apiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
      imageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview',
      imageSize: process.env.GEMINI_IMAGE_SIZE || '2K',
      message: error?.message || 'Gemini API not available.',
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
    const model = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
    const ai = getAiClient(process.env.GEMINI_API_KEY);
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const text = getTextFromResponse(response);
    const responseJson = parseJsonSafe(text);
    if (!responseJson) {
      throw new Error('Réponse Gemini invalide (JSON attendu).');
    }

    const normalized = normalizeVariants(responseJson, brief);

    return res.json(normalized);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Erreur Gemini API.',
    });
  }
});

app.post('/api/generate-visual', async (req, res) => {
  try {
    const { variant, brandName, productName, language, aspectRatio } = req.body || {};
    if (!variant) {
      return res.status(400).json({ message: 'Variant manquant.' });
    }

    const placement = variant.placement || 'Feed';
    const normalizedRatio = typeof aspectRatio === 'string' ? aspectRatio : 'Auto';
    const prompt = buildVisualPrompt({
      variant,
      brandName,
      productName,
      language,
      aspectRatio: normalizedRatio,
      placement,
    });

    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
    const imageSize = process.env.GEMINI_IMAGE_SIZE || '2K';
    const aspect = getImageAspectRatio({ placement, aspectRatio: normalizedRatio });
    const ai = getAiClient(process.env.GEMINI_API_KEY);
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          imageSize,
          aspectRatio: aspect,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData);
    if (!imagePart?.inlineData?.data) {
      throw new Error('Aucune image retournée par Gemini.');
    }

    return res.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Erreur génération image.',
    });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { apiKey, textModel, imageModel, imageSize } = req.body || {};
    if (!apiKey) {
      return res.status(400).json({ message: 'API key manquante.' });
    }
    process.env.GEMINI_API_KEY = apiKey;
    if (textModel) process.env.GEMINI_TEXT_MODEL = textModel;
    if (imageModel) process.env.GEMINI_IMAGE_MODEL = imageModel;
    if (imageSize) process.env.GEMINI_IMAGE_SIZE = imageSize;

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error?.message || 'Settings error.' });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

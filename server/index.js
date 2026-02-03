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

const parseRetryDelaySeconds = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }
  if (typeof value === 'number') return value;
  return null;
};

const formatGeminiError = (error) => {
  const status = error?.status || error?.code;
  const rawMessage = error?.message || '';
  let details;
  try {
    if (rawMessage.trim().startsWith('{')) {
      details = JSON.parse(rawMessage);
    }
  } catch {
    details = null;
  }
  const errorPayload = details?.error || {};
  const retryInfo = (errorPayload.details || []).find(
    (item) => item['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
  );
  const retryDelay = parseRetryDelaySeconds(retryInfo?.retryDelay);

  if (status === 429 || errorPayload.status === 'RESOURCE_EXHAUSTED' || /quota/i.test(rawMessage)) {
    return {
      status: 429,
      message:
        'Quota Gemini dépassé. Vérifie ton plan/billing ou réessaie plus tard.' +
        (retryDelay ? ` Réessaie dans ${retryDelay}s.` : ''),
      retryAfter: retryDelay,
    };
  }

  return {
    status: 500,
    message: rawMessage || 'Erreur Gemini API.',
    retryAfter: null,
  };
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
  const allowedCtas = new Set([
    'Shop Now',
    'Learn More',
    'Sign Up',
    'Get Quote',
    'Download',
    'Book Now',
    'Get Offer',
    'Contact Us',
    'Send Message',
    'Apply Now',
  ]);

  const preferredCta = allowedCtas.has(brief?.ctaPreference) ? brief.ctaPreference : null;
  const defaultDisplayLink = (() => {
    try {
      if (brief?.displayLink) return brief.displayLink;
      if (!brief?.destinationUrl) return '';
      const url = new URL(brief.destinationUrl);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return brief?.displayLink || '';
    }
  })();

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
      const hashtags = Array.isArray(variant.hashtags)
        ? variant.hashtags
        : String(variant.hashtags || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
      const primaryTextVariants = Array.isArray(variant.primaryTextVariants)
        ? variant.primaryTextVariants
        : variant.primaryText
          ? [variant.primaryText]
          : [];
      const headlineVariants = Array.isArray(variant.headlineVariants)
        ? variant.headlineVariants
        : variant.headline
          ? [variant.headline]
          : [];
      const descriptionVariants = Array.isArray(variant.descriptionVariants)
        ? variant.descriptionVariants
        : variant.description
          ? [variant.description]
          : [];
      return {
        ...variant,
        id: variant.id || `${createId()}-${index + 1}`,
        placement,
        format,
        keywords,
        hashtags,
        cta: allowedCtas.has(variant.cta) ? variant.cta : preferredCta || 'Learn More',
        primaryTextVariants,
        headlineVariants,
        descriptionVariants,
        destinationUrl: variant.destinationUrl || brief?.destinationUrl || '',
        displayLink: variant.displayLink || defaultDisplayLink || '',
        trackingParams: variant.trackingParams || brief?.trackingParams || '',
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

app.post('/api/models', async (req, res) => {
  try {
    const apiKey = req.body?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ message: 'API key manquante.' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ message: text || 'Erreur Google API.' });
    }

    const data = await response.json();
    const models = (data.models || [])
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => {
        const id = model.name?.replace('models/', '') || model.name;
        const displayName = model.displayName || model.name;
        const isImage = /image/i.test(id) || /image/i.test(displayName);
        return {
          id,
          name: model.name,
          displayName,
          supportedGenerationMethods: model.supportedGenerationMethods,
          isImage,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    const textModels = models.filter((model) => !model.isImage);
    const imageModels = models.filter((model) => model.isImage);

    return res.json({ models, textModels, imageModels });
  } catch (error) {
    return res.status(500).json({ message: error?.message || 'Erreur récupération modèles.' });
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
    const formatted = formatGeminiError(error);
    if (formatted.retryAfter) {
      res.set('Retry-After', String(formatted.retryAfter));
    }
    return res.status(formatted.status).json({
      message: formatted.message,
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
    const formatted = formatGeminiError(error);
    if (formatted.retryAfter) {
      res.set('Retry-After', String(formatted.retryAfter));
    }
    return res.status(formatted.status).json({
      message: formatted.message,
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

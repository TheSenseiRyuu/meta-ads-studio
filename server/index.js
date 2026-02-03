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

const runGemini = async ({ prompt, model }) => {
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
    const responseJson = await runGemini({ prompt, model });

    return res.json(responseJson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error?.message || 'Erreur Gemini CLI.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

# Meta Ads Studio

Studio multi-clients pour concevoir des briefs Meta Ads, générer des variantes de copy et des visuels via **Gemini API**.

## Fonctionnalités clés
- Structure claire **Clients → Concepts → Briefs**.
- Pages dédiées (pas de one‑pager) : dashboard, client, concept, brief, settings.
- Brief complet (marque, offre, audience, placements, CTA, variations, conformité, etc.).
- Génération de **stratégie** + **QA** + **variantes d’ads** (primary text, headline, description, CTA).
- **Multi‑text options** (variations de primary text / headline / description).
- Génération d’images avec ratios Meta + **safe zones** visuelles.
- Variantes **éditables** + **copiables**, export JSON, favoris.
- **Regénération en copie** (on ne détruit jamais un brief existant).
- Stockage local (localStorage) pour tout le workspace.

## Pages
- `/` : Dashboard (liste des clients)
- `/settings` : Paramètres globaux Gemini
- `/client/:clientId` : Vue client + concepts
- `/client/:clientId/concept/:conceptId` : Vue concept + briefs
- `/client/:clientId/concept/:conceptId/brief/:briefId` : Vue brief (génération + variantes)

## Setup
```bash
cp .env.example .env.local
npm install
npm run dev
```

Vite: `http://localhost:5173`  
API: `http://localhost:8787`

## Paramètres Gemini
- La **clé API** est stockée en **localStorage** (côté navigateur).
- Le serveur reçoit la config via `/api/settings` (en mémoire, pour la session en cours).
- La liste des **modèles** est chargée en live via `/api/models`.

## API
- `POST /api/settings` : applique la clé + modèles côté serveur
- `POST /api/models` : récupère les modèles disponibles depuis Google
- `POST /api/generate` : génère stratégie + variantes d’ads
- `POST /api/generate-visual` : génère une image pour une variante
- `GET /api/health` : statut API

## Quotas Gemini
Si tu vois un **429 / RESOURCE_EXHAUSTED**, c’est un quota Google (tier ou billing).  
Réf : https://ai.google.dev/gemini-api/docs/rate-limits

## Documentation utile
- Meta Advantage+ creative (variations texte, optimisations):
  https://www.facebook.com/business/ads/meta-advantage-plus/creative
- Champs créa Meta (primary text, headline, description, CTA):
  https://www.facebook.com/business/ads/automation/tailored-campaigns
- Gemini API rate limits:
  https://ai.google.dev/gemini-api/docs/rate-limits

## Variables d’environnement (optionnelles)
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL` (ex: `gemini-2.5-flash`)
- `GEMINI_IMAGE_MODEL` (ex: `gemini-3-pro-image-preview`)
- `GEMINI_IMAGE_SIZE` (`2K` ou `4K`)

## Tests
```bash
npm run test
```

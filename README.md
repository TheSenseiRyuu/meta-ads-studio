# Meta Ads Studio

Webapp full-stack qui génère des Ads Meta (copy + direction créative + prompts visuels) en s’appuyant sur **Gemini API** côté serveur.

## Fonctionnalités
- Brief complet marque/produit/audience.
- Stratégie créative + insights + angles + hooks.
- Variantes Ads prêtes à déployer (CTA, headline, description, placements).
- Génération de visuels SVG par variante.
- Sélection des formats Meta (1:1, 4:5, 9:16, 1.91:1) + safe zones.
- Export JSON.
- Historique local.

## Prérequis
- `GEMINI_API_KEY` configurée.

## Setup
```bash
cp .env.example .env.local
# Ajoute ta clé Gemini dans .env.local
npm install
npm run dev
```

L’app démarre sur `http://localhost:5173` et l’API sur `http://localhost:8787`.

## Notes
- L’API utilise Google Gemini API (`@google/genai`) côté serveur.
- Génération d’images avec `gemini-3-pro-image-preview`.

## Variables d’environnement
- `GEMINI_API_KEY`
- `GEMINI_TEXT_MODEL` (ex: `gemini-2.5-flash`)
- `GEMINI_IMAGE_MODEL` (ex: `gemini-3-pro-image-preview`)
- `GEMINI_IMAGE_SIZE` (`2K` ou `4K`)

## Settings UI
- Onglet Settings dans l’app pour définir API key + modèles.
- Stockage local (localStorage) pour éviter de ressaisir la clé à chaque refresh.

## Tests
```bash
npm run test
```

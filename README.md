# Meta Ads Studio

Webapp full-stack qui génère des Ads Meta (copy + direction créative + prompts visuels) en s’appuyant sur **Gemini CLI** côté serveur.

## Fonctionnalités
- Brief complet marque/produit/audience.
- Stratégie créative + insights + angles + hooks.
- Variantes Ads prêtes à déployer (CTA, headline, description, placements).
- Export JSON.
- Historique local.

## Prérequis
- Gemini CLI installé et authentifié.
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
- L’API utilise Gemini CLI en mode headless JSON.
- Aucun appel direct à l’API Gemini depuis le front-end.

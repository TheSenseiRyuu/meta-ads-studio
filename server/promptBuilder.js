const sanitize = (value) => {
  if (!value) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

export const buildPrompt = (brief) => {
  const placements = brief.placements?.length ? brief.placements.join(', ') : 'Feed';
  const variants = Number(brief.variants || 6);
  const language = sanitize(brief.language || 'Français');

  return `
Tu es un directeur créatif senior spécialisé en Meta Ads.
Objectif: générer une stratégie et ${variants} variantes d'annonces prêtes à publier.

BRIEF:
- Marque: ${sanitize(brief.brandName)}
- Produit: ${sanitize(brief.productName)}
- Catégorie: ${sanitize(brief.category)}
- Audience: ${sanitize(brief.audience)}
- Pain points: ${sanitize(brief.painPoints)}
- Bénéfices: ${sanitize(brief.benefits)}
- Offre: ${sanitize(brief.offer)}
- Différenciateurs: ${sanitize(brief.differentiators)}
- Preuves: ${sanitize(brief.proof)}
- Contraintes: ${sanitize(brief.constraints)}
- Objectif: ${sanitize(brief.objective)}
- Placements: ${placements}
- Tonalité: ${sanitize(brief.tone)}
- Langue: ${language}
- Budget: ${sanitize(brief.budget)}

RÈGLES IMPORTANTES:
- Respecter les politiques Meta Ads (pas d'attributs personnels, pas de promesses médicales, pas de claims non prouvés).
- Chaque variante doit proposer un angle unique.
- Écrire en ${language}.
- Retourner UNIQUEMENT du JSON valide. Pas de markdown, pas de commentaires.

FORMAT JSON STRICT (respecter les clés et types) :
{
  "strategy": {
    "positioning": "string",
    "corePromise": "string",
    "audienceInsights": ["string"],
    "angles": ["string"],
    "hooks": ["string"],
    "creativeDirections": ["string"],
    "do": ["string"],
    "dont": ["string"]
  },
  "variants": [
    {
      "id": "string",
      "name": "string",
      "placement": "Feed | Reels | Stories | Explore | Messenger",
      "objective": "${sanitize(brief.objective)}",
      "format": "string",
      "primaryText": "string",
      "headline": "string",
      "description": "string",
      "cta": "string",
      "hook": "string",
      "visualConcept": "string",
      "imagePrompt": "string",
      "proof": "string",
      "offer": "string",
      "tone": "string",
      "keywords": ["string"]
    }
  ],
  "qa": {
    "policyRisks": ["string"],
    "suggestions": ["string"]
  }
}

Consignes pour les variants:
- primaryText: 2 à 4 phrases max.
- headline: court, punchy, orienté bénéfice.
- description: 1 phrase.
- imagePrompt: préciser angle, composition, style, placement.
- cta: choisir parmi "Shop Now", "Learn More", "Sign Up", "Get Quote", "Download".
`;
};

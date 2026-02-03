const sanitize = (value) => {
  if (!value) return '';
  return String(value).replace(/\s+/g, ' ').trim();
};

export const buildPrompt = (brief) => {
  const placements = brief.placements?.length ? brief.placements.join(', ') : 'Feed';
  const variants = Number(brief.variants || 6);
  const language = sanitize(brief.language || 'Français');
  const aspectRatio = sanitize(brief.aspectRatio || 'Auto');
  const primaryTextVariants = Number(brief.primaryTextVariations || 3);
  const headlineVariants = Number(brief.headlineVariations || 3);
  const descriptionVariants = Number(brief.descriptionVariations || 2);
  const adFormat = sanitize(brief.adFormat || 'Single Image');

  return `
Tu es un directeur créatif senior + performance marketer spécialisé en Meta Ads.
Objectif: générer une stratégie haut de gamme et EXACTEMENT ${variants} variantes d'annonces prêtes à publier.
Niveau de qualité attendu: premium, conversion-ready, stop-scroll.

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
- Aspect ratio: ${aspectRatio} (Meta formats)
- Tonalité: ${sanitize(brief.tone)}
- Langue: ${language}
- Budget: ${sanitize(brief.budget)}
- Format: ${adFormat}
- URL destination: ${sanitize(brief.destinationUrl)}
- Display link: ${sanitize(brief.displayLink)}
- Tracking params: ${sanitize(brief.trackingParams)}
- CTA préféré: ${sanitize(brief.ctaPreference)}
- Variations primary text: ${primaryTextVariants}
- Variations headline: ${headlineVariants}
- Variations description: ${descriptionVariants}
- Notes créatives: ${sanitize(brief.creativeNotes)}
- Lead magnet (si leads): ${sanitize(brief.leadMagnet)}
- App name (si app installs): ${sanitize(brief.appName)}
- App store URL (si app installs): ${sanitize(brief.appStoreUrl)}
- Prix (si applicable): ${sanitize(brief.price)}
- Fin de promo (si applicable): ${sanitize(brief.promoEndDate)}
- Témoignage (si applicable): ${sanitize(brief.testimonial)}
- Emojis autorisés: ${brief.includeEmojis ? 'oui' : 'non'}
- Hashtags autorisés: ${brief.includeHashtags ? 'oui' : 'non'}

RÈGLES IMPORTANTES:
- Respecter les politiques Meta Ads (pas d'attributs personnels, pas de promesses médicales, pas de claims non prouvés).
- Éviter les formulations sensibles: “avant/après”, “garanti”, “miracle”, “tu as”.
- Chaque variante doit proposer un angle unique + un hook distinct.
- Distribuer les placements si plusieurs sont sélectionnés.
- Écrire en ${language}.
- Utiliser les champs Meta Ads standards: Primary Text, Headline, Description, Call to Action, Destination URL, Display Link.
- Respecter le CTA préféré s'il est renseigné.
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
      "primaryTextVariants": ["string"],
      "headline": "string",
      "headlineVariants": ["string"],
      "description": "string",
      "descriptionVariants": ["string"],
      "cta": "string",
      "destinationUrl": "string",
      "displayLink": "string",
      "trackingParams": "string",
      "hook": "string",
      "visualConcept": "string",
      "imagePrompt": "string",
      "proof": "string",
      "offer": "string",
      "tone": "string",
      "keywords": ["string"],
      "hashtags": ["string"]
    }
  ],
  "qa": {
    "policyRisks": ["string"],
    "suggestions": ["string"]
  }
}

Consignes pour les variants:
- primaryText: message clé au début, sans saut de ligne. Variante courte <= 80 caractères, medium <= 125, long <= 200.
- primaryTextVariants: ${primaryTextVariants} variations (courte, medium, long si possible).
- headline: concis, bénéfice clair, <= 40 caractères (une version ultra courte <= 27).
- headlineVariants: ${headlineVariants} variations.
- description: 1 phrase courte <= 30 caractères.
- descriptionVariants: ${descriptionVariants} variations.
- hook: 6-10 mots max (stop-scroll).
- imagePrompt: ultra détaillé (sujet, contexte, composition, palette, lumière, style, safe zone).
- visualConcept: 1-2 phrases, focalisé sur la mise en page publicitaire.
- keywords: 5-8 mots-clés actionnables.
- hashtags: 0-4 hashtags max si autorisés, sinon tableau vide.
- cta: choisir parmi "Shop Now", "Learn More", "Sign Up", "Get Quote", "Download", "Book Now", "Get Offer", "Contact Us", "Send Message", "Apply Now".
- destinationUrl: utiliser l'URL si fournie, sinon laisser vide.
- displayLink: utiliser si fourni, sinon générer proprement (domaine lisible).
- trackingParams: inclure si fournis (UTM).

Consignes qualité imagePrompt:
- Mentionner l’aspect ratio ${aspectRatio} et le placement.
- Décrire un design publicitaire premium: hiérarchie claire (headline, subline, CTA), zone produit, espace respirant.
- Spécifier la palette (2-3 couleurs), textures, matériaux, profondeur (ombres douces, lumière directionnelle).
- Indiquer “safe zones” (zones vides en haut/bas/côtés).
- Format: une seule ligne de texte (pas de listes).
`;
};

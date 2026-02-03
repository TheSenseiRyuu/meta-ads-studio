export const PLACEMENTS = ['Feed', 'Reels', 'Stories', 'Explore', 'Messenger'];

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

export const getDimensions = ({ placement, aspectRatio }) => {
  if (aspectRatio && aspectRatio !== 'Auto' && ratioDimensions[aspectRatio]) {
    return ratioDimensions[aspectRatio];
  }
  return placementDimensions[placement] || placementDimensions.Feed;
};

export const getSafeZone = ({ placement, aspectRatio }) => {
  if (aspectRatio === '9:16' || placement === 'Stories' || placement === 'Reels') {
    return { top: 12, bottom: 20, side: 6 };
  }
  if (aspectRatio === '4:5' || placement === 'Feed') {
    return { top: 8, bottom: 10, side: 6 };
  }
  if (aspectRatio === '1:1' || placement === 'Explore') {
    return { top: 8, bottom: 8, side: 8 };
  }
  if (aspectRatio === '1.91:1' || placement === 'Messenger') {
    return { top: 10, bottom: 10, side: 8 };
  }
  return { top: 8, bottom: 8, side: 8 };
};

export const buildVisualPrompt = ({
  variant,
  brandName,
  productName,
  language,
  aspectRatio,
  placement,
}) => {
  const size = getDimensions({ placement, aspectRatio });
  const safeZone = getSafeZone({ placement, aspectRatio });

  return `
Tu es un designer senior spécialisé Meta Ads.
Crée un VISUEL publicitaire sous forme de SVG.
Le SVG doit être complet, autonome, et sans ressources externes.

MARQUE: ${brandName || ''}
PRODUIT: ${productName || ''}
PLACEMENT: ${placement}
ASPECT RATIO: ${aspectRatio}
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

SPÉCIFICATIONS DESIGN:
- Taille: ${size.width}x${size.height}. Ajouter viewBox="0 0 ${size.width} ${size.height}".
- Style premium: hiérarchie typographique claire, 2-3 couleurs max, contraste élevé.
- Inclure: fond travaillé + zone produit (placeholder élégant) + bloc texte lisible + bouton CTA.
- SAFE ZONE: laisser vides ${safeZone.top}% en haut, ${safeZone.bottom}% en bas, ${safeZone.side}% sur les côtés (pas de textes/logos critiques).
- Utiliser des formes vectorielles simples, gradients doux, légère profondeur (ombre subtile, halo).
- Typo: font-family "Manrope, Space Grotesk, sans-serif", tailles nettes.
- Aucun lien/asset externe. Ne pas dessiner la safe zone, elle doit rester invisible.
- Sortir UNIQUEMENT le SVG (commence par <svg> et finit par </svg>).
`;
};

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
  '16:9': { width: 1280, height: 720 },
};

export const getDimensions = ({ placement, aspectRatio }) => {
  if (aspectRatio && aspectRatio !== 'Auto' && ratioDimensions[aspectRatio]) {
    return ratioDimensions[aspectRatio];
  }
  return placementDimensions[placement] || placementDimensions.Feed;
};

export const getImageAspectRatio = ({ placement, aspectRatio }) => {
  if (aspectRatio && aspectRatio !== 'Auto') {
    if (aspectRatio === '1.91:1') return '16:9';
    return aspectRatio;
  }
  if (placement === 'Stories' || placement === 'Reels') return '9:16';
  if (placement === 'Explore') return '1:1';
  if (placement === 'Messenger') return '16:9';
  return '4:5';
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
Crée un VISUEL publicitaire haute résolution (image).
Le rendu doit être propre, premium, et prêt pour diffusion.

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
- Taille cible: ${size.width}x${size.height}.
- Style premium: hiérarchie typographique claire, 2-3 couleurs max, contraste élevé.
- Inclure: fond travaillé + zone produit (placeholder élégant) + bloc texte lisible + bouton CTA.
- SAFE ZONE: laisser vides ${safeZone.top}% en haut, ${safeZone.bottom}% en bas, ${safeZone.side}% sur les côtés (pas de textes/logos critiques).
- Lumière studio, ombres douces, profondeur subtile.
- Composition publicitaire nette, pas de texte illisible.
- Sortir une image publicitaire de haute qualité.
`;
};

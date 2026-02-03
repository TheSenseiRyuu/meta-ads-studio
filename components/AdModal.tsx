import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Image as ImageIcon, Heart, Download, Wand2 } from 'lucide-react';
import { AdVariant } from '../types';
import { Button } from './Button';

interface AdModalProps {
  variant: AdVariant | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onGenerateVisual: (variant: AdVariant) => void;
  isGeneratingVisual: boolean;
  onDownloadVisual: (variant: AdVariant) => void;
  aspectRatio: string;
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};

export const AdModal: React.FC<AdModalProps> = ({
  variant,
  onClose,
  onToggleFavorite,
  onGenerateVisual,
  isGeneratingVisual,
  onDownloadVisual,
  aspectRatio,
}) => {
  const getSafeZone = () => {
    if (!variant) return { top: 8, bottom: 8, side: 8 };
    if (aspectRatio === '9:16' || variant.placement === 'Stories' || variant.placement === 'Reels') {
      return { top: 12, bottom: 20, side: 6 };
    }
    if (aspectRatio === '4:5' || variant.placement === 'Feed') {
      return { top: 8, bottom: 10, side: 6 };
    }
    if (aspectRatio === '1:1' || variant.placement === 'Explore') {
      return { top: 8, bottom: 8, side: 8 };
    }
    if (aspectRatio === '1.91:1' || variant.placement === 'Messenger') {
      return { top: 10, bottom: 10, side: 8 };
    }
    return { top: 8, bottom: 8, side: 8 };
  };

  const safeZone = getSafeZone();

  useEffect(() => {
    if (!variant) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [variant, onClose]);

  return (
    <AnimatePresence>
      {variant && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-zinc-950/95 border-b border-zinc-800 px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  {variant.placement}
                </p>
                <h2 className="text-2xl font-display text-white">{variant.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(variant.id)}
                  aria-label="Ajouter aux favoris"
                  className={`p-2 rounded-full border ${
                    variant.favorite
                      ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                      : 'border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${variant.favorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Fermer"
                  className="p-2 rounded-full border border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 text-sm text-zinc-200 px-6 pb-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Visual</p>
                    <p className="text-sm text-zinc-200">Génération de visuel</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Wand2 className="w-4 h-4" />}
                      isLoading={isGeneratingVisual}
                      onClick={() => onGenerateVisual(variant)}
                    >
                      Générer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => onDownloadVisual(variant)}
                      disabled={!variant.visualImage}
                    >
                      Télécharger
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mb-3">
                  Safe zone: haut {safeZone.top}% · bas {safeZone.bottom}% · côtés {safeZone.side}%.
                </p>
                {variant.visualImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-white">
                    <img
                      alt={`Visuel ${variant.name}`}
                      className="w-full h-auto"
                      src={variant.visualImage}
                    />
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute border border-dashed border-emerald-300/60 bg-emerald-400/10"
                        style={{
                          top: `${safeZone.top}%`,
                          bottom: `${safeZone.bottom}%`,
                          left: `${safeZone.side}%`,
                          right: `${safeZone.side}%`,
                        }}
                      ></div>
                      <div className="absolute left-3 top-3 rounded-full bg-zinc-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
                        Safe zone
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    Aucun visuel généré pour cette variante.
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Primary Text</p>
                    <button
                      onClick={() => copyToClipboard(variant.primaryText)}
                      aria-label="Copier le texte principal"
                      className="text-xs text-emerald-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copier
                    </button>
                  </div>
                  <p>{variant.primaryText}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Headline</p>
                  <p className="mt-2 text-lg font-display text-white">{variant.headline}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-zinc-400">Description</p>
                  <p className="mt-2 text-zinc-300">{variant.description}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Hook & CTA</p>
                <p className="mt-2 text-zinc-100">{variant.hook}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  {variant.cta}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Concept visuel</p>
                <p className="mt-2 text-zinc-200">{variant.visualConcept}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200">
                  <ImageIcon className="w-4 h-4" />
                  Prompt image
                </div>
                <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                  {variant.imagePrompt}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Offre</p>
                  <p className="mt-2">{variant.offer || '—'}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Preuve</p>
                  <p className="mt-2">{variant.proof || '—'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Keywords</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variant.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 rounded-full text-xs border border-zinc-700 text-zinc-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

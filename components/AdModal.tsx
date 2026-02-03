import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Image as ImageIcon, Heart } from 'lucide-react';
import { AdVariant } from '../types';

interface AdModalProps {
  variant: AdVariant | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};

export const AdModal: React.FC<AdModalProps> = ({ variant, onClose, onToggleFavorite }) => {
  return (
    <AnimatePresence>
      {variant && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  {variant.placement}
                </p>
                <h2 className="text-2xl font-display text-white">{variant.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(variant.id)}
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
                  className="p-2 rounded-full border border-zinc-700 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 text-sm text-zinc-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Primary Text</p>
                    <button
                      onClick={() => copyToClipboard(variant.primaryText)}
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

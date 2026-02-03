import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, Megaphone, ArrowUpRight } from 'lucide-react';
import { AdVariant } from '../types';

interface AdGridProps {
  variants: AdVariant[];
  isGenerating?: boolean;
  onSelect: (variant: AdVariant) => void;
  onToggleFavorite: (id: string) => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
  exit: { opacity: 0, scale: 0.9 },
};

const SkeletonCard = () => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 h-[220px] p-5 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] animate-[shimmer_1.5s_infinite]"></div>
    <style>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
    <div className="relative z-10 space-y-4">
      <div className="w-24 h-3 bg-zinc-700 rounded-full"></div>
      <div className="w-full h-8 bg-zinc-800 rounded-lg"></div>
      <div className="w-2/3 h-3 bg-zinc-700 rounded-full"></div>
      <div className="w-1/2 h-3 bg-zinc-700 rounded-full"></div>
    </div>
  </motion.div>
);

export const AdGrid: React.FC<AdGridProps> = ({
  variants,
  isGenerating,
  onSelect,
  onToggleFavorite,
}) => {
  if (variants.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <div className="w-16 h-16 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center mb-4">
          <Megaphone className="w-7 h-7 text-emerald-300" />
        </div>
        <p className="text-lg font-display text-zinc-200">Aucune variant encore</p>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs text-center">
          Lance la génération pour remplir le board avec des ads prêtes à scaler.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence>
        {isGenerating && <SkeletonCard key="skeleton" />}
      </AnimatePresence>
      <AnimatePresence mode="popLayout">
        {variants.map((variant) => (
          <motion.div
            key={variant.id}
            layout
            variants={itemVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={() => onSelect(variant)}
            className="group cursor-pointer rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '240px' }}
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
              <span className="uppercase tracking-[0.3em]">{variant.placement}</span>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(variant.id);
                }}
                aria-label="Ajouter aux favoris"
                className={`p-2 rounded-full border transition-colors ${
                  variant.favorite
                    ? 'bg-rose-500/20 text-rose-200 border-rose-400/40'
                    : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${variant.favorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h3 className="text-lg text-white font-display mb-2">{variant.name}</h3>
            {variant.visualImage && (
              <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-emerald-200 mb-3">
                Visual prêt
              </span>
            )}
            <p className="text-sm text-zinc-300 line-clamp-3 mb-4">
              {variant.primaryText}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{variant.cta}</span>
              <span className="flex items-center gap-1 text-emerald-300">
                Ouvrir
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

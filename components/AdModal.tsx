import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Image as ImageIcon,
  Heart,
  Download,
  Wand2,
  Pencil,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AdVariant } from '../types';
import { Button } from './Button';

interface AdModalProps {
  variant: AdVariant | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onGenerateVisual: (variant: AdVariant) => void;
  isGeneratingVisual: boolean;
  onDownloadVisual: (variant: AdVariant) => void;
  onUpdateVariant: (variant: AdVariant) => void;
  aspectRatio: string;
}

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  }
};

const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label = 'Copier' }) => (
  <button
    onClick={() => copyToClipboard(text)}
    aria-label={label}
    className="text-xs text-emerald-300 flex items-center gap-1"
  >
    <Copy className="w-3 h-3" /> {label}
  </button>
);

const formatLines = (items: string[] | undefined) =>
  (items || []).filter(Boolean).join('\n');

export const AdModal: React.FC<AdModalProps> = ({
  variant,
  onClose,
  onToggleFavorite,
  onGenerateVisual,
  isGeneratingVisual,
  onDownloadVisual,
  onUpdateVariant,
  aspectRatio,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AdVariant | null>(null);

  const safeZone = useMemo(() => {
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
  }, [variant, aspectRatio]);

  useEffect(() => {
    if (!variant) return;
    setDraft(variant);
    setIsEditing(false);
  }, [variant?.id]);

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

  const handleUpdate = <K extends keyof AdVariant>(key: K, value: AdVariant[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!draft) return;
    onUpdateVariant(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(variant);
    setIsEditing(false);
  };

  const copyAll = () => {
    if (!variant) return;
    const payload = `
Placement: ${variant.placement}
Name: ${variant.name}
Primary text: ${variant.primaryText}
Headline: ${variant.headline}
Description: ${variant.description}
CTA: ${variant.cta}
Destination URL: ${variant.destinationUrl || ''}
Display link: ${variant.displayLink || ''}
Tracking params: ${variant.trackingParams || ''}
Hook: ${variant.hook}
Visual concept: ${variant.visualConcept}
Image prompt: ${variant.imagePrompt}
Offer: ${variant.offer || ''}
Proof: ${variant.proof || ''}
Keywords: ${(variant.keywords || []).join(', ')}
Hashtags: ${(variant.hashtags || []).join(' ')}
`.trim();
    copyToClipboard(payload);
  };

  const current = draft || variant;

  return (
    <AnimatePresence>
      {variant && current && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                <Button variant="ghost" size="sm" icon={<Copy className="w-4 h-4" />} onClick={copyAll}>
                  Tout copier
                </Button>
                {isEditing ? (
                  <>
                    <Button variant="secondary" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleSave}>
                      Enregistrer
                    </Button>
                    <Button variant="outline" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={handleCancel}>
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" size="sm" icon={<Pencil className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
                    Éditer
                  </Button>
                )}
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
                    <CopyButton text={current.primaryText} />
                  </div>
                  {isEditing ? (
                    <textarea
                      value={current.primaryText}
                      onChange={(e) => handleUpdate('primaryText', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none min-h-[90px]"
                    />
                  ) : (
                    <p>{current.primaryText}</p>
                  )}

                  {current.primaryTextVariants?.length ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Variations</p>
                      {isEditing ? (
                        <textarea
                          value={formatLines(current.primaryTextVariants)}
                          onChange={(e) =>
                            handleUpdate(
                              'primaryTextVariants',
                              e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                            )
                          }
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none min-h-[90px]"
                        />
                      ) : (
                        current.primaryTextVariants.map((item, index) => (
                          <div key={`${item}-${index}`} className="flex items-start justify-between gap-2">
                            <p className="text-xs text-zinc-300">{item}</p>
                            <CopyButton text={item} label="Copier" />
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Headline</p>
                    <CopyButton text={current.headline} />
                  </div>
                  {isEditing ? (
                    <input
                      value={current.headline}
                      onChange={(e) => handleUpdate('headline', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-lg font-display text-white">{current.headline}</p>
                  )}

                  {current.headlineVariants?.length ? (
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Variations</p>
                      {isEditing ? (
                        <textarea
                          value={formatLines(current.headlineVariants)}
                          onChange={(e) =>
                            handleUpdate(
                              'headlineVariants',
                              e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                            )
                          }
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none min-h-[70px]"
                        />
                      ) : (
                        current.headlineVariants.map((item, index) => (
                          <div key={`${item}-${index}`} className="flex items-start justify-between gap-2">
                            <p className="text-xs text-zinc-300">{item}</p>
                            <CopyButton text={item} label="Copier" />
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}

                  <div className="pt-2 border-t border-zinc-800/70">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Description</p>
                      <CopyButton text={current.description} />
                    </div>
                    {isEditing ? (
                      <input
                        value={current.description}
                        onChange={(e) => handleUpdate('description', e.target.value)}
                        className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      />
                    ) : (
                      <p className="mt-2 text-zinc-300">{current.description}</p>
                    )}
                    {current.descriptionVariants?.length ? (
                      <div className="mt-3 space-y-2">
                        {isEditing ? (
                          <textarea
                            value={formatLines(current.descriptionVariants)}
                            onChange={(e) =>
                              handleUpdate(
                                'descriptionVariants',
                                e.target.value.split('\n').map((line) => line.trim()).filter(Boolean)
                              )
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none min-h-[60px]"
                          />
                        ) : (
                          current.descriptionVariants.map((item, index) => (
                            <div key={`${item}-${index}`} className="flex items-start justify-between gap-2">
                              <p className="text-xs text-zinc-300">{item}</p>
                              <CopyButton text={item} label="Copier" />
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Hook & CTA</p>
                  <CopyButton text={`${current.hook}\n${current.cta}`} label="Copier" />
                </div>
                {isEditing ? (
                  <div className="grid gap-3 mt-2">
                    <input
                      value={current.hook}
                      onChange={(e) => handleUpdate('hook', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                    <input
                      value={current.cta}
                      onChange={(e) => handleUpdate('cta', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-zinc-100">{current.hook}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                      {current.cta}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Destination</p>
                  <CopyButton
                    text={`${current.destinationUrl || ''}\n${current.displayLink || ''}\n${current.trackingParams || ''}`}
                    label="Copier"
                  />
                </div>
                {isEditing ? (
                  <div className="grid gap-3 mt-2">
                    <input
                      value={current.destinationUrl || ''}
                      onChange={(e) => handleUpdate('destinationUrl', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      placeholder="URL destination"
                    />
                    <input
                      value={current.displayLink || ''}
                      onChange={(e) => handleUpdate('displayLink', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      placeholder="Display link"
                    />
                    <input
                      value={current.trackingParams || ''}
                      onChange={(e) => handleUpdate('trackingParams', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                      placeholder="Tracking params"
                    />
                  </div>
                ) : (
                  <div className="mt-2 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500">URL</p>
                      <p className="text-zinc-200 break-all">{current.destinationUrl || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-zinc-500">Display link</p>
                        <p className="text-zinc-200">{current.displayLink || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Tracking params</p>
                        <p className="text-zinc-200">{current.trackingParams || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Concept visuel</p>
                  <CopyButton text={`${current.visualConcept}\n${current.imagePrompt}`} label="Copier" />
                </div>
                {isEditing ? (
                  <div className="grid gap-3 mt-2">
                    <textarea
                      value={current.visualConcept}
                      onChange={(e) => handleUpdate('visualConcept', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none min-h-[80px]"
                    />
                    <textarea
                      value={current.imagePrompt}
                      onChange={(e) => handleUpdate('imagePrompt', e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none min-h-[90px]"
                    />
                  </div>
                ) : (
                  <>
                    <p className="mt-2 text-zinc-200">{current.visualConcept}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200">
                      <ImageIcon className="w-4 h-4" />
                      Prompt image
                    </div>
                    <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                      {current.imagePrompt}
                    </div>
                  </>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Offre</p>
                    <CopyButton text={current.offer || ''} label="Copier" />
                  </div>
                  {isEditing ? (
                    <input
                      value={current.offer}
                      onChange={(e) => handleUpdate('offer', e.target.value)}
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-2">{current.offer || '—'}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Preuve</p>
                    <CopyButton text={current.proof || ''} label="Copier" />
                  </div>
                  {isEditing ? (
                    <input
                      value={current.proof}
                      onChange={(e) => handleUpdate('proof', e.target.value)}
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-2">{current.proof || '—'}</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Keywords</p>
                  <CopyButton text={(current.keywords || []).join(', ')} label="Copier" />
                </div>
                {isEditing ? (
                  <input
                    value={(current.keywords || []).join(', ')}
                    onChange={(e) =>
                      handleUpdate(
                        'keywords',
                        e.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(current.keywords || []).map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 rounded-full text-xs border border-zinc-700 text-zinc-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Hashtags</p>
                  <CopyButton text={(current.hashtags || []).join(' ')} label="Copier" />
                </div>
                {isEditing ? (
                  <input
                    value={(current.hashtags || []).join(' ')}
                    onChange={(e) =>
                      handleUpdate(
                        'hashtags',
                        e.target.value.split(' ').map((item) => item.trim()).filter(Boolean)
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(current.hashtags || []).length === 0 ? (
                      <span className="text-xs text-zinc-500">—</span>
                    ) : (
                      current.hashtags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs border border-zinc-700 text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

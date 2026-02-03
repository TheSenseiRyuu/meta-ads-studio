import React from 'react';
import { BrandBrief, Placement, Tone, Objective, AspectRatio } from '../types';
import { Button } from './Button';
import { Sparkles, Zap, Target, Megaphone, SlidersHorizontal } from 'lucide-react';

interface BriefFormProps {
  brief: BrandBrief;
  onChange: (brief: BrandBrief) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const placementOptions: Placement[] = ['Feed', 'Reels', 'Stories', 'Explore', 'Messenger'];
const toneOptions: Tone[] = ['Bold', 'Playful', 'Minimal', 'Luxury', 'Direct', 'Warm', 'Technical'];
const objectiveOptions: Objective[] = ['Sales', 'Leads', 'Traffic', 'App Installs', 'Awareness'];
const aspectRatioOptions: { value: AspectRatio; label: string; hint: string }[] = [
  { value: 'Auto', label: 'Auto', hint: 'Use placement' },
  { value: '1:1', label: '1:1', hint: 'Feed / Explore' },
  { value: '4:5', label: '4:5', hint: 'Feed vertical' },
  { value: '9:16', label: '9:16', hint: 'Stories / Reels' },
  { value: '1.91:1', label: '1.91:1', hint: 'Landscape' },
];

export const BriefForm: React.FC<BriefFormProps> = ({ brief, onChange, onGenerate, isGenerating }) => {
  const updateField = <K extends keyof BrandBrief>(key: K, value: BrandBrief[K]) => {
    onChange({ ...brief, [key]: value });
  };
  const canGenerate = Boolean(brief.brandName.trim() && brief.productName.trim());

  const togglePlacement = (placement: Placement) => {
    const exists = brief.placements.includes(placement);
    updateField(
      'placements',
      exists ? brief.placements.filter((p) => p !== placement) : [...brief.placements, placement]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Brand Core</p>
            <h2 className="text-xl font-display text-white">Brief stratégique</h2>
          </div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Gemini API</span>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-300">
              Marque
              <input
                value={brief.brandName}
                onChange={(e) => updateField('brandName', e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                placeholder="Nova Skincare"
              />
            </label>
            <label className="text-sm text-zinc-300">
              Produit / Service
              <input
                value={brief.productName}
                onChange={(e) => updateField('productName', e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                placeholder="Sérum Vitamin C"
              />
            </label>
          </div>
          <label className="text-sm text-zinc-300">
            Catégorie
            <input
              value={brief.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Skincare premium"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Audience cible (persona + contexte)
            <textarea
              value={brief.audience}
              onChange={(e) => updateField('audience', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none min-h-[90px]"
              placeholder="Femmes 25-40, urbaines, sensibles aux ingrédients clean, achètent via Instagram."
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Offre</p>
            <h2 className="text-xl font-display text-white">Arguments & preuves</h2>
          </div>
          <Zap className="w-5 h-5 text-cyan-300" />
        </div>
        <div className="grid gap-4">
          <label className="text-sm text-zinc-300">
            Problèmes à résoudre
            <textarea
              value={brief.painPoints}
              onChange={(e) => updateField('painPoints', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none min-h-[90px]"
              placeholder="Teint terne, manque d'éclat, routine trop compliquée."
            />
          </label>
          <label className="text-sm text-zinc-300">
            Bénéfices clés
            <textarea
              value={brief.benefits}
              onChange={(e) => updateField('benefits', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none min-h-[90px]"
              placeholder="Éclat visible en 7 jours, routine simple, texture légère."
            />
          </label>
          <label className="text-sm text-zinc-300">
            Offre / promotion
            <input
              value={brief.offer}
              onChange={(e) => updateField('offer', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              placeholder="-20% + livraison offerte"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Différenciateurs
            <textarea
              value={brief.differentiators}
              onChange={(e) => updateField('differentiators', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none min-h-[80px]"
              placeholder="Formule clean, made in France, ingrédients traçables."
            />
          </label>
          <label className="text-sm text-zinc-300">
            Preuves sociales / data
            <input
              value={brief.proof}
              onChange={(e) => updateField('proof', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              placeholder="4.8/5 sur 2 000 avis"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Campagne</p>
            <h2 className="text-xl font-display text-white">Settings Meta Ads</h2>
          </div>
          <SlidersHorizontal className="w-5 h-5 text-amber-300" />
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm text-zinc-300">
              Objectif
              <select
                value={brief.objective}
                onChange={(e) => updateField('objective', e.target.value as Objective)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {objectiveOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Tonalité
              <select
                value={brief.tone}
                onChange={(e) => updateField('tone', e.target.value as Tone)}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm text-zinc-300">
            Emplacements prioritaires
            <div className="mt-2 flex flex-wrap gap-2">
              {placementOptions.map((placement) => (
                <button
                  type="button"
                  key={placement}
                  onClick={() => togglePlacement(placement)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    brief.placements.includes(placement)
                      ? 'bg-amber-400 text-zinc-950 border-amber-300'
                      : 'border-zinc-700 text-zinc-300 hover:border-amber-300'
                  }`}
                >
                  {placement}
                </button>
              ))}
            </div>
          </label>

          <label className="text-sm text-zinc-300">
            Aspect ratio (Meta)
            <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
              {aspectRatioOptions.map((ratio) => (
                <button
                  type="button"
                  key={ratio.value}
                  onClick={() => updateField('aspectRatio', ratio.value)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    brief.aspectRatio === ratio.value
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                      : 'border-zinc-800 text-zinc-300 hover:border-emerald-400/60'
                  }`}
                >
                  <div className="text-sm font-display">{ratio.label}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {ratio.hint}
                  </div>
                </button>
              ))}
            </div>
          </label>

          <label className="text-sm text-zinc-300">
            Langue de sortie
            <input
              value={brief.language}
              onChange={(e) => updateField('language', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder="Français"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Budget indicatif (optionnel)
            <input
              value={brief.budget}
              onChange={(e) => updateField('budget', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              placeholder="2 000€/mois"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Contraintes & mentions interdites
            <textarea
              value={brief.constraints}
              onChange={(e) => updateField('constraints', e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none min-h-[80px]"
              placeholder="Pas de promesses médicales, éviter 'miracle', pas de comparatifs agressifs."
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-zinc-300 flex-1">
              Nombre de variantes
              <input
                type="range"
                min={1}
                max={10}
                value={brief.variants}
                onChange={(e) => updateField('variants', Number(e.target.value))}
                className="mt-3 w-full accent-emerald-400"
              />
            </label>
            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-display text-white">{brief.variants}</div>
              <input
                type="number"
                min={1}
                max={10}
                value={brief.variants}
                onChange={(e) => updateField('variants', Number(e.target.value))}
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2 py-1 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Generate</p>
            <h2 className="text-xl font-display text-white">Lancer la création</h2>
          </div>
          <Button
            size="lg"
            icon={<Megaphone className="w-4 h-4" />}
            isLoading={isGenerating}
            onClick={onGenerate}
            disabled={!canGenerate}
          >
            Générer les Ads
          </Button>
        </div>
      </div>
    </div>
  );
};

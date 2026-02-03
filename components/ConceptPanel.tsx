import React from 'react';
import { Concept } from '../types';
import { FolderOpen } from 'lucide-react';

interface ConceptPanelProps {
  concept: Concept;
  onUpdate: (updates: Partial<Concept>) => void;
}

export const ConceptPanel: React.FC<ConceptPanelProps> = ({ concept, onUpdate }) => {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200">Concept</p>
          <h3 className="text-lg font-display text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-cyan-300" />
            <input
              value={concept.name}
              onChange={(event) => onUpdate({ name: event.target.value })}
              className="bg-transparent border-b border-transparent focus:border-cyan-400 focus:outline-none text-lg font-display text-white"
              placeholder="Nom du concept"
            />
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Dernière mise à jour : {new Date(concept.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-zinc-200">
            {concept.batches.length} briefs
          </span>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-100">
            Ratio: {concept.brief.aspectRatio}
          </span>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
            Placements: {concept.brief.placements.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Concept } from '../types';
import { Button } from './Button';
import { Layers, Plus, ArrowRight } from 'lucide-react';

interface ConceptListProps {
  concepts: Concept[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  isDisabled?: boolean;
}

export const ConceptList: React.FC<ConceptListProps> = ({
  concepts,
  selectedId,
  onSelect,
  onCreate,
  isDisabled = false,
}) => {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200">Concepts</p>
          <h3 className="text-lg font-display text-white">Espaces créa</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreate}
          disabled={isDisabled}
        >
          Nouveau
        </Button>
      </div>

      {isDisabled ? (
        <div className="flex-1 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-zinc-500 text-sm">
          Sélectionne un client pour ajouter un concept.
        </div>
      ) : concepts.length === 0 ? (
        <div className="flex-1 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-zinc-500 text-sm">
          Aucun concept pour ce client.
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {concepts.map((concept) => {
            const isActive = concept.id === selectedId;
            return (
              <button
                key={concept.id}
                onClick={() => onSelect(concept.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                  isActive
                    ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-100'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-300" />
                      <p className="text-sm font-display">{concept.name}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {concept.brief.category || 'Catégorie à définir'}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-2">
                    {concept.batches.length} briefs
                    <span className="flex items-center gap-1 text-cyan-300">
                      Ouvrir <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

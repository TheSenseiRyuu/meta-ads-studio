import React from 'react';
import { Batch } from '../types';
import { Sparkles, History } from 'lucide-react';

interface BatchListProps {
  batches: Batch[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const BatchList: React.FC<BatchListProps> = ({ batches, selectedId, onSelect }) => {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Batches</p>
          <h3 className="text-lg font-display text-white">Productions</h3>
        </div>
        <History className="w-5 h-5 text-emerald-300" />
      </div>

      {batches.length === 0 ? (
        <div className="flex-1 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-zinc-500 text-sm">
          Aucun batch. Lance une génération pour créer le premier.
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {batches.map((batch) => {
            const isActive = batch.id === selectedId;
            return (
              <button
                key={batch.id}
                onClick={() => onSelect(batch.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                  isActive
                    ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-emerald-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <p className="text-sm font-display">{batch.name}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(batch.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-400">{batch.variants.length} ads</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

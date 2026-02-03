import React from 'react';
import { Batch } from '../types';
import { Sparkles, History, ArrowRight } from 'lucide-react';

interface BatchListProps {
  batches: Batch[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const BatchList: React.FC<BatchListProps> = ({ batches, selectedId, onSelect }) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Briefs</p>
          <h3 className="text-xl font-display text-white">Historique des briefs</h3>
        </div>
        <History className="w-5 h-5 text-emerald-300" />
      </div>

      {batches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 p-6 text-zinc-500 text-sm">
          Aucun brief. Crée le premier pour commencer.
        </div>
      ) : (
        <div className="border-y border-zinc-800/80 divide-y divide-zinc-800/80">
          {batches.map((batch) => {
            const isActive = batch.id === selectedId;
            return (
              <button
                key={batch.id}
                onClick={() => onSelect(batch.id)}
                className={`w-full text-left px-4 py-4 transition-colors ${
                  isActive ? 'bg-emerald-500/10' : 'hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-8 w-8 rounded-xl border ${
                        isActive
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-zinc-800 bg-zinc-900/60 text-emerald-300'
                      } flex items-center justify-center`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-base font-display text-white">{batch.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(batch.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 border ${
                        batch.variants.length
                          ? 'border-emerald-400/40 text-emerald-200'
                          : 'border-zinc-600 text-zinc-400'
                      }`}
                    >
                      {batch.variants.length ? 'Généré' : 'Draft'}
                    </span>
                    <span>{batch.variants.length} ads</span>
                    <span className="flex items-center gap-1 text-emerald-300">
                      Ouvrir <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

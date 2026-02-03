import React from 'react';
import { AdRun } from '../types';
import { Clock, ArrowUpRight } from 'lucide-react';

interface HistoryPanelProps {
  runs: AdRun[];
  onSelect: (run: AdRun) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ runs, onSelect }) => {
  if (runs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6 text-zinc-500">
        Aucun historique pour le moment.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-400 mb-4">
        <Clock className="w-4 h-4" />
        Historique récent
      </div>
      <div className="space-y-3">
        {runs.map((run) => (
          <button
            key={run.id}
            onClick={() => onSelect(run)}
            className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-emerald-400/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-display">{run.brandName}</p>
                <p className="text-xs text-zinc-400">{run.objective}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {new Date(run.createdAt).toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

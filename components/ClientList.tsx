import React from 'react';
import { Client } from '../types';
import { Button } from './Button';
import { Building2, Plus, ArrowRight } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  selectedId,
  onSelect,
  onCreate,
}) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Clients</p>
          <h3 className="text-xl font-display text-white">Portefeuille</h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={onCreate}
        >
          Nouveau
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 p-10 text-zinc-500 text-sm text-center">
          Crée ton premier client pour démarrer.
        </div>
      ) : (
        <div className="border-y border-zinc-800/80 divide-y divide-zinc-800/80">
          {clients.map((client) => {
            const isActive = client.id === selectedId;
            return (
              <button
                key={client.id}
                onClick={() => onSelect(client.id)}
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
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-base font-display text-white">{client.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {client.industry || 'Industrie à préciser'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-400 flex items-center gap-3">
                    <span>{client.concepts.length} concepts</span>
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

import React from 'react';
import { Client } from '../types';
import { Button } from './Button';
import { Building2, Plus } from 'lucide-react';

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
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Clients</p>
          <h3 className="text-lg font-display text-white">Portefeuille</h3>
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
        <div className="flex-1 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-zinc-500 text-sm">
          Crée ton premier client pour démarrer.
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {clients.map((client) => {
            const isActive = client.id === selectedId;
            return (
              <button
                key={client.id}
                onClick={() => onSelect(client.id)}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                  isActive
                    ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-emerald-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-300" />
                      <p className="text-sm font-display">{client.name}</p>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {client.industry || 'Industrie à préciser'}
                    </p>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {client.concepts.length} concepts
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

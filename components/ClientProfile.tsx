import React from 'react';
import { Client } from '../types';
import { Building2, Clock } from 'lucide-react';

interface ClientProfileProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ client, onUpdate }) => {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200">Client</p>
          <h3 className="text-lg font-display text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-300" />
            Profil & contexte
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="w-4 h-4" />
          {new Date(client.updatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid gap-4">
        <label className="text-sm text-zinc-300">
          Nom du client
          <input
            value={client.name}
            onChange={(event) => onUpdate({ name: event.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
            placeholder="Maison Aster"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-zinc-300">
            Marque / Business
            <input
              value={client.brandName}
              onChange={(event) => onUpdate({ brandName: event.target.value })}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Nova Skincare"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Industrie
            <input
              value={client.industry}
              onChange={(event) => onUpdate({ industry: event.target.value })}
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="Beauté, retail, SaaS..."
            />
          </label>
        </div>
        <label className="text-sm text-zinc-300">
          Notes stratégiques
          <textarea
            value={client.notes}
            onChange={(event) => onUpdate({ notes: event.target.value })}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none min-h-[90px]"
            placeholder="Positionnement, offre globale, contexte média..."
          />
        </label>
      </div>
    </div>
  );
};

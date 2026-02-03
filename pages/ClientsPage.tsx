import React from 'react';
import { Client } from '../types';
import { ClientList } from '../components/ClientList';
import { Button } from '../components/Button';
import { ArrowRight, Users, Layers, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientsPageProps {
  clients: Client[];
  onCreateClient: () => Client;
  onSelectClient: (id: string) => void;
  stats: {
    clients: number;
    concepts: number;
    batches: number;
    variants: number;
  };
}

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onCreateClient, onSelectClient, stats }) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    const client = onCreateClient();
    navigate(`/client/${client.id}`);
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    navigate(`/client/${id}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
      <ClientList clients={clients} selectedId={undefined} onSelect={handleSelect} onCreate={handleCreate} />

      <div className="space-y-6">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Workspace</p>
          <h2 className="text-2xl font-display text-white mt-2">Pilote tes marques sans friction</h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-xl">
            Structure ton studio en clients, concepts et batches. Chaque client conserve son contexte,
            ses stratégies et ses assets — tout reste local pour l’instant.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" size="md" icon={<ArrowRight className="w-4 h-4" />} onClick={handleCreate}>
              Créer un client
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => clients[0] && navigate(`/client/${clients[0].id}`)}
              disabled={clients.length === 0}
            >
              Ouvrir le dernier client
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Clients actifs', value: stats.clients, icon: Users, accent: 'text-emerald-300' },
            { label: 'Concepts', value: stats.concepts, icon: Layers, accent: 'text-cyan-300' },
            { label: 'Batches', value: stats.batches, icon: Sparkles, accent: 'text-amber-300' },
            { label: 'Ads générées', value: stats.variants, icon: ArrowRight, accent: 'text-purple-300' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
                <item.icon className={`w-4 h-4 ${item.accent}`} />
              </div>
              <div className="mt-3 text-2xl font-display text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;

import React, { useMemo, useState } from 'react';
import { Client } from '../types';
import { ClientList } from '../components/ClientList';
import { useNavigate } from 'react-router-dom';

interface ClientsPageProps {
  clients: Client[];
  onCreateClient: () => Client;
  onSelectClient: (id: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  onCreateClient,
  onSelectClient,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleCreate = () => {
    const client = onCreateClient();
    navigate(`/client/${client.id}`);
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    navigate(`/client/${id}`);
  };

  const stats = useMemo(() => {
    const totalConcepts = clients.reduce((sum, client) => sum + client.concepts.length, 0);
    const totalBriefs = clients.reduce(
      (sum, client) => sum + client.concepts.reduce((acc, concept) => acc + concept.batches.length, 0),
      0
    );
    const totalAds = clients.reduce(
      (sum, client) =>
        sum +
        client.concepts.reduce(
          (acc, concept) => acc + concept.batches.reduce((ads, brief) => ads + brief.variants.length, 0),
          0
        ),
      0
    );
    return {
      clients: clients.length,
      concepts: totalConcepts,
      briefs: totalBriefs,
      ads: totalAds,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(trimmed) ||
        client.brandName.toLowerCase().includes(trimmed) ||
        client.industry.toLowerCase().includes(trimmed)
    );
  }, [clients, query]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Crée tes clients, lance des briefs et gère tout ton portefeuille.
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un client…"
          className="w-56 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Clients', value: stats.clients },
          { label: 'Concepts', value: stats.concepts },
          { label: 'Briefs', value: stats.briefs },
          { label: 'Ads', value: stats.ads },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{item.label}</p>
            <p className="mt-2 text-2xl font-display text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <ClientList
        clients={filteredClients}
        selectedId={undefined}
        onSelect={handleSelect}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ClientsPage;

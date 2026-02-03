import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client, Concept } from '../types';
import { ClientProfile } from '../components/ClientProfile';
import { ConceptList } from '../components/ConceptList';
import { Button } from '../components/Button';
import { ArrowRight, FolderPlus } from 'lucide-react';

interface ClientPageProps {
  clients: Client[];
  client: Client;
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void;
  onCreateConcept: (clientId: string) => Concept;
  onSelectConcept: (clientId: string, conceptId: string) => void;
}

const ClientPage: React.FC<ClientPageProps> = ({
  clients,
  client,
  onUpdateClient,
  onCreateConcept,
  onSelectConcept,
}) => {
  const navigate = useNavigate();
  const handleCreateConcept = () => {
    const concept = onCreateConcept(client.id);
    navigate(`/client/${client.id}/concept/${concept.id}`);
  };

  const handleSelectConcept = (conceptId: string) => {
    onSelectConcept(client.id, conceptId);
    navigate(`/client/${client.id}/concept/${conceptId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <Link to="/" className="hover:text-white">
            Tous les clients
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{client.name}</span>
        </div>
        <div className="text-xs text-zinc-500">{clients.length} clients au total</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <ConceptList
          concepts={client.concepts}
          selectedId={undefined}
          onSelect={handleSelectConcept}
          onCreate={handleCreateConcept}
          isDisabled={false}
        />

        <div className="space-y-6">
          <ClientProfile client={client} onUpdate={(updates) => onUpdateClient(client.id, updates)} />

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Concepts</p>
                <h3 className="text-lg font-display text-white">Espaces créatifs</h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<FolderPlus className="w-4 h-4" />}
                onClick={handleCreateConcept}
              >
                Nouveau concept
              </Button>
            </div>

            {client.concepts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-zinc-500 text-sm">
                Aucun concept pour ce client. Crée le premier pour commencer.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {client.concepts.map((concept) => (
                  <button
                    key={concept.id}
                    onClick={() => handleSelectConcept(concept.id)}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-left hover:border-cyan-400/40 transition-colors"
                  >
                    <p className="text-sm font-display text-white">{concept.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{concept.brief.category || 'Catégorie à définir'}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                      <span>{concept.batches.length} batches</span>
                      <span className="flex items-center gap-1 text-cyan-300">
                        Ouvrir <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Concept } from '../types';
import { ClientProfile } from '../components/ClientProfile';
import { Button } from '../components/Button';
import { ArrowRight, FolderPlus } from 'lucide-react';

interface ClientPageProps {
  client: Client;
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void;
  onCreateConcept: (clientId: string) => Concept;
  onSelectConcept: (clientId: string, conceptId: string) => void;
}

const ClientPage: React.FC<ClientPageProps> = ({
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
      <div className="space-y-6 max-w-4xl mx-auto">
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
  );
};

export default ClientPage;

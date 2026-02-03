import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Concept } from '../types';
import { ClientProfile } from '../components/ClientProfile';
import { Button } from '../components/Button';
import { ArrowRight, FolderPlus, Settings, Trash2 } from 'lucide-react';

interface ClientPageProps {
  client: Client;
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void;
  onCreateConcept: (clientId: string) => Concept;
  onSelectConcept: (clientId: string, conceptId: string) => void;
  onDeleteClient: (clientId: string) => void;
}

const ClientPage: React.FC<ClientPageProps> = ({
  client,
  onUpdateClient,
  onCreateConcept,
  onSelectConcept,
  onDeleteClient,
}) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const handleCreateConcept = () => {
    const concept = onCreateConcept(client.id);
    navigate(`/client/${client.id}/concept/${concept.id}`);
  };

  const handleSelectConcept = (conceptId: string) => {
    onSelectConcept(client.id, conceptId);
    navigate(`/client/${client.id}/concept/${conceptId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Client</p>
          <h2 className="text-2xl font-display text-white">{client.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettings(true)}
          >
            Gérer le client
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={handleCreateConcept}
          >
            Nouveau concept
          </Button>
        </div>
      </div>

      {client.concepts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 p-10 text-zinc-500 text-sm text-center">
          Aucun concept pour ce client. Crée le premier pour commencer.
        </div>
      ) : (
        <div className="border-y border-zinc-800/80 divide-y divide-zinc-800/80">
          {client.concepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => handleSelectConcept(concept.id)}
              className="w-full text-left px-4 py-4 transition-colors hover:bg-zinc-900/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-base font-display text-white">{concept.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {concept.brief.category || 'Catégorie à définir'}
                  </p>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-3">
                  <span>{concept.batches.length} briefs</span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    Ouvrir <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Client</p>
                <h3 className="text-lg font-display text-white">Paramètres du client</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                Fermer
              </Button>
            </div>
            <ClientProfile client={client} onUpdate={(updates) => onUpdateClient(client.id, updates)} />
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-zinc-500">Toutes les modifications sont sauvegardées automatiquement.</p>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  onDeleteClient(client.id);
                  setShowSettings(false);
                  navigate('/');
                }}
              >
                Supprimer le client
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPage;

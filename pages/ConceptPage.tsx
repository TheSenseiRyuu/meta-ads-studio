import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Concept } from '../types';
import { BatchList } from '../components/BatchList';
import { Button } from '../components/Button';
import { FolderPlus, Settings, Trash2 } from 'lucide-react';
import { BriefForm } from '../components/BriefForm';

interface ConceptPageProps {
  client: Client;
  concept: Concept;
  onUpdateConcept: (clientId: string, conceptId: string, updates: Partial<Concept>) => void;
  onSelectBrief: (clientId: string, conceptId: string, batchId: string) => void;
  onCreateBrief: (clientId: string, conceptId: string) => { id: string } | null;
  onDeleteConcept: (clientId: string, conceptId: string) => void;
}

const ConceptPage: React.FC<ConceptPageProps> = ({
  client,
  concept,
  onUpdateConcept,
  onSelectBrief,
  onCreateBrief,
  onDeleteConcept,
}) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateBrief = () => {
    const brief = onCreateBrief(client.id, concept.id);
    if (brief) {
      navigate(`/client/${client.id}/concept/${concept.id}/brief/${brief.id}`);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Concept</p>
          <h2 className="text-2xl font-display text-white">{concept.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowSettings(true)}
          >
            Modifier le concept
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={handleCreateBrief}
          >
            Nouveau brief
          </Button>
        </div>
      </div>

      <BatchList
        batches={concept.batches}
        selectedId={undefined}
        onSelect={(batchId) => {
          onSelectBrief(client.id, concept.id, batchId);
          navigate(`/client/${client.id}/concept/${concept.id}/brief/${batchId}`);
        }}
      />

      {concept.batches.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 p-8 text-zinc-400 text-sm text-center">
          Aucun brief pour ce concept. Crée le premier pour commencer.
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Concept</p>
                <h3 className="text-lg font-display text-white">Paramètres du concept</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                Fermer
              </Button>
            </div>

            <div className="space-y-4">
              <label className="text-sm text-zinc-300">
                Nom du concept
                <input
                  value={concept.name}
                  onChange={(event) => onUpdateConcept(client.id, concept.id, { name: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="Nom du concept"
                />
              </label>
              <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200 mb-3">Template brief</p>
                <BriefForm
                  key={concept.id}
                  brief={concept.brief}
                  onChange={(nextBrief) => onUpdateConcept(client.id, concept.id, { brief: nextBrief })}
                  onGenerate={() => {}}
                  isGenerating={false}
                  showGenerate={false}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-zinc-500">Ce template sert de base aux nouveaux briefs.</p>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  onDeleteConcept(client.id, concept.id);
                  setShowSettings(false);
                  navigate(`/client/${client.id}`);
                }}
              >
                Supprimer le concept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptPage;

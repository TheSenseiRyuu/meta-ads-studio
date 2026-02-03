import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client, Concept } from '../types';
import { BriefForm } from '../components/BriefForm';
import { ConceptPanel } from '../components/ConceptPanel';
import { BatchList } from '../components/BatchList';
import { Button } from '../components/Button';
import { Sparkles } from 'lucide-react';

interface ConceptPageProps {
  client: Client;
  concept: Concept;
  onUpdateConcept: (clientId: string, conceptId: string, updates: Partial<Concept>) => void;
  onSelectBatch: (clientId: string, conceptId: string, batchId: string) => void;
  onGenerate: (clientId: string, conceptId: string) => void;
  isGenerating: boolean;
}

const ConceptPage: React.FC<ConceptPageProps> = ({
  client,
  concept,
  onUpdateConcept,
  onSelectBatch,
  onGenerate,
  isGenerating,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link to="/" className="hover:text-white">Clients</Link>
          <span>/</span>
          <button
            onClick={() => navigate(`/client/${client.id}`)}
            className="hover:text-white text-zinc-400"
          >
            {client.name}
          </button>
          <span>/</span>
          <span className="text-zinc-300">{concept.name}</span>
        </div>
        <div className="text-xs text-zinc-500">{concept.batches.length} batches</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <BatchList
          batches={concept.batches}
          selectedId={undefined}
          onSelect={(batchId) => {
            onSelectBatch(client.id, concept.id, batchId);
            navigate(`/client/${client.id}/concept/${concept.id}/batch/${batchId}`);
          }}
        />

        <div className="space-y-6">
          <ConceptPanel
            concept={concept}
            onUpdate={(updates) => onUpdateConcept(client.id, concept.id, updates)}
          />

          <BriefForm
            key={concept.id}
            brief={concept.brief}
            onChange={(nextBrief) => onUpdateConcept(client.id, concept.id, { brief: nextBrief })}
            onGenerate={() => onGenerate(client.id, concept.id)}
            isGenerating={isGenerating}
            showGenerate={false}
          />

          {concept.batches.length === 0 && (
            <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-zinc-400 text-sm">
              Aucun batch pour ce concept. Lance une génération pour produire le premier.
            </div>
          )}

          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-transparent p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Generate</p>
                <h2 className="text-xl font-display text-white">Lancer un nouveau batch</h2>
              </div>
              <Button
                size="lg"
                icon={<Sparkles className="w-4 h-4" />}
                isLoading={isGenerating}
                onClick={() => onGenerate(client.id, concept.id)}
                disabled={!concept.brief.brandName.trim() || !concept.brief.productName.trim()}
              >
                Générer les Ads
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptPage;

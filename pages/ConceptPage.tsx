import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <ConceptPanel
        concept={concept}
        onUpdate={(updates) => onUpdateConcept(client.id, concept.id, updates)}
      />

      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] items-start">
        <BriefForm
          key={concept.id}
          brief={concept.brief}
          onChange={(nextBrief) => onUpdateConcept(client.id, concept.id, { brief: nextBrief })}
          onGenerate={() => onGenerate(client.id, concept.id)}
          isGenerating={isGenerating}
          showGenerate={false}
        />

        <div className="space-y-6">
          <BatchList
            batches={concept.batches}
            selectedId={undefined}
            onSelect={(batchId) => {
              onSelectBatch(client.id, concept.id, batchId);
              navigate(`/client/${client.id}/concept/${concept.id}/batch/${batchId}`);
            }}
          />

          {concept.batches.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800/70 bg-zinc-950/40 p-6 text-zinc-400 text-sm">
              Aucun batch pour ce concept. Lance une génération pour produire le premier.
            </div>
          )}

          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Generate</p>
                <h2 className="text-lg font-display text-white">Lancer un nouveau batch</h2>
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

import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client, Concept, Batch, AdVariant } from '../types';
import { BriefForm } from '../components/BriefForm';
import { ConceptPanel } from '../components/ConceptPanel';
import { BatchList } from '../components/BatchList';
import { InsightBoard } from '../components/InsightBoard';
import { AdGrid } from '../components/AdGrid';
import { Button } from '../components/Button';
import Loading from '../components/Loading';
import { Download, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ConceptPageProps {
  client: Client;
  concept: Concept;
  batch: Batch | null;
  onUpdateConcept: (clientId: string, conceptId: string, updates: Partial<Concept>) => void;
  onSelectBatch: (clientId: string, conceptId: string, batchId: string) => void;
  onGenerate: (clientId: string, conceptId: string) => void;
  onSelectVariant: (context: { clientId: string; conceptId: string; batchId: string }, variant: AdVariant) => void;
  onToggleFavorite: (context: { clientId: string; conceptId: string; batchId: string }, variantId: string) => void;
  onGenerateAllVisuals: (context: { clientId: string; conceptId: string; batchId: string }) => void;
  onExportJson: (context: { clientId: string; conceptId: string; batchId: string }) => void;
  isGenerating: boolean;
  visualBatchLoading: boolean;
  loadingStatus: string;
  loadingStep: number;
  loadingHints: string[];
}

const ConceptPage: React.FC<ConceptPageProps> = ({
  client,
  concept,
  batch,
  onUpdateConcept,
  onSelectBatch,
  onGenerate,
  onSelectVariant,
  onToggleFavorite,
  onGenerateAllVisuals,
  onExportJson,
  isGenerating,
  visualBatchLoading,
  loadingStatus,
  loadingStep,
  loadingHints,
}) => {
  const navigate = useNavigate();
  const context = useMemo(
    () =>
      batch
        ? { clientId: client.id, conceptId: concept.id, batchId: batch.id }
        : null,
    [batch, client.id, concept.id]
  );

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
          selectedId={batch?.id}
          onSelect={(batchId) => onSelectBatch(client.id, concept.id, batchId)}
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

          {batch ? (
            <div className="space-y-6">
              {isGenerating ? (
                <Loading status={loadingStatus} step={loadingStep} hints={loadingHints} />
              ) : (
                <InsightBoard strategy={batch.strategy} qa={batch.qa} />
              )}

              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Ad Variants</p>
                    <h3 className="text-lg font-display text-white">Board de création</h3>
                  </div>
                  {context && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ImageIcon className="w-4 h-4" />}
                        onClick={() => onGenerateAllVisuals(context)}
                        isLoading={visualBatchLoading}
                        disabled={batch.variants.length === 0}
                      >
                        Générer les visuels
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-4 h-4" />}
                        onClick={() => onExportJson(context)}
                      >
                        Export JSON
                      </Button>
                    </div>
                  )}
                </div>
                <AdGrid
                  variants={batch.variants}
                  isGenerating={isGenerating}
                  onSelect={(variant) => context && onSelectVariant(context, variant)}
                  onToggleFavorite={(variantId) => context && onToggleFavorite(context, variantId)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-zinc-400 text-sm">
              Aucun batch sélectionné. Lance une génération pour produire le premier.
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

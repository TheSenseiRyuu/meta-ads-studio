import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Client, Concept, Batch, AdVariant } from '../types';
import { InsightBoard } from '../components/InsightBoard';
import { AdGrid } from '../components/AdGrid';
import { Button } from '../components/Button';
import Loading from '../components/Loading';
import { Download, Image as ImageIcon } from 'lucide-react';

interface BatchPageProps {
  client: Client;
  concept: Concept;
  batch: Batch;
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

const BatchPage: React.FC<BatchPageProps> = ({
  client,
  concept,
  batch,
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
    () => ({ clientId: client.id, conceptId: concept.id, batchId: batch.id }),
    [client.id, concept.id, batch.id]
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
          <button
            onClick={() => navigate(`/client/${client.id}/concept/${concept.id}`)}
            className="hover:text-white text-zinc-400"
          >
            {concept.name}
          </button>
          <span>/</span>
          <span className="text-zinc-300">{batch.name}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Batch</p>
            <h2 className="text-xl font-display text-white">{batch.name}</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Créé le {new Date(batch.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      {isGenerating ? (
        <Loading status={loadingStatus} step={loadingStep} hints={loadingHints} />
      ) : (
        <InsightBoard strategy={batch.strategy} qa={batch.qa} />
      )}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Ad Variants</p>
            <h3 className="text-lg font-display text-white">Board de création</h3>
          </div>
          <div className="text-xs text-zinc-400">{batch.variants.length} ads</div>
        </div>
        <AdGrid
          variants={batch.variants}
          isGenerating={isGenerating}
          onSelect={(variant) => onSelectVariant(context, variant)}
          onToggleFavorite={(variantId) => onToggleFavorite(context, variantId)}
        />
      </div>
    </div>
  );
};

export default BatchPage;

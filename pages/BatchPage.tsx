import React, { useMemo, useState } from 'react';
import { Client, Concept, Batch, AdVariant } from '../types';
import { InsightBoard } from '../components/InsightBoard';
import { AdGrid } from '../components/AdGrid';
import { Button } from '../components/Button';
import Loading from '../components/Loading';
import { Download, Image as ImageIcon, Sparkles, Eye } from 'lucide-react';
import { BriefForm } from '../components/BriefForm';

interface BatchPageProps {
  client: Client;
  concept: Concept;
  batch: Batch;
  onSelectVariant: (context: { clientId: string; conceptId: string; batchId: string }, variant: AdVariant) => void;
  onToggleFavorite: (context: { clientId: string; conceptId: string; batchId: string }, variantId: string) => void;
  onGenerateAllVisuals: (context: { clientId: string; conceptId: string; batchId: string }) => void;
  onExportJson: (context: { clientId: string; conceptId: string; batchId: string }) => void;
  onUpdateBrief: (updates: Partial<Batch>) => void;
  onGenerateBrief: () => void;
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
  onUpdateBrief,
  onGenerateBrief,
  isGenerating,
  visualBatchLoading,
  loadingStatus,
  loadingStep,
  loadingHints,
}) => {
  const [showStrategy, setShowStrategy] = useState(false);
  const context = useMemo(
    () => ({ clientId: client.id, conceptId: concept.id, batchId: batch.id }),
    [client.id, concept.id, batch.id]
  );
  const canGenerate = Boolean(batch.brief.brandName.trim() && batch.brief.productName.trim());

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Brief</p>
          <h2 className="text-2xl font-display text-white">{batch.name}</h2>
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

      <div className="grid gap-10 lg:grid-cols-[420px_1fr] items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Brief</p>
              <h3 className="text-lg font-display text-white">Paramètres de génération</h3>
            </div>
            <Button
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              isLoading={isGenerating}
              onClick={onGenerateBrief}
              disabled={!canGenerate}
            >
              Générer les Ads
            </Button>
          </div>

          <BriefForm
            key={batch.id}
            brief={batch.brief}
            onChange={(nextBrief) => onUpdateBrief({ brief: nextBrief })}
            onGenerate={onGenerateBrief}
            isGenerating={isGenerating}
            showGenerate={false}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              {batch.strategy ? 'Stratégie disponible' : 'Aucune stratégie générée'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => setShowStrategy(true)}
              disabled={!batch.strategy}
            >
              Voir la stratégie
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Ads</p>
              <h3 className="text-xl font-display text-white">Board de création</h3>
            </div>
            <div className="text-xs text-zinc-400">{batch.variants.length} ads</div>
          </div>
          {isGenerating ? (
            <Loading status={loadingStatus} step={loadingStep} hints={loadingHints} />
          ) : (
            <AdGrid
              variants={batch.variants}
              isGenerating={isGenerating}
              onSelect={(variant) => onSelectVariant(context, variant)}
              onToggleFavorite={(variantId) => onToggleFavorite(context, variantId)}
            />
          )}
        </div>
      </div>

      {showStrategy && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Stratégie</p>
                <h3 className="text-lg font-display text-white">Insights & recommandations</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowStrategy(false)}>
                Fermer
              </Button>
            </div>
            <InsightBoard strategy={batch.strategy} qa={batch.qa} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPage;

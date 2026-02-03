import React, { useEffect, useMemo, useState } from 'react';
import { BriefForm } from './components/BriefForm';
import { AdGrid } from './components/AdGrid';
import { AdModal } from './components/AdModal';
import { InsightBoard } from './components/InsightBoard';
import { HistoryPanel } from './components/HistoryPanel';
import IntroScreen from './components/IntroScreen';
import Loading from './components/Loading';
import { Button } from './components/Button';
import { generateAds, getHealth, HealthStatus } from './services/api';
import { AdRun, AdVariant, BrandBrief, GenerationResponse, QualityAssurance, StrategyBoard } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Download, RefreshCw, ShieldCheck } from 'lucide-react';

const defaultBrief: BrandBrief = {
  brandName: 'Nova Skincare',
  productName: 'Sérum Vitamin C',
  category: 'Beauté & skincare',
  audience: 'Femmes 25-40, urbaines, sensibles aux ingrédients clean, achètent via Instagram.',
  painPoints: "Teint terne, fatigue visible, manque d'éclat.",
  benefits: 'Éclat visible en 7 jours, texture légère, routine simple.',
  offer: '-20% + livraison offerte',
  differentiators: 'Formule clean, made in France, ingrédients traçables.',
  proof: '4.8/5 sur 2 000 avis',
  constraints: "Pas de promesses médicales. Éviter 'miracle'.",
  objective: 'Sales',
  placements: ['Feed', 'Reels'],
  tone: 'Warm',
  language: 'Français',
  variants: 6,
  budget: '2 000€/mois',
};

const loadingHints = [
  'Scan des motivations d’achat et des signaux de désir.',
  'Calibration du ton selon la marque et la plateforme.',
  'Optimisation des hooks pour maximiser le stop-scroll.',
  'Alignement des visuels avec les placements Meta.',
  'Compression des bénéfices en micro-copies performantes.',
];

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [brief, setBrief] = useLocalStorage<BrandBrief>('meta-ads-brief', defaultBrief);
  const [strategy, setStrategy] = useState<StrategyBoard | null>(null);
  const [qa, setQa] = useState<QualityAssurance | null>(null);
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<AdVariant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [runs, setRuns] = useLocalStorage<AdRun[]>('meta-ads-history', []);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState('Brief scan');

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          cliAvailable: false,
          apiKeyPresent: false,
          model: 'gemini-2.5-flash',
          message: 'Gemini CLI not reachable.',
        })
      );
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    setLoadingStep(1);
    setLoadingStatus('Brief scan');
    const timers = [
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingStatus('Angles & hooks');
      }, 1800),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingStatus('Production des ads');
      }, 3600),
      setTimeout(() => {
        setLoadingStep(4);
        setLoadingStatus('Finalisation');
      }, 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response: GenerationResponse = await generateAds(brief);
      setStrategy(response.strategy);
      setVariants(response.variants);
      setQa(response.qa);

      const newRun: AdRun = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        brandName: brief.brandName,
        objective: brief.objective,
        variants: response.variants,
        strategy: response.strategy,
        qa: response.qa,
      };
      setRuns([newRun, ...runs].slice(0, 10));
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setVariants((prev) =>
      prev.map((variant) => (variant.id === id ? { ...variant, favorite: !variant.favorite } : variant))
    );
    if (selectedVariant?.id === id) {
      setSelectedVariant((prev) =>
        prev ? { ...prev, favorite: !prev.favorite } : prev
      );
    }
  };

  const handleSelectRun = (run: AdRun) => {
    setStrategy(run.strategy);
    setVariants(run.variants);
    setQa(run.qa);
  };

  const exportJson = () => {
    const payload = { brief, strategy, qa, variants };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const safeName = brief.brandName?.trim()
      ? brief.brandName.toLowerCase().replace(/\s+/g, '-')
      : 'meta-ads';
    anchor.download = `${safeName}-meta-ads.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metaStatus = useMemo(() => {
    if (!health) return 'Checking Gemini CLI...';
    if (!health.cliAvailable) return 'Gemini CLI indisponible';
    if (!health.apiKeyPresent) return 'Clé API manquante';
    return `Gemini CLI ${health.cliVersion || ''}`.trim();
  }, [health]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}

      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-[140px]" />
        </div>

        <header className="relative z-10 px-6 md:px-12 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Meta Ads Studio</p>
            <h1 className="text-3xl md:text-4xl font-display">Production d’Ads via Gemini CLI</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Unifie les flows des 3 projets pour livrer des créations Meta Ads prêtes à scaler.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300">
              {metaStatus}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
          </div>
        </header>

        <main className="relative z-10 px-6 md:px-12 pb-16 grid grid-cols-1 xl:grid-cols-[1.2fr_1.8fr] gap-8">
          <section className="space-y-6">
            <BriefForm brief={brief} onChange={setBrief} onGenerate={handleGenerate} isGenerating={isGenerating} />

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Export</p>
                  <h3 className="text-lg font-display">Assets prêts à livrer</h3>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Exporte la structure complète (brief + stratégie + variantes) pour l’intégrer à ton
                workflow créa.
              </p>
              <Button
                variant="secondary"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={exportJson}
                disabled={variants.length === 0}
              >
                Télécharger le JSON
              </Button>
            </div>

            <HistoryPanel runs={runs} onSelect={handleSelectRun} />
          </section>

          <section className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}

            {isGenerating ? (
              <Loading status={loadingStatus} step={loadingStep} hints={loadingHints} />
            ) : (
              <InsightBoard strategy={strategy} qa={qa} />
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Ad Variants</p>
                  <h3 className="text-lg font-display">Board de création</h3>
                </div>
                <div className="text-xs text-zinc-400">{variants.length} variantes</div>
              </div>
              <AdGrid
                variants={variants}
                isGenerating={isGenerating}
                onSelect={setSelectedVariant}
                onToggleFavorite={toggleFavorite}
              />
            </div>
          </section>
        </main>
      </div>

      <AdModal
        variant={selectedVariant}
        onClose={() => setSelectedVariant(null)}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
};

export default App;

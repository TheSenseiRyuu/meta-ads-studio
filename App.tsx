import React, { useEffect, useMemo, useState } from 'react';
import { BriefForm } from './components/BriefForm';
import { AdGrid } from './components/AdGrid';
import { AdModal } from './components/AdModal';
import { InsightBoard } from './components/InsightBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { ClientList } from './components/ClientList';
import { ConceptList } from './components/ConceptList';
import { ClientProfile } from './components/ClientProfile';
import { ConceptPanel } from './components/ConceptPanel';
import IntroScreen from './components/IntroScreen';
import Loading from './components/Loading';
import { Button } from './components/Button';
import {
  generateAds,
  generateVisual,
  getHealth,
  HealthStatus,
  setSettings,
  getModels,
  ModelsResponse,
} from './services/api';
import {
  AdRun,
  AdVariant,
  BrandBrief,
  GenerationResponse,
  GeminiSettings,
  Workspace,
  Client,
  Concept,
  Batch,
} from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  Download,
  RefreshCw,
  ShieldCheck,
  Image as ImageIcon,
  Settings,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { createId } from './utils/id';

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
  aspectRatio: 'Auto',
  tone: 'Warm',
  language: 'Français',
  variants: 6,
  budget: '2 000€/mois',
};

const defaultSettings: GeminiSettings = {
  apiKey: '',
  textModel: 'gemini-2.5-flash',
  imageModel: 'gemini-3-pro-image-preview',
  imageSize: '2K',
};

const loadingHints = [
  'Scan des motivations d’achat et des signaux de désir.',
  'Calibration du ton selon la marque et la plateforme.',
  'Optimisation des hooks pour maximiser le stop-scroll.',
  'Alignement des visuels avec les placements Meta.',
  'Compression des bénéfices en micro-copies performantes.',
];

const createBlankBrief = (): BrandBrief => ({
  ...defaultBrief,
  placements: [...defaultBrief.placements],
});

const normalizeBrief = (input?: Partial<BrandBrief> | null): BrandBrief => {
  const base = createBlankBrief();
  if (!input) return base;
  return {
    ...base,
    ...input,
    placements: input.placements?.length ? input.placements : base.placements,
  } as BrandBrief;
};

const createClient = (name: string): Client => ({
  id: createId(),
  name,
  brandName: '',
  industry: '',
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  concepts: [],
});

const createConcept = (name: string, brief?: BrandBrief): Concept => ({
  id: createId(),
  name,
  brief: normalizeBrief(brief),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  batches: [],
});

const createBatch = (payload: GenerationResponse, index: number): Batch => ({
  id: createId(),
  name: `Batch ${String(index).padStart(2, '0')} · ${new Date().toLocaleDateString()}`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  strategy: payload.strategy,
  qa: payload.qa,
  variants: payload.variants,
});

const buildInitialWorkspace = (): Workspace => {
  const emptyWorkspace: Workspace = { clients: [], selection: {} };
  if (typeof window === 'undefined') return emptyWorkspace;

  try {
    const legacyBriefRaw = localStorage.getItem('meta-ads-brief');
    const legacyRunsRaw = localStorage.getItem('meta-ads-history');
    if (!legacyBriefRaw && !legacyRunsRaw) return emptyWorkspace;

    const legacyBrief = legacyBriefRaw ? (JSON.parse(legacyBriefRaw) as BrandBrief) : null;
    const legacyRuns = legacyRunsRaw ? (JSON.parse(legacyRunsRaw) as AdRun[]) : [];

    const clientName = legacyBrief?.brandName || legacyRuns[0]?.brandName || 'Client importé';
    const client = createClient(clientName);
    client.brandName = legacyBrief?.brandName || '';

    const concept = createConcept('Concept importé', normalizeBrief(legacyBrief || undefined));
    concept.batches = legacyRuns.map((run, index) => ({
      id: run.id || createId(),
      name: `Batch ${String(index + 1).padStart(2, '0')} · ${new Date(run.createdAt).toLocaleDateString()}`,
      createdAt: run.createdAt || Date.now(),
      updatedAt: run.createdAt || Date.now(),
      strategy: run.strategy,
      qa: run.qa,
      variants: run.variants,
    }));

    client.concepts = [concept];

    return {
      clients: [client],
      selection: {
        clientId: client.id,
        conceptId: concept.id,
        batchId: concept.batches[0]?.id,
      },
    };
  } catch {
    return emptyWorkspace;
  }
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return localStorage.getItem('intro_seen') !== '1';
    } catch {
      return true;
    }
  });

  const initialWorkspace = useMemo(() => buildInitialWorkspace(), []);
  const [workspace, setWorkspace] = useLocalStorage<Workspace>('meta-ads-workspace', initialWorkspace);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [settings, setSettingsState] = useLocalStorage<GeminiSettings>('meta-ads-settings', defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState('Brief scan');
  const [visualLoadingId, setVisualLoadingId] = useState<string | null>(null);
  const [visualBatchLoading, setVisualBatchLoading] = useState(false);

  const selection = workspace.selection || {};
  const activeClient = useMemo(() => {
    if (selection.clientId) {
      const match = workspace.clients.find((client) => client.id === selection.clientId);
      if (match) return match;
    }
    return workspace.clients[0] || null;
  }, [selection.clientId, workspace.clients]);

  const activeConcept = useMemo(() => {
    if (!activeClient) return null;
    if (selection.conceptId) {
      const match = activeClient.concepts.find((concept) => concept.id === selection.conceptId);
      if (match) return match;
    }
    return activeClient.concepts[0] || null;
  }, [activeClient, selection.conceptId]);

  const activeBatch = useMemo(() => {
    if (!activeConcept) return null;
    if (selection.batchId) {
      const match = activeConcept.batches.find((batch) => batch.id === selection.batchId);
      if (match) return match;
    }
    return activeConcept.batches[0] || null;
  }, [activeConcept, selection.batchId]);

  const selectedVariant = useMemo(() => {
    if (!activeBatch || !selectedVariantId) return null;
    return activeBatch.variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [activeBatch, selectedVariantId]);

  useEffect(() => {
    setSelectedVariantId(null);
  }, [activeBatch?.id]);

  useEffect(() => {
    if (!activeClient) return;
    const nextSelection = {
      clientId: activeClient.id,
      conceptId: activeConcept?.id,
      batchId: activeBatch?.id,
    };
    if (
      nextSelection.clientId === selection.clientId &&
      nextSelection.conceptId === selection.conceptId &&
      nextSelection.batchId === selection.batchId
    ) {
      return;
    }
    setWorkspace((prev) => ({
      ...prev,
      selection: nextSelection,
    }));
  }, [activeBatch?.id, activeClient, activeConcept?.id, selection.batchId, selection.clientId, selection.conceptId, setWorkspace]);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() =>
        setHealth({
          cliAvailable: false,
          apiKeyPresent: false,
          model: 'gemini-2.5-flash',
          message: 'Gemini API not reachable.',
        })
      );
  }, []);

  useEffect(() => {
    if (!settings.apiKey) return;
    setSettings(settings).catch(() => {
      // Silent fail, user can retry
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isGenerating) return;
    setLoadingStep(1);
    setLoadingStatus('Brief scan');
    const timers = [
      setTimeout(() => {
        setLoadingStep(2);
        setLoadingStatus('Angles & hooks');
      }, 1200),
      setTimeout(() => {
        setLoadingStep(3);
        setLoadingStatus('Production des ads');
      }, 2600),
      setTimeout(() => {
        setLoadingStep(4);
        setLoadingStatus('Finalisation');
      }, 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setWorkspace((prev) => ({
      ...prev,
      clients: prev.clients.map((client) =>
        client.id === clientId
          ? { ...client, ...updates, updatedAt: Date.now() }
          : client
      ),
    }));
  };

  const updateConcept = (clientId: string, conceptId: string, updates: Partial<Concept>) => {
    setWorkspace((prev) => ({
      ...prev,
      clients: prev.clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              updatedAt: Date.now(),
              concepts: client.concepts.map((concept) =>
                concept.id === conceptId
                  ? { ...concept, ...updates, updatedAt: Date.now() }
                  : concept
              ),
            }
          : client
      ),
    }));
  };

  const updateBatch = (clientId: string, conceptId: string, batchId: string, updates: Partial<Batch>) => {
    setWorkspace((prev) => ({
      ...prev,
      clients: prev.clients.map((client) =>
        client.id === clientId
          ? {
              ...client,
              updatedAt: Date.now(),
              concepts: client.concepts.map((concept) =>
                concept.id === conceptId
                  ? {
                      ...concept,
                      updatedAt: Date.now(),
                      batches: concept.batches.map((batch) =>
                        batch.id === batchId ? { ...batch, ...updates, updatedAt: Date.now() } : batch
                      ),
                    }
                  : concept
              ),
            }
          : client
      ),
    }));
  };

  const handleCreateClient = () => {
    const newClient = createClient(`Client ${String(workspace.clients.length + 1).padStart(2, '0')}`);
    setWorkspace((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
      selection: { clientId: newClient.id, conceptId: undefined, batchId: undefined },
    }));
  };

  const handleSelectClient = (clientId: string) => {
    const client = workspace.clients.find((item) => item.id === clientId);
    if (!client) return;
    const concept = client.concepts[0];
    const batch = concept?.batches[0];
    setWorkspace((prev) => ({
      ...prev,
      selection: { clientId, conceptId: concept?.id, batchId: batch?.id },
    }));
  };

  const handleCreateConcept = () => {
    if (!activeClient) return;
    const newConcept = createConcept(`Concept ${String(activeClient.concepts.length + 1).padStart(2, '0')}`);
    setWorkspace((prev) => ({
      ...prev,
      clients: prev.clients.map((client) =>
        client.id === activeClient.id
          ? { ...client, concepts: [newConcept, ...client.concepts], updatedAt: Date.now() }
          : client
      ),
      selection: { clientId: activeClient.id, conceptId: newConcept.id, batchId: undefined },
    }));
  };

  const handleSelectConcept = (conceptId: string) => {
    if (!activeClient) return;
    const concept = activeClient.concepts.find((item) => item.id === conceptId);
    if (!concept) return;
    const batch = concept.batches[0];
    setWorkspace((prev) => ({
      ...prev,
      selection: { clientId: activeClient.id, conceptId: conceptId, batchId: batch?.id },
    }));
  };

  const handleSelectBatch = (batchId: string) => {
    if (!activeClient || !activeConcept) return;
    setWorkspace((prev) => ({
      ...prev,
      selection: { clientId: activeClient.id, conceptId: activeConcept.id, batchId },
    }));
  };

  const handleGenerate = async () => {
    if (!activeClient || !activeConcept) {
      setError('Sélectionne un concept pour lancer la génération.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      if (!settings.apiKey) {
        throw new Error('Ajoute ta clé Gemini API dans Settings.');
      }
      const response: GenerationResponse = await generateAds(activeConcept.brief);

      const nextIndex = activeConcept.batches.length + 1;
      const newBatch = createBatch(response, nextIndex);

      setWorkspace((prev) => ({
        ...prev,
        clients: prev.clients.map((client) =>
          client.id === activeClient.id
            ? {
                ...client,
                updatedAt: Date.now(),
                concepts: client.concepts.map((concept) =>
                  concept.id === activeConcept.id
                    ? {
                        ...concept,
                        updatedAt: Date.now(),
                        batches: [newBatch, ...concept.batches],
                      }
                    : concept
                ),
              }
            : client
        ),
        selection: { clientId: activeClient.id, conceptId: activeConcept.id, batchId: newBatch.id },
      }));
  } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) => {
    if (!activeClient || !activeConcept || !activeBatch) return;
    updateBatch(activeClient.id, activeConcept.id, activeBatch.id, {
      variants: activeBatch.variants.map((variant) =>
        variant.id === id ? { ...variant, favorite: !variant.favorite } : variant
      ),
    });
  };

  const handleGenerateVisual = async (variant: AdVariant) => {
    if (!activeClient || !activeConcept || !activeBatch) return;
    setVisualLoadingId(variant.id);
    setError(null);
    try {
      if (!settings.apiKey) {
        throw new Error('Ajoute ta clé Gemini API dans Settings.');
      }
      const result = await generateVisual({
        variant,
        brandName: activeConcept.brief.brandName,
        productName: activeConcept.brief.productName,
        language: activeConcept.brief.language,
        aspectRatio: activeConcept.brief.aspectRatio,
      });

      updateBatch(activeClient.id, activeConcept.id, activeBatch.id, {
        variants: activeBatch.variants.map((item) =>
          item.id === variant.id
            ? {
                ...item,
                visualImage: `data:${result.mimeType};base64,${result.imageBase64}`,
                visualMimeType: result.mimeType,
              }
            : item
        ),
      });
    } catch (err: any) {
      setError(err?.message || 'Erreur génération visuel.');
    } finally {
      setVisualLoadingId(null);
    }
  };

  const handleGenerateAllVisuals = async () => {
    if (!activeClient || !activeConcept || !activeBatch) return;
    if (activeBatch.variants.length === 0) return;
    setVisualBatchLoading(true);
    setError(null);
    if (!settings.apiKey) {
      setError('Ajoute ta clé Gemini API dans Settings.');
      setVisualBatchLoading(false);
      return;
    }
    for (const variant of activeBatch.variants) {
      if (variant.visualImage) continue;
      try {
        const result = await generateVisual({
          variant,
          brandName: activeConcept.brief.brandName,
          productName: activeConcept.brief.productName,
          language: activeConcept.brief.language,
          aspectRatio: activeConcept.brief.aspectRatio,
        });
        updateBatch(activeClient.id, activeConcept.id, activeBatch.id, {
          variants: activeBatch.variants.map((item) =>
            item.id === variant.id
              ? {
                  ...item,
                  visualImage: `data:${result.mimeType};base64,${result.imageBase64}`,
                  visualMimeType: result.mimeType,
                }
              : item
          ),
        });
      } catch (err: any) {
        setError(err?.message || 'Erreur génération visuel.');
        break;
      }
    }
    setVisualBatchLoading(false);
  };

  const downloadVisual = (variant: AdVariant) => {
    if (!variant.visualImage || !variant.visualMimeType) return;
    const base64 = variant.visualImage.split(',')[1];
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i += 1) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: variant.visualMimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const ext = variant.visualMimeType.includes('png') ? 'png' : 'jpg';
    anchor.download = `${variant.name.toLowerCase().replace(/\s+/g, '-')}.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportJson = () => {
    if (!activeClient || !activeConcept || !activeBatch) return;
    const payload = {
      client: {
        id: activeClient.id,
        name: activeClient.name,
        brandName: activeClient.brandName,
        industry: activeClient.industry,
        notes: activeClient.notes,
      },
      concept: {
        id: activeConcept.id,
        name: activeConcept.name,
        brief: activeConcept.brief,
      },
      batch: {
        id: activeBatch.id,
        name: activeBatch.name,
        createdAt: activeBatch.createdAt,
        strategy: activeBatch.strategy,
        qa: activeBatch.qa,
        variants: activeBatch.variants,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const safeName = activeClient.name?.trim()
      ? activeClient.name.toLowerCase().replace(/\s+/g, '-')
      : 'meta-ads';
    anchor.download = `${safeName}-meta-ads.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const metaStatus = useMemo(() => {
    if (!health) return 'Checking Gemini API...';
    if (!health.cliAvailable) return 'Gemini API indisponible';
    if (!health.apiKeyPresent) return 'Clé API manquante';
    return `Gemini API ${health.cliVersion || ''}`.trim();
  }, [health]);

  const handleSaveSettings = async (nextSettings: GeminiSettings) => {
    setIsSavingSettings(true);
    setError(null);
    try {
      await setSettings(nextSettings);
      const updatedHealth = await getHealth();
      setHealth(updatedHealth);
      setShowSettings(false);
      if (nextSettings.apiKey) {
        setIsLoadingModels(true);
        const modelsResponse = await getModels(nextSettings.apiKey);
        setModels(modelsResponse);
        setIsLoadingModels(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur mise à jour settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleRefreshModels = async () => {
    if (!settings.apiKey) return;
    setIsLoadingModels(true);
    setError(null);
    try {
      const modelsResponse = await getModels(settings.apiKey);
      setModels(modelsResponse);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement modèles.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showIntro && (
        <IntroScreen
          onComplete={() => {
            try {
              localStorage.setItem('intro_seen', '1');
            } catch {
              // ignore
            }
            setShowIntro(false);
          }}
        />
      )}

      <div className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-0 w-96 h-96 bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-[140px]" />
        </div>

        <header className="relative z-10 px-6 md:px-12 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between max-w-[1600px] mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Meta Ads Studio</p>
            <h1 className="text-3xl md:text-4xl font-display">Studio multi-clients pour Meta Ads</h1>
            <p className="text-sm text-zinc-400 mt-2">
              Configure tes clients, structure tes concepts, puis lance des batches d’ads et visuels
              premium via Gemini API.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {activeClient && (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                  Client: {activeClient.name}
                </span>
              )}
              {activeConcept && (
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
                  Concept: {activeConcept.name}
                </span>
              )}
              {activeBatch && (
                <span className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-zinc-200">
                  Batch: {activeBatch.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300">
              {metaStatus}
            </div>
            <div className="hidden lg:block text-[10px] text-zinc-500">
              {settings.textModel} · {settings.imageModel} · {settings.imageSize}
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => {
                setShowSettings(true);
                if (!models && settings.apiKey) {
                  handleRefreshModels();
                }
              }}
            >
              Settings
            </Button>
          </div>
        </header>

        <main className="relative z-10 px-6 md:px-12 pb-16 grid grid-cols-1 xl:grid-cols-[280px_320px_minmax(0,1fr)] gap-6 max-w-[1600px] mx-auto">
          <ClientList
            clients={workspace.clients}
            selectedId={activeClient?.id}
            onSelect={handleSelectClient}
            onCreate={handleCreateClient}
          />

          <ConceptList
            concepts={activeClient?.concepts || []}
            selectedId={activeConcept?.id}
            onSelect={handleSelectConcept}
            onCreate={handleCreateConcept}
            isDisabled={!activeClient}
          />

          <section className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
                {error}
              </div>
            )}

            {!activeClient && (
              <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-zinc-400 text-sm">
                Crée un client pour démarrer ton organisation multi-marques.
              </div>
            )}

            {activeClient && (
              <ClientProfile
                client={activeClient}
                onUpdate={(updates) => updateClient(activeClient.id, updates)}
              />
            )}

            {activeClient && !activeConcept && (
              <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-zinc-400 text-sm">
                Ajoute un concept pour structurer tes campagnes et commencer à générer des ads.
              </div>
            )}

            {activeClient && activeConcept && (
              <div className="space-y-6">
                <ConceptPanel
                  concept={activeConcept}
                  onUpdate={(updates) => updateConcept(activeClient.id, activeConcept.id, updates)}
                />

                <BriefForm
                  key={activeConcept.id}
                  brief={activeConcept.brief}
                  onChange={(nextBrief) => updateConcept(activeClient.id, activeConcept.id, { brief: nextBrief })}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  showGenerate={false}
                />

                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Batches</p>
                      <h3 className="text-lg font-display text-white">Historique des productions</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <ClipboardList className="w-4 h-4" />
                      {activeConcept.batches.length} batches
                    </div>
                  </div>

                  {activeConcept.batches.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-zinc-500 text-sm">
                      Aucun batch pour ce concept. Lance la génération pour créer le premier.
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {activeConcept.batches.map((batch) => {
                        const isActive = batch.id === activeBatch?.id;
                        return (
                          <button
                            key={batch.id}
                            onClick={() => handleSelectBatch(batch.id)}
                            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                              isActive
                                ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100'
                                : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-emerald-400/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-display">{batch.name}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  {new Date(batch.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="text-xs text-zinc-400">{batch.variants.length} ads</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {activeBatch ? (
                  <div className="space-y-6">
                    {isGenerating ? (
                      <Loading status={loadingStatus} step={loadingStep} hints={loadingHints} />
                    ) : (
                      <InsightBoard strategy={activeBatch.strategy} qa={activeBatch.qa} />
                    )}

                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Ad Variants</p>
                          <h3 className="text-lg font-display text-white">Board de création</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ImageIcon className="w-4 h-4" />}
                            onClick={handleGenerateAllVisuals}
                            isLoading={visualBatchLoading}
                            disabled={activeBatch.variants.length === 0}
                          >
                            Générer les visuels
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<Download className="w-4 h-4" />}
                            onClick={exportJson}
                          >
                            Export JSON
                          </Button>
                        </div>
                      </div>
                      <AdGrid
                        variants={activeBatch.variants}
                        isGenerating={isGenerating}
                        onSelect={(variant) => setSelectedVariantId(variant.id)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-zinc-400 text-sm">
                    Sélectionne un batch pour afficher la stratégie, les ads et les visuels.
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
                      onClick={handleGenerate}
                      disabled={!activeConcept.brief.brandName.trim() || !activeConcept.brief.productName.trim()}
                    >
                      Générer les Ads
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Export</p>
                      <h3 className="text-lg font-display">Assets prêts à livrer</h3>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-200" />
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">
                    Exporte la structure complète (brief + stratégie + variantes) pour l’intégrer à ton workflow créa.
                  </p>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Download className="w-4 h-4" />}
                    onClick={exportJson}
                    disabled={!activeBatch}
                  >
                    Télécharger le JSON
                  </Button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <AdModal
        variant={selectedVariant}
        onClose={() => setSelectedVariantId(null)}
        onToggleFavorite={toggleFavorite}
        onGenerateVisual={handleGenerateVisual}
        isGeneratingVisual={visualLoadingId === selectedVariant?.id}
        onDownloadVisual={downloadVisual}
        aspectRatio={activeConcept?.brief.aspectRatio || 'Auto'}
      />

      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Settings</p>
                <h3 className="text-lg font-display text-white">Configuration Gemini API</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                Fermer
              </Button>
            </div>
            <div className="p-6">
              <SettingsPanel
                settings={settings}
                onChange={setSettingsState}
                onSave={handleSaveSettings}
                isSaving={isSavingSettings}
                models={models?.models || []}
                textModels={models?.textModels || []}
                imageModels={models?.imageModels || []}
                isLoadingModels={isLoadingModels}
                onRefreshModels={handleRefreshModels}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';
import IntroScreen from './components/IntroScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { AdModal } from './components/AdModal';
import { Button } from './components/Button';
import ClientsPage from './pages/ClientsPage';
import ClientPage from './pages/ClientPage';
import ConceptPage from './pages/ConceptPage';
import BatchPage from './pages/BatchPage';
import {
  generateAds,
  generateVisual,
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
import { Settings } from 'lucide-react';
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

const AppShell: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return localStorage.getItem('intro_seen') !== '1';
    } catch {
      return true;
    }
  });

  const initialWorkspace = useMemo(() => buildInitialWorkspace(), []);
  const [workspace, setWorkspace] = useLocalStorage<Workspace>('meta-ads-workspace', initialWorkspace);
  const [selectedVariant, setSelectedVariant] = useState<AdVariant | null>(null);
  const [selectedContext, setSelectedContext] = useState<{ clientId: string; conceptId: string; batchId: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettingsState] = useLocalStorage<GeminiSettings>('meta-ads-settings', defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState('Brief scan');
  const [visualLoadingId, setVisualLoadingId] = useState<string | null>(null);
  const [visualBatchLoading, setVisualBatchLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setSelectedVariant(null);
    setSelectedContext(null);
  }, [location.pathname]);

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

  const selectedConceptForModal = useMemo(() => {
    if (!selectedContext) return null;
    const client = workspace.clients.find((item) => item.id === selectedContext.clientId);
    const concept = client?.concepts.find((item) => item.id === selectedContext.conceptId);
    return concept || null;
  }, [selectedContext, workspace.clients]);

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

  const updateBatchVariants = (
    clientId: string,
    conceptId: string,
    batchId: string,
    updater: (variants: AdVariant[]) => AdVariant[]
  ) => {
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
                        batch.id === batchId
                          ? { ...batch, variants: updater(batch.variants), updatedAt: Date.now() }
                          : batch
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
    return newClient;
  };

  const handleSelectClient = (clientId: string) => {
    const client = workspace.clients.find((item) => item.id === clientId);
    if (!client) return;
    const concept = client.concepts[0];
    const batch = concept?.batches[0];
    const conceptId = concept?.id;
    const batchId = batch?.id;
    setWorkspace((prev) => {
      if (
        prev.selection?.clientId === clientId &&
        prev.selection?.conceptId === conceptId &&
        prev.selection?.batchId === batchId
      ) {
        return prev;
      }
      return { ...prev, selection: { clientId, conceptId, batchId } };
    });
  };

  const handleCreateConcept = (clientId: string) => {
    const newConcept = createConcept('Nouveau concept');
    setWorkspace((prev) => ({
      ...prev,
      clients: prev.clients.map((client) =>
        client.id === clientId
          ? { ...client, concepts: [newConcept, ...client.concepts], updatedAt: Date.now() }
          : client
      ),
      selection: { clientId, conceptId: newConcept.id, batchId: undefined },
    }));
    return newConcept;
  };

  const handleSelectConcept = (clientId: string, conceptId: string) => {
    const client = workspace.clients.find((item) => item.id === clientId);
    const concept = client?.concepts.find((item) => item.id === conceptId);
    if (!client || !concept) return;
    const batch = concept.batches[0];
    const batchId = batch?.id;
    setWorkspace((prev) => {
      if (
        prev.selection?.clientId === clientId &&
        prev.selection?.conceptId === conceptId &&
        prev.selection?.batchId === batchId
      ) {
        return prev;
      }
      return { ...prev, selection: { clientId, conceptId, batchId } };
    });
  };

  const handleSelectBatch = (clientId: string, conceptId: string, batchId: string) => {
    setWorkspace((prev) => {
      if (
        prev.selection?.clientId === clientId &&
        prev.selection?.conceptId === conceptId &&
        prev.selection?.batchId === batchId
      ) {
        return prev;
      }
      return { ...prev, selection: { clientId, conceptId, batchId } };
    });
  };

  const handleGenerate = async (clientId: string, conceptId: string) => {
    const client = workspace.clients.find((item) => item.id === clientId);
    const concept = client?.concepts.find((item) => item.id === conceptId);
    if (!client || !concept) {
      setError('Sélectionne un concept pour lancer la génération.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      if (!settings.apiKey) {
        throw new Error('Ajoute ta clé Gemini API dans Settings.');
      }
      const response: GenerationResponse = await generateAds(concept.brief);

      const nextIndex = concept.batches.length + 1;
      const newBatch = createBatch(response, nextIndex);

      setWorkspace((prev) => ({
        ...prev,
        clients: prev.clients.map((item) =>
          item.id === clientId
            ? {
                ...item,
                updatedAt: Date.now(),
                concepts: item.concepts.map((conceptItem) =>
                  conceptItem.id === conceptId
                    ? {
                        ...conceptItem,
                        updatedAt: Date.now(),
                        batches: [newBatch, ...conceptItem.batches],
                      }
                    : conceptItem
                ),
              }
            : item
        ),
        selection: { clientId, conceptId, batchId: newBatch.id },
      }));
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (context: { clientId: string; conceptId: string; batchId: string }, variantId: string) => {
    updateBatchVariants(context.clientId, context.conceptId, context.batchId, (variants) =>
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, favorite: !variant.favorite } : variant
      )
    );

    if (selectedVariant?.id === variantId) {
      setSelectedVariant((prev) => (prev ? { ...prev, favorite: !prev.favorite } : prev));
    }
  };

  const handleGenerateVisual = async (
    context: { clientId: string; conceptId: string; batchId: string },
    variant: AdVariant
  ) => {
    const client = workspace.clients.find((item) => item.id === context.clientId);
    const concept = client?.concepts.find((item) => item.id === context.conceptId);
    if (!concept) return;

    setVisualLoadingId(variant.id);
    setError(null);
    try {
      if (!settings.apiKey) {
        throw new Error('Ajoute ta clé Gemini API dans Settings.');
      }
      const result = await generateVisual({
        variant,
        brandName: concept.brief.brandName,
        productName: concept.brief.productName,
        language: concept.brief.language,
        aspectRatio: concept.brief.aspectRatio,
      });

      updateBatchVariants(context.clientId, context.conceptId, context.batchId, (variants) =>
        variants.map((item) =>
          item.id === variant.id
            ? {
                ...item,
                visualImage: `data:${result.mimeType};base64,${result.imageBase64}`,
                visualMimeType: result.mimeType,
              }
            : item
        )
      );

      if (selectedVariant?.id === variant.id) {
        setSelectedVariant({
          ...variant,
          visualImage: `data:${result.mimeType};base64,${result.imageBase64}`,
          visualMimeType: result.mimeType,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur génération visuel.');
    } finally {
      setVisualLoadingId(null);
    }
  };

  const handleGenerateAllVisuals = async (context: { clientId: string; conceptId: string; batchId: string }) => {
    const client = workspace.clients.find((item) => item.id === context.clientId);
    const concept = client?.concepts.find((item) => item.id === context.conceptId);
    const batch = concept?.batches.find((item) => item.id === context.batchId);
    if (!concept || !batch) return;

    setVisualBatchLoading(true);
    setError(null);
    if (!settings.apiKey) {
      setError('Ajoute ta clé Gemini API dans Settings.');
      setVisualBatchLoading(false);
      return;
    }

    for (const variant of batch.variants) {
      if (variant.visualImage) continue;
      try {
        const result = await generateVisual({
          variant,
          brandName: concept.brief.brandName,
          productName: concept.brief.productName,
          language: concept.brief.language,
          aspectRatio: concept.brief.aspectRatio,
        });
        updateBatchVariants(context.clientId, context.conceptId, context.batchId, (variants) =>
          variants.map((item) =>
            item.id === variant.id
              ? {
                  ...item,
                  visualImage: `data:${result.mimeType};base64,${result.imageBase64}`,
                  visualMimeType: result.mimeType,
                }
              : item
          )
        );
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

  const exportJson = (context: { clientId: string; conceptId: string; batchId: string }) => {
    const client = workspace.clients.find((item) => item.id === context.clientId);
    const concept = client?.concepts.find((item) => item.id === context.conceptId);
    const batch = concept?.batches.find((item) => item.id === context.batchId);
    if (!client || !concept || !batch) return;

    const payload = {
      client: {
        id: client.id,
        name: client.name,
        brandName: client.brandName,
        industry: client.industry,
        notes: client.notes,
      },
      concept: {
        id: concept.id,
        name: concept.name,
        brief: concept.brief,
      },
      batch: {
        id: batch.id,
        name: batch.name,
        createdAt: batch.createdAt,
        strategy: batch.strategy,
        qa: batch.qa,
        variants: batch.variants,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const safeName = client.name?.trim()
      ? client.name.toLowerCase().replace(/\s+/g, '-')
      : 'meta-ads';
    anchor.download = `${safeName}-meta-ads.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectVariant = (
    context: { clientId: string; conceptId: string; batchId: string },
    variant: AdVariant
  ) => {
    setSelectedVariant(variant);
    setSelectedContext(context);
  };

  const routeType = useMemo(() => {
    if (location.pathname.includes('/batch/')) return 'batch';
    if (location.pathname.includes('/concept/')) return 'concept';
    if (location.pathname.includes('/client/')) return 'client';
    return 'clients';
  }, [location.pathname]);

  const headerTitle = useMemo(() => {
    if (routeType === 'client') return `Client: ${activeClient?.name || 'Client'}`;
    if (routeType === 'concept') return `Concept: ${activeConcept?.name || 'Concept'}`;
    if (routeType === 'batch') return `Batch: ${activeBatch?.name || 'Batch'}`;
    return 'Clients';
  }, [routeType, activeClient?.name, activeConcept?.name, activeBatch?.name]);

  const backPath = useMemo(() => {
    if (routeType === 'batch' && activeClient && activeConcept) {
      return `/client/${activeClient.id}/concept/${activeConcept.id}`;
    }
    if (routeType === 'concept' && activeClient) {
      return `/client/${activeClient.id}`;
    }
    if (routeType === 'client') return '/';
    return null;
  }, [routeType, activeClient?.id, activeConcept?.id]);


  const handleSaveSettings = async (nextSettings: GeminiSettings) => {
    setIsSavingSettings(true);
    setError(null);
    try {
      await setSettings(nextSettings);
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

  const ClientRoute: React.FC = () => {
    const { clientId } = useParams();
    useEffect(() => {
      if (clientId) {
        handleSelectClient(clientId);
      }
    }, [clientId]);
    if (!clientId) return <Navigate to="/" replace />;
    const client = workspace.clients.find((item) => item.id === clientId);
    if (!client) return <Navigate to="/" replace />;
    return (
      <ClientPage
        client={client}
        onUpdateClient={updateClient}
        onCreateConcept={handleCreateConcept}
        onSelectConcept={handleSelectConcept}
      />
    );
  };

  const ConceptRoute: React.FC = () => {
    const { clientId, conceptId } = useParams();
    useEffect(() => {
      if (clientId && conceptId) {
        handleSelectConcept(clientId, conceptId);
      }
    }, [clientId, conceptId]);
    if (!clientId || !conceptId) return <Navigate to="/" replace />;
    const client = workspace.clients.find((item) => item.id === clientId);
    if (!client) return <Navigate to="/" replace />;
    const concept = client.concepts.find((item) => item.id === conceptId);
    if (!concept) return <Navigate to={`/client/${clientId}`} replace />;

    return (
      <ConceptPage
        client={client}
        concept={concept}
        onUpdateConcept={updateConcept}
        onSelectBatch={handleSelectBatch}
        onGenerate={handleGenerate}
      />
    );
  };

  const BatchRoute: React.FC = () => {
    const { clientId, conceptId, batchId } = useParams();
    useEffect(() => {
      if (clientId && conceptId && batchId) {
        handleSelectBatch(clientId, conceptId, batchId);
      }
    }, [clientId, conceptId, batchId]);
    if (!clientId || !conceptId || !batchId) return <Navigate to="/" replace />;
    const client = workspace.clients.find((item) => item.id === clientId);
    if (!client) return <Navigate to="/" replace />;
    const concept = client.concepts.find((item) => item.id === conceptId);
    if (!concept) return <Navigate to={`/client/${clientId}`} replace />;
    const batch = concept.batches.find((item) => item.id === batchId);
    if (!batch) return <Navigate to={`/client/${clientId}/concept/${conceptId}`} replace />;

    return (
      <BatchPage
        client={client}
        concept={concept}
        batch={batch}
        isGenerating={isGenerating}
        visualBatchLoading={visualBatchLoading}
        loadingStatus={loadingStatus}
        loadingStep={loadingStep}
        loadingHints={loadingHints}
        onSelectVariant={handleSelectVariant}
        onToggleFavorite={toggleFavorite}
        onGenerateAllVisuals={handleGenerateAllVisuals}
        onExportJson={exportJson}
      />
    );
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

        <header className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between max-w-[1600px] mx-auto">
          {routeType === 'clients' ? (
            <div className="flex-1"></div>
          ) : (
            <div className="flex items-center gap-3">
              {backPath && (
                <Link
                  to={backPath}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-300 hover:border-emerald-400/50"
                >
                  Retour
                </Link>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-300">Meta Ads Studio</p>
                <h1 className="text-2xl md:text-3xl font-display">{headerTitle}</h1>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => {
                setShowSettings(true);
                if (!models && settings.apiKey) {
                  handleRefreshModels();
                }
              }}
            >
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </header>

        {error && (
          <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12">
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          </div>
        )}

        <main className="relative z-10 px-6 md:px-12 pb-16 max-w-[1600px] mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <ClientsPage
                  clients={workspace.clients}
                  onCreateClient={handleCreateClient}
                  onSelectClient={handleSelectClient}
                />
              }
            />
            <Route path="/client/:clientId" element={<ClientRoute />} />
            <Route path="/client/:clientId/concept/:conceptId" element={<ConceptRoute />} />
            <Route path="/client/:clientId/concept/:conceptId/batch/:batchId" element={<BatchRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <AdModal
        variant={selectedVariant}
        onClose={() => {
          setSelectedVariant(null);
          setSelectedContext(null);
        }}
        onToggleFavorite={(id) => selectedContext && toggleFavorite(selectedContext, id)}
        onGenerateVisual={(variant) => selectedContext && handleGenerateVisual(selectedContext, variant)}
        isGeneratingVisual={visualLoadingId === selectedVariant?.id}
        onDownloadVisual={downloadVisual}
        aspectRatio={selectedConceptForModal?.brief.aspectRatio || 'Auto'}
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

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;

import React, { useEffect } from 'react';
import { Client, GeminiModelOption, GeminiSettings } from '../types';
import { ClientList } from '../components/ClientList';
import { useNavigate } from 'react-router-dom';
import { SettingsPanel } from '../components/SettingsPanel';

interface ClientsPageProps {
  clients: Client[];
  onCreateClient: () => Client;
  onSelectClient: (id: string) => void;
  settings: GeminiSettings;
  onChangeSettings: (settings: GeminiSettings) => void;
  onSaveSettings: (settings: GeminiSettings) => void;
  isSavingSettings: boolean;
  models: GeminiModelOption[];
  textModels: GeminiModelOption[];
  imageModels: GeminiModelOption[];
  isLoadingModels: boolean;
  onRefreshModels: () => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({
  clients,
  onCreateClient,
  onSelectClient,
  settings,
  onChangeSettings,
  onSaveSettings,
  isSavingSettings,
  models,
  textModels,
  imageModels,
  isLoadingModels,
  onRefreshModels,
}) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    const client = onCreateClient();
    navigate(`/client/${client.id}`);
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    navigate(`/client/${id}`);
  };

  useEffect(() => {
    if (settings.apiKey && models.length === 0 && !isLoadingModels) {
      onRefreshModels();
    }
  }, [settings.apiKey, models.length, isLoadingModels, onRefreshModels]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Meta Ads Studio</p>
        <h2 className="text-3xl font-display text-white">Tableau de bord</h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
          Crée tes clients, configure Gemini API et lance des briefs ads Meta en quelques minutes.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <ClientList
          clients={clients}
          selectedId={undefined}
          onSelect={handleSelect}
          onCreate={handleCreate}
        />
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Gemini API</p>
            <h3 className="text-lg font-display text-white">Paramètres globaux</h3>
          </div>
          <SettingsPanel
            settings={settings}
            onChange={onChangeSettings}
            onSave={onSaveSettings}
            isSaving={isSavingSettings}
            models={models}
            textModels={textModels}
            imageModels={imageModels}
            isLoadingModels={isLoadingModels}
            onRefreshModels={onRefreshModels}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;

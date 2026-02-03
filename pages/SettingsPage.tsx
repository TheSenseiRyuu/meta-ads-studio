import React, { useEffect } from 'react';
import { GeminiModelOption, GeminiSettings } from '../types';
import { SettingsPanel } from '../components/SettingsPanel';

interface SettingsPageProps {
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

const SettingsPage: React.FC<SettingsPageProps> = ({
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
  const hasKey = Boolean(settings.apiKey.trim());

  useEffect(() => {
    if (settings.apiKey && models.length === 0 && !isLoadingModels) {
      onRefreshModels();
    }
  }, [settings.apiKey, models.length, isLoadingModels, onRefreshModels]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Paramètres</p>
        <h2 className="text-3xl font-display text-white">Gemini API</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Configure ta clé API, choisis les modèles et garde tout prêt pour lancer des briefs.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Status</p>
            <h3 className="text-lg font-display text-white">
              {hasKey ? 'Clé API configurée' : 'Clé API manquante'}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs border ${
              hasKey
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
            }`}
          >
            {hasKey ? 'Connecté' : 'Action requise'}
          </span>
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
  );
};

export default SettingsPage;

import React, { useState } from 'react';
import { GeminiSettings, GeminiModelOption } from '../types';
import { Button } from './Button';
import { Key, Settings2, Image as ImageIcon, Cpu, RefreshCcw } from 'lucide-react';

interface SettingsPanelProps {
  settings: GeminiSettings;
  onChange: (settings: GeminiSettings) => void;
  onSave: (settings: GeminiSettings) => Promise<void>;
  isSaving: boolean;
  models: GeminiModelOption[];
  textModels: GeminiModelOption[];
  imageModels: GeminiModelOption[];
  isLoadingModels: boolean;
  onRefreshModels: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  onSave,
  isSaving,
  models,
  textModels,
  imageModels,
  isLoadingModels,
  onRefreshModels,
}) => {
  const [showKey, setShowKey] = useState(false);

  const updateField = <K extends keyof GeminiSettings>(key: K, value: GeminiSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Settings</p>
          <h3 className="text-lg font-display">Gemini API</h3>
        </div>
        <Settings2 className="w-5 h-5 text-emerald-200" />
      </div>

      <div className="grid gap-4">
        <label className="text-sm text-zinc-300">
          Clé API
          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={settings.apiKey}
                onChange={(e) => updateField('apiKey', e.target.value)}
                type={showKey ? 'text' : 'password'}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 pl-9 pr-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                placeholder="AIza..."
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKey((prev) => !prev)}
            >
              {showKey ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Stockée en local (localStorage). Jamais envoyée ailleurs que votre serveur local.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCcw className="w-4 h-4" />}
              onClick={onRefreshModels}
              disabled={!settings.apiKey}
              isLoading={isLoadingModels}
            >
              Charger les modèles
            </Button>
            <span className="text-[11px] text-zinc-500">
              {models.length > 0
                ? `${models.length} modèles`
                : 'Sauvegarde la clé pour charger la liste.'}
            </span>
          </div>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-zinc-300">
            Modèle Texte
            <div className="mt-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-500" />
              <select
                value={settings.textModel}
                onChange={(e) => updateField('textModel', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                {textModels.length === 0 && (
                  <option value={settings.textModel}>{settings.textModel}</option>
                )}
                {textModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.displayName ? `${model.displayName} (${model.id})` : model.id}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="text-sm text-zinc-300">
            Modèle Image
            <div className="mt-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-zinc-500" />
              <select
                value={settings.imageModel}
                onChange={(e) => updateField('imageModel', e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                {imageModels.length === 0 && (
                  <option value={settings.imageModel}>{settings.imageModel}</option>
                )}
                {imageModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.displayName ? `${model.displayName} (${model.id})` : model.id}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <label className="text-sm text-zinc-300">
          Qualité Image
          <div className="mt-2 flex gap-3">
            {(['2K', '4K'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateField('imageSize', size)}
                className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                  settings.imageSize === size
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                    : 'border-zinc-800 text-zinc-300 hover:border-emerald-400/60'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Ces paramètres sont persistés localement et appliqués à chaque génération.
        </p>
        <Button
          variant="secondary"
          size="sm"
          isLoading={isSaving}
          onClick={() => onSave(settings)}
        >
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};

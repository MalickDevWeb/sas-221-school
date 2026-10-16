import React, { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Check, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { BrandingBackgroundUploader } from './BrandingBackgroundUploader';

const PRESET_BACKGROUNDS = [
  { name: 'Campus Moderne & Soleil', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Diplômés & Célébration', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Bibliothèque & Savoir', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80' },
  { name: 'Auditorium & Conférence', url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&auto=format&fit=crop&q=80' },
];

export const BrandingBackgroundSection: React.FC = () => {
  const { currentTenant, updateBranding } = useTenantStore();
  const [bgUrl, setBgUrl] = useState(currentTenant?.branding?.backgroundUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (urlToSave: string) => {
    setIsSaving(true);
    try {
      setBgUrl(urlToSave);
      updateBranding({ backgroundUrl: urlToSave });
      toast.success(urlToSave ? 'Photo d\'arrière-plan mise à jour pour l\'écran de connexion !' : 'Fond par défaut restauré.');
    } catch {
      toast.error('Erreur lors de la mise à jour du fond');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Photo d'Arrière-Plan du Campus (Login)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Téléversez la photo officielle du campus ou de l'école affichée sur la page de connexion <code className="bg-neutral-100 px-1 py-0.5 rounded text-indigo-600 font-mono">/t/{currentTenant?.slug || 'slug'}/login</code>.
          </p>
        </div>

        {/* Upload direct depuis l'ordinateur */}
        <BrandingBackgroundUploader currentUrl={bgUrl} onUpload={handleSave} onClear={() => handleSave('')} isSaving={isSaving} />

        {/* Option URL manuelle */}
        <div className="pt-2">
          <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer">
            <LinkIcon size={12} /> {showUrlInput ? 'Masquer la saisie par URL' : 'Ou renseigner directement une URL d\'image hébergée'}
          </button>

          {showUrlInput && (
            <div className="flex gap-2 mt-2 animate-in fade-in duration-200">
              <input type="url" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://images.unsplash.com/... ou URL hébergée" className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none" />
              <button type="button" onClick={() => handleSave(bgUrl)} disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Modèles présélectionnés */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">Ou sélectionnez un fond de campus haute définition :</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_BACKGROUNDS.map((preset) => {
              const isSelected = bgUrl === preset.url;
              return (
                <div key={preset.name} onClick={() => handleSave(preset.url)} className={`group relative h-20 rounded-xl overflow-hidden cursor-pointer border transition-all ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:opacity-95'}`}>
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2 justify-between">
                    <span className="text-[10px] font-bold text-white drop-shadow-xs truncate">{preset.name}</span>
                    {isSelected && <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow"><Check size={9} /></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500">
            Aperçu instantané sur <a href={`/t/${currentTenant?.slug || 'ecole221'}/login`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">/t/{currentTenant?.slug || 'ecole221'}/login ↗</a>
          </div>
          {bgUrl && (
            <button type="button" onClick={() => handleSave('')} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
              <RefreshCw size={12} /> Réinitialiser au fond par défaut
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

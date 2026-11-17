import React, { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { BrandingBackgroundUploader } from './BrandingBackgroundUploader';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { enregistrerIdentite, envoyerImage } from '@/shared/lib/identiteVisuelle';

/* Aucune photo proposée (ni modèle de logo) : le contenu de photos externes (personnes identifiables, marques) ne
   peut pas être vérifié, et ce ne sont pas des photos de l'école. L'école envoie sa propre photo ou colle un lien. */

export const BrandingBackgroundSection: React.FC = () => {
  const { currentTenant, updateBranding } = useTenantStore();
  const [bgUrl, setBgUrl] = useState(currentTenant?.branding?.backgroundUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /** Enregistré côté serveur d'abord. */
  const handleSave = async (urlToSave: string) => {
    setIsSaving(true);
    try {
      const enregistre = await enregistrerIdentite({ backgroundUrl: urlToSave });
      setBgUrl(enregistre.backgroundUrl ?? '');
      updateBranding({ backgroundUrl: enregistre.backgroundUrl ?? undefined });
      toast.success(urlToSave ? 'Photo d\'arrière-plan enregistrée pour l\'écran de connexion.' : 'Fond par défaut restauré.');
    } catch (err) {
      toast.error(`Fond non enregistré : ${resolveErrorMessage(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFichier = async (fichier: File) => {
    setIsSaving(true);
    try {
      await handleSave(await envoyerImage(fichier));
    } catch (err) {
      toast.error(`Image non envoyée : ${resolveErrorMessage(err)}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Photo de la page de connexion
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Téléversez la photo officielle du campus ou de l'école affichée sur la page de connexion <code className="bg-neutral-100 px-1 py-0.5 rounded text-indigo-600 font-mono">/t/{currentTenant?.slug || 'slug'}/login</code>.
          </p>
        </div>

        {/* Upload direct depuis l'ordinateur */}
        <BrandingBackgroundUploader currentUrl={bgUrl} onUpload={(f) => void handleFichier(f)} onClear={() => void handleSave('')} isSaving={isSaving} />

        {/* Option URL manuelle */}
        <div className="pt-2">
          <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer">
            <LinkIcon size={12} /> {showUrlInput ? 'Masquer la saisie du lien' : 'Ou coller le lien d\'une image déjà en ligne'}
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

        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500">
            {currentTenant?.slug
              ? <>Aperçu sur la page de connexion : <a href={`/t/${currentTenant.slug}/login`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">ouvrir ↗</a></>
              : 'Aperçu indisponible : établissement non identifié.'}
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

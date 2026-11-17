import React, { useState } from 'react';
import { toast } from 'sonner';
import { Image, Link as LinkIcon } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { enregistrerIdentite, envoyerImage } from '@/shared/lib/identiteVisuelle';
import { BrandingLogoUploader } from './BrandingLogoUploader';

export const BrandingLogoSection: React.FC = () => {
  const { currentTenant, updateBranding } = useTenantStore();
  const [logoUrl, setLogoUrl] = useState(currentTenant?.branding?.logoUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /** Enregistré côté serveur d'abord ; l'affichage ne change qu'après sa confirmation. */
  const handleSave = async (urlToSave: string) => {
    setIsSaving(true);
    try {
      const enregistre = await enregistrerIdentite({ logoUrl: urlToSave });
      setLogoUrl(enregistre.logoUrl ?? '');
      updateBranding({ logoUrl: enregistre.logoUrl ?? undefined });
      toast.success(urlToSave ? 'Logo enregistré.' : 'Logo supprimé.');
    } catch (err) {
      toast.error(`Logo non enregistré : ${resolveErrorMessage(err)}`);
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
            <Image className="w-5 h-5 text-indigo-600" /> Logo de l'Établissement
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ce logo s'affiche sur la page de connexion, le portail tuteurs, les bulletins et les relevés officiels.
          </p>
        </div>

        {/* Upload direct de fichier */}
        <BrandingLogoUploader currentUrl={logoUrl} onUpload={(f) => void handleFichier(f)} onClear={() => void handleSave('')} />

        {/* Option URL manuelle */}
        <div className="pt-2">
          <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1.5 cursor-pointer">
            <LinkIcon size={12} /> {showUrlInput ? 'Masquer la saisie par URL' : 'Ou saisir une URL de logo en ligne'}
          </button>

          {showUrlInput && (
            <div className="flex gap-2 mt-2 animate-in fade-in duration-200">
              <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://mon-ecole.sn/logo.png" className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none" />
              <button type="button" onClick={() => handleSave(logoUrl)} disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                Appliquer
              </button>
            </div>
          )}
        </div>

        {/* Pas de « modèles prédéfinis » : chaque école utilise son propre logo. */}
      </div>
    </div>
  );
};

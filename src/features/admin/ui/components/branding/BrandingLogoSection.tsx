import React, { useState } from 'react';
import { toast } from 'sonner';
import { Image, Check, Link as LinkIcon } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { superAdminService } from '@/services/superAdminService';
import { BrandingLogoUploader } from './BrandingLogoUploader';

const PRESET_LOGOS = [
  { name: 'Emblème Universitaire', url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Blason Académique', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Étoile Tech & Sciences', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80' },
  { name: 'Campus Excellence', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80' },
];

export const BrandingLogoSection: React.FC = () => {
  const { currentTenant, updateBranding } = useTenantStore();
  const [logoUrl, setLogoUrl] = useState(currentTenant?.branding?.logoUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (urlToSave: string) => {
    setIsSaving(true);
    try {
      setLogoUrl(urlToSave);
      updateBranding({ logoUrl: urlToSave });
      if (currentTenant?.id && !currentTenant.id.startsWith('mock-') && !currentTenant.id.startsWith('default-')) {
        await superAdminService.updateTenant(currentTenant.id, { logo: urlToSave });
      }
      toast.success(urlToSave ? 'Logo officiel mis à jour avec succès !' : 'Logo supprimé.');
    } catch {
      toast.error('Erreur lors de la sauvegarde du logo');
    } finally {
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
        <BrandingLogoUploader currentUrl={logoUrl} onUpload={handleSave} onClear={() => handleSave('')} />

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

        {/* Modèles de logos prédéfinis */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">Ou choisissez un modèle prédéfini :</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_LOGOS.map((preset) => {
              const isSelected = logoUrl === preset.url;
              return (
                <div key={preset.name} onClick={() => handleSave(preset.url)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'}`}>
                  <img src={preset.url} alt={preset.name} className="w-12 h-12 rounded-lg object-cover shadow-xs" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{preset.name}</span>
                  {isSelected && <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1"><Check size={11} /> Actif</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Image, Check, Sparkles } from 'lucide-react';
import { useTenantStore } from '@/core/store/tenantStore';
import { superAdminService } from '@/services/superAdminService';

const PRESET_LOGOS = [
  { name: 'Emblème Universitaire', url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=80' },
  { name: 'Blason Académique', url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Étoile Tech & Sciences', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80' },
  { name: 'Campus Excellence', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80' },
];

export const BrandingLogoSection: React.FC = () => {
  const { currentTenant, updateBranding } = useTenantStore();
  const [logoUrl, setLogoUrl] = useState(currentTenant?.branding?.logoUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (urlToSave: string) => {
    setIsSaving(true);
    try {
      updateBranding({ logoUrl: urlToSave });
      if (currentTenant?.id && !currentTenant.id.startsWith('mock-') && !currentTenant.id.startsWith('default-')) {
        await superAdminService.updateTenant(currentTenant.id, { logo: urlToSave });
      }
      toast.success('Logo officiel de l\'établissement mis à jour !');
    } catch {
      toast.error('Erreur lors de la sauvegarde du logo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Image className="w-5 h-5 text-indigo-600" /> Logo de l'Établissement
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ce logo s'affichera sur l'écran de connexion des élèves, le portail parents, les bulletins et les badges.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">URL du Logo (PNG ou SVG transparent recommandé)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://mon-ecole.sn/images/logo.png"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => handleSave(logoUrl)}
              disabled={isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Enregistrement...' : 'Appliquer'}
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">Ou choisissez parmi des modèles prédéfinis :</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_LOGOS.map((preset) => {
              const isSelected = logoUrl === preset.url;
              return (
                <div
                  key={preset.name}
                  onClick={() => { setLogoUrl(preset.url); handleSave(preset.url); }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center cursor-pointer transition-all ${
                    isSelected ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' : 'border-neutral-200 bg-neutral-50/50 hover:bg-white'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-12 h-12 rounded-lg object-cover shadow-xs" />
                  <span className="text-[11px] font-bold text-slate-800 leading-tight">{preset.name}</span>
                  {isSelected && <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1"><Check size={11} /> Actif</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Aperçu en direct */}
        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border border-neutral-200 bg-neutral-100 flex items-center justify-center p-1 overflow-hidden shadow-inner">
              {logoUrl ? <img src={logoUrl} alt="Aperçu logo" className="max-w-full max-h-full object-contain" /> : <Sparkles className="text-slate-400" size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Aperçu en direct</p>
              <p className="text-[11px] text-slate-500">{currentTenant?.name || 'Mon Établissement'}</p>
            </div>
          </div>
          {logoUrl && (
            <button type="button" onClick={() => { setLogoUrl(''); handleSave(''); }} className="text-xs text-rose-500 hover:underline cursor-pointer">
              Supprimer le logo (retour au texte)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


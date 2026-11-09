import React from 'react';
import { useAuthStore } from '@/core/store/authStore';

export function ParentProfilePage() {
  // Données réelles du compte connecté uniquement. Le backend n'enregistre pas encore
  // la modification du profil parent (PATCH /parent/profil non persistant) :
  // les champs sont donc en lecture seule, sans faux « succès ».
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const prenom = (utilisateur as { prenom?: string } | null)?.prenom?.trim() || '';
  const nom = utilisateur?.nom?.trim() || '';
  const email = utilisateur?.email?.trim() || '';
  const initiales = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || '—';
  const fields: { label: string; value: string; wide?: boolean }[] = [
    { label: 'Prénom', value: prenom },
    { label: 'Nom', value: nom },
    { label: 'Email', value: email },
    { label: 'Téléphone', value: '' },
    { label: 'Adresse complète', value: '', wide: true },
    { label: 'Profession', value: '', wide: true },
  ];

  const inputCls = "w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder-neutral-300";

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full animate-fade-in pb-28 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">person</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Mon Profil</h1>
            <p className="text-xs text-neutral-500 font-semibold">Gérez vos informations personnelles et de contact</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-black shadow-inner">
            {initiales}
          </div>
          <div className="text-center sm:text-left flex-1 mt-2">
            <h2 className="text-2xl font-black text-neutral-900">{[prenom, nom].filter(Boolean).join(' ') || '—'}</h2>
            <p className="text-sm text-neutral-500 font-semibold mt-1">{email || 'Non renseigné'}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-200">
                Parent d'élève
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div id="parent-profile-readonly-note" className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs font-bold flex items-center gap-3">
            <span translate="no" className="material-symbols-outlined text-blue-600">info</span>
            Modification du profil bientôt disponible — contactez l'établissement
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map((f) => (
              <div key={f.label} className={`space-y-1.5${f.wide ? ' sm:col-span-2' : ''}`}>
                <span className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">{f.label}</span>
                <div className={`${inputCls} flex items-center bg-neutral-50 cursor-default ${f.value ? '' : 'text-neutral-400'}`}>
                  {f.value || 'Non renseigné'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

import { parentApi } from '@/features/parent/api';

const STATUT_CFG = {
  EN_ATTENTE: {
    label: 'En attente',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: 'schedule',
    dot: 'bg-amber-500',
  },
  VALIDE: {
    label: 'Validé',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: 'check_circle',
    dot: 'bg-emerald-500',
  },
  REFUSE: {
    label: 'Refusé',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: 'cancel',
    dot: 'bg-red-500',
  },
};

export function ParentApplicationTrackingPage() {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  React.useEffect(() => {
    parentApi.getApplications()
      .then((data: any) => {
        setDossiers(data || []);
        if (data && data.length > 0) {
          setExpanded(data[0].id);
        }
      })
      .catch((err: any) => {
        console.warn("Erreur chargement candidatures:", err);
        setDossiers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: dossiers.length,
    valide: dossiers.filter((d) => d.statut === 'VALIDE' || d.statut === 'ACCEPTE').length,
    attente: dossiers.filter((d) => d.statut === 'EN_ATTENTE' || !d.statut).length,
    refuse: dossiers.filter((d) => d.statut === 'REFUSE').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Suivi des dossiers</h1>
            <p className="text-xs text-neutral-500 font-semibold mt-1">Statut de vos demandes d'inscription</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.parent.inscrireEnfant)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all"
          >
            <span translate="no" className="material-symbols-outlined text-[16px]">person_add</span>
            Nouveau dossier
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, color: 'blue', icon: 'folder' },
          { label: 'Validés', value: counts.valide, color: 'emerald', icon: 'check_circle' },
          { label: 'En attente', value: counts.attente, color: 'amber', icon: 'schedule' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 text-center">
            <span translate="no" className={`material-symbols-outlined text-[22px] mb-1 ${
              color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
            }`}>{icon}</span>
            <p className={`text-2xl font-black ${
              color === 'blue' ? 'text-blue-700' : color === 'emerald' ? 'text-emerald-700' : 'text-amber-700'
            }`}>{value}</p>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste dossiers */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-400 font-bold">
            Chargement de vos dossiers de candidature...
          </div>
        ) : dossiers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-xs">
            <span translate="no" className="material-symbols-outlined text-4xl text-neutral-300 mb-2">folder_open</span>
            <p className="font-bold text-neutral-600 text-sm">Aucun dossier d'inscription soumis pour le moment.</p>
            <p className="text-xs text-neutral-400 mt-1">Cliquez sur « Nouveau dossier » pour inscrire un enfant.</p>
          </div>
        ) : (
          dossiers.map((d) => {
            const statutKey = (d.statut || 'EN_ATTENTE') as keyof typeof STATUT_CFG;
            const cfg = STATUT_CFG[statutKey] || STATUT_CFG.EN_ATTENTE;
            const isOpen = expanded === d.id;
            return (
              <div key={d.id} className={`bg-white rounded-3xl border border-solid shadow-sm overflow-hidden transition-all ${cfg.bg}`}>
              {/* En-tête dossier */}
              <button
                onClick={() => setExpanded(isOpen ? null : d.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/60 transition-colors"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  d.statut === 'VALIDE' ? 'bg-emerald-100' : d.statut === 'REFUSE' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                  <span translate="no" className={`material-symbols-outlined text-[22px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-sm text-neutral-800">{d.enfant}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-solid ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">{d.filiere} · {d.niveau}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-neutral-400 font-semibold">
                    {new Date(d.dateDepot).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                  <span translate="no" className={`material-symbols-outlined text-[18px] text-neutral-400 mt-1 block transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </div>
              </button>

              {/* Détails */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-dashed border-neutral-200 pt-4">
                  {/* Barre de progression */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-wider">Avancement</p>
                      <p className="text-[10px] font-black text-neutral-500">{d.progress}%</p>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          d.statut === 'VALIDE' ? 'bg-emerald-500' : d.statut === 'REFUSE' ? 'bg-red-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${d.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-semibold mt-1">{d.etape}</p>
                  </div>

                  {/* Étapes visuelles */}
                  <div className="flex items-center gap-1">
                    {['Déposé', 'En vérification', 'Décision', 'Confirmé'].map((step, i) => {
                      const done = d.progress > i * 25;
                      const active = d.progress > i * 25 && d.progress <= (i + 1) * 25 + 1;
                      return (
                        <React.Fragment key={step}>
                          <div className={`flex flex-col items-center gap-0.5 flex-1 ${done || active ? '' : 'opacity-40'}`}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-black ${
                              done ? 'bg-emerald-500' : active ? 'bg-amber-500' : 'bg-neutral-300'
                            }`}>{i + 1}</div>
                            <p className="text-[7px] font-bold text-neutral-500 text-center leading-tight">{step}</p>
                          </div>
                          {i < 3 && <div className={`h-px flex-1 mb-3 ${done ? 'bg-emerald-400' : 'bg-neutral-200'}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Commentaire admin */}
                  {d.commentaire && (
                    <div className={`rounded-2xl p-4 border border-solid ${
                      d.statut === 'VALIDE' ? 'bg-emerald-50 border-emerald-200' :
                      d.statut === 'REFUSE' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${cfg.color}`}>
                        Commentaire de l'administration
                      </p>
                      <p className="text-xs text-neutral-700 leading-relaxed">{d.commentaire}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {d.statut === 'REFUSE' && (
                    <button
                      onClick={() => navigate(ROUTES.parent.inscrireEnfant)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-[#0D47A1] transition-all"
                    >
                      <span translate="no" className="material-symbols-outlined text-[14px]">refresh</span>
                      Resoumettre le dossier
                    </button>
                  )}
                  {d.statut === 'VALIDE' && (
                    <div className="flex gap-2 flex-wrap">
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all">
                        <span translate="no" className="material-symbols-outlined text-[14px]">download</span>
                        Télécharger la confirmation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

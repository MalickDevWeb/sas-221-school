import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { Student } from '../../../../domain/StudentModels';

/** Réponse de GET /admin/students/{id}/synthese (APP-TL-24). */
interface Synthese {
  moyenneGenerale: number | null;
  moyenneProvisoire: boolean;
  matieresNotees: number;
  matieresSous10: { cours: string; moyenne: number }[];
  assiduite: { taux: number | null; present: number | null; retard: number | null; absent: number | null; excuse: number | null; seancesNotees: number | null };
  devoirsEchus: number;
  devoirsNonRendus: { titre: string; cours: string | null; echeance: string }[];
  alertes: string[];
  niveau: 'a_suivre' | 'sans_alerte' | 'donnees_insuffisantes';
  regles: string[];
}

const NIVEAUX: Record<Synthese['niveau'], { libelle: string; classe: string }> = {
  a_suivre: { libelle: 'À suivre', classe: 'bg-rose-50 text-rose-700 border-rose-200' },
  sans_alerte: { libelle: 'Aucune alerte', classe: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  donnees_insuffisantes: { libelle: 'Données insuffisantes', classe: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
};

const nombre = (v: number | null | undefined, suffixe = '') =>
  typeof v === 'number' ? `${v.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}${suffixe}` : '—';

/**
 * Synthèse du suivi (APP-TL-24) : remplace l'onglet « Diagnostic IA ». Valeurs calculées par le serveur à partir des
 * notes, présences et devoirs enregistrés, avec les règles appliquées ; aucune IA, aucun score, aucune probabilité.
 */
export function TabSynthese({ selectedStudent }: { selectedStudent: Student }) {
  const synthese = useQuery({
    queryKey: ['admin', 'eleves', selectedStudent.id, 'synthese'],
    enabled: Boolean(selectedStudent.id),
    queryFn: async () => (await apiClient.get<Synthese>(`/admin/students/${selectedStudent.id}/synthese`)).data,
  });

  if (synthese.isLoading) {
    return <p className="text-xs font-semibold text-neutral-500" id="tab-synthese">Calcul de la synthèse…</p>;
  }
  if (synthese.isError || !synthese.data) {
    return (
      <div className="text-xs font-semibold text-rose-700" id="tab-synthese">
        Synthèse indisponible : {resolveErrorMessage(synthese.error)}
      </div>
    );
  }

  const s = synthese.data;
  const niveau = NIVEAUX[s.niveau] ?? NIVEAUX.donnees_insuffisantes;
  const a = s.assiduite ?? { taux: null, present: null, retard: null, absent: null, excuse: null, seancesNotees: null };

  return (
    <div className="space-y-4 text-xs font-semibold text-neutral-600" id="tab-synthese">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-black text-primary uppercase tracking-wider m-0">Synthèse du suivi</h4>
        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase ${niveau.classe}`}>{niveau.libelle}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 m-0">Moyenne générale</p>
          <p className="text-base font-black text-neutral-800 mt-0.5 mb-0">{nombre(s.moyenneGenerale, ' / 20')}</p>
          <p className="text-[10px] text-neutral-400 m-0">
            {s.matieresNotees} matière(s) notée(s){s.moyenneProvisoire ? ' — moyenne provisoire' : ''}
          </p>
        </div>
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 m-0">Assiduité</p>
          <p className="text-base font-black text-neutral-800 mt-0.5 mb-0">{nombre(a.taux, ' %')}</p>
          <p className="text-[10px] text-neutral-400 m-0">
            {nombre(a.seancesNotees)} séance(s) notée(s) · {nombre(a.absent)} absence(s) · {nombre(a.retard)} retard(s) · {nombre(a.excuse)} excusée(s)
          </p>
        </div>
        <div className="border border-neutral-100 p-3 bg-neutral-50/50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 m-0">Devoirs échus</p>
          <p className="text-base font-black text-neutral-800 mt-0.5 mb-0">
            {s.devoirsEchus > 0 ? `${s.devoirsNonRendus.length} non rendu(s) sur ${s.devoirsEchus}` : '—'}
          </p>
          <p className="text-[10px] text-neutral-400 m-0">Date limite passée</p>
        </div>
      </div>

      {s.alertes.length > 0 ? (
        <div className="border border-rose-100 p-3.5 bg-rose-50/40 rounded-2xl space-y-1">
          <h5 className="font-extrabold text-[10px] uppercase tracking-wider text-rose-800 m-0">Alertes</h5>
          {s.alertes.map((t) => (
            <p key={t} className="bg-white p-2.5 rounded-xl border border-neutral-100 text-[11px] text-neutral-700 font-bold m-0">{t}</p>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-neutral-500 m-0">
          {s.niveau === 'donnees_insuffisantes'
            ? "Aucune note ni séance notée n'est encore enregistrée pour cet élève."
            : 'Aucune règle de suivi n’est déclenchée.'}
        </p>
      )}

      {s.devoirsNonRendus.length > 0 && (
        <ul className="m-0 pl-4 text-[11px] text-neutral-600 space-y-0.5">
          {s.devoirsNonRendus.map((d) => (
            <li key={`${d.titre}-${d.echeance}`}>{d.titre}{d.cours ? ` (${d.cours})` : ''} — date limite {d.echeance}</li>
          ))}
        </ul>
      )}

      <div className="border-t border-neutral-100 pt-3 space-y-0.5">
        {s.regles.map((r) => (
          <p key={r} className="text-[10px] text-neutral-400 m-0">{r}</p>
        ))}
        <p className="text-[10px] text-neutral-400 m-0">
          Calculé à partir des notes, présences et devoirs enregistrés — aucune IA, aucun score ni probabilité.
        </p>
      </div>
    </div>
  );
}

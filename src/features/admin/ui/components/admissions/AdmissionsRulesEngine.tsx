import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { EnTeteModule } from '@/shared/components/EnTeteModule';
import { getAdmissionsDb } from '@/features/auth/ui/components/candidature/portal/admissionsDb';
import { RegleFormModal } from './regles/RegleFormModal';
import { useReglesAdmission } from './regles/useReglesAdmission';
import { regleVide, resumeConditions, resumeEffet, type Regle } from './regles/reglesModele';

/** Sessions (campagnes) de l'école, relues quand la synchronisation des admissions se termine. */
function useSessions() {
  const lire = () => getAdmissionsDb().campaigns.map((c) => ({ id: c.id, titre: c.title }));
  const [sessions, setSessions] = useState(lire);
  useEffect(() => {
    const maj = () => setSessions(lire());
    window.addEventListener('admissions_db_synced', maj);
    return () => window.removeEventListener('admissions_db_synced', maj);
  }, []);
  return sessions;
}

const ICONES: Record<Regle['effet']['type'], string> = { EXIGER_PIECE: 'upload_file', BLOQUER: 'block', AVERTIR: 'warning' };

/**
 * Règles d'admission de l'école. Ici l'école crée ses propres règles « SI … ALORS … » ; le serveur les enregistre et
 * les applique au dépôt de chaque dossier.
 */
export function AdmissionsRulesEngine() {
  const { liste, enregistrer, supprimer } = useReglesAdmission();
  const sessions = useSessions();
  const [filtre, setFiltre] = useState<string>('TOUTES');
  const [edition, setEdition] = useState<Regle | null>(null);

  const titreSession = (id: string | null) => (id === null ? 'Toutes les sessions'
    : `Session « ${sessions.find((s) => s.id === id)?.titre ?? 'supprimée'} »`);
  const regles = useMemo(() => (liste.data ?? []).filter((r) =>
    filtre === 'TOUTES' || r.session === null || r.session === filtre), [liste.data, filtre]);

  const sauver = async (r: Regle): Promise<string | null> => {
    try {
      await enregistrer.mutateAsync(r);
      toast.success(r.id ? `Règle « ${r.nom} » modifiée.` : `Règle « ${r.nom} » créée : elle s'applique aux nouveaux dossiers.`);
      setEdition(null);
      return null;
    } catch (err) {
      return resolveErrorMessage(err);
    }
  };

  const basculer = async (r: Regle) => {
    try {
      await enregistrer.mutateAsync({ ...r, actif: !r.actif });
      toast.success(r.actif ? `Règle « ${r.nom} » désactivée.` : `Règle « ${r.nom} » activée.`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  const effacer = async (r: Regle) => {
    if (!r.id || !(await demanderConfirmation(`Supprimer la règle « ${r.nom} » ? Les dossiers déjà déposés ne changent pas.`,
      { titre: 'Supprimer une règle', confirmer: 'Supprimer', danger: true }))) return;
    try {
      await supprimer.mutateAsync(r.id);
      toast.success(`Règle « ${r.nom} » supprimée.`);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4" id="regles-admission">
      <EnTeteModule
        icone="rule"
        titre="Règles d'admission"
        sousTitre="Vos conditions pour chaque dossier : exiger une pièce, bloquer le dépôt ou vous avertir. Appliquées au dépôt, sur le portail comme par les parents."
        actions={
          <button type="button" id="regles-nouvelle" onClick={() => setEdition(regleVide(filtre === 'TOUTES' ? null : filtre))}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black border-0 cursor-pointer hover:opacity-90 flex items-center gap-1.5">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            Nouvelle règle
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="regles-filtre" className="text-[11px] font-black uppercase tracking-wide text-neutral-500">Session</label>
        <select id="regles-filtre" value={filtre} onChange={(e) => setFiltre(e.target.value)}
          className="h-9 px-3 border border-neutral-200 rounded-xl bg-white text-xs font-semibold text-slate-900">
          <option value="TOUTES">Toutes les règles</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{s.titre}</option>)}
        </select>
        {filtre !== 'TOUTES' && <span className="text-[11px] font-semibold text-neutral-500">Règles de cette session et règles valables pour toutes.</span>}
      </div>

      {liste.isPending && <p role="status" className="text-xs font-semibold text-neutral-500">Chargement des règles…</p>}
      {liste.isError && (
        <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          Les règles n'ont pas pu être chargées : {resolveErrorMessage(liste.error)}
        </p>
      )}

      {liste.isSuccess && regles.length === 0 && (
        <div className="border border-dashed border-neutral-300 rounded-2xl p-6 text-center space-y-2 bg-white">
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-4xl text-neutral-300">rule</span>
          <p className="text-sm font-black text-slate-900 m-0">Aucune règle pour l'instant</p>
          <p className="text-xs font-semibold text-neutral-500 m-0 max-w-lg mx-auto">
            Exemples : SI la nationalité n'est pas Sénégal ALORS exiger le passeport ; SI l'âge est inférieur à 16 ans ALORS
            vous avertir ; SI la série du bac n'est pas S2 ALORS bloquer le dépôt avec votre message.
          </p>
        </div>
      )}

      <ul className="space-y-2.5" aria-label="Règles d'admission">
        {regles.map((r) => (
          <li key={r.id} className={`bg-white border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-start gap-3 ${r.actif ? 'border-neutral-200' : 'border-dashed border-neutral-300 opacity-70'}`}>
            <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[22px] ${r.effet.type === 'BLOQUER' ? 'text-rose-600' : r.effet.type === 'AVERTIR' ? 'text-amber-600' : 'text-primary'}`}>
              {ICONES[r.effet.type]}
            </span>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 m-0">{r.nom}</h4>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">{titreSession(r.session)}</span>
                {!r.actif && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">Désactivée</span>}
              </div>
              <p className="text-xs font-semibold text-neutral-600 m-0">
                <span className="font-black text-primary">SI</span> {resumeConditions(r)}{' '}
                <span className="font-black text-primary">ALORS</span> {resumeEffet(r.effet)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button type="button" onClick={() => void basculer(r)} disabled={enregistrer.isPending}
                className="px-3 py-1.5 rounded-lg text-[11px] font-black border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                {r.actif ? 'Désactiver' : 'Activer'}
              </button>
              <button type="button" onClick={() => setEdition(r)} aria-label={`Modifier la règle ${r.nom}`} title="Modifier"
                className="h-8 w-8 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-primary flex items-center justify-center cursor-pointer">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button type="button" onClick={() => void effacer(r)} aria-label={`Supprimer la règle ${r.nom}`} title="Supprimer"
                className="h-8 w-8 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer">
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {edition && (
        <RegleFormModal regle={edition} sessions={sessions} onFermer={() => setEdition(null)} onEnregistrer={sauver} />
      )}
    </div>
  );
}

import { useState, type ReactNode } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import {
  MOTIF_MAX, dateFr, emailAffichable, useActionDemande, useDossierTransfere, type ActionDemande, type Demande, type StatutDemande,
} from './transfertsApi';

const BADGES: Record<StatutDemande, { texte: string; icone: string; classe: string }> = {
  EN_ATTENTE: { texte: 'En attente', icone: 'schedule', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
  ACCEPTEE: { texte: 'Acceptée', icone: 'check_circle', classe: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  REFUSEE: { texte: 'Refusée', icone: 'cancel', classe: 'bg-red-50 text-red-700 border-red-200' },
  ANNULEE: { texte: 'Annulée', icone: 'block', classe: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

const initiales = (nom?: string) =>
  (nom ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((m) => m[0]?.toUpperCase()).join('') || '?';

const bouton = 'px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

/** Une demande de transfert, reçue (« entrant ») ou envoyée (« sortant »), avec ses actions confirmées. */
export function CarteDemande({ d, sens, peutModifier }: { d: Demande; sens: 'entrant' | 'sortant'; peutModifier: boolean }) {
  const action = useActionDemande();
  const [mode, setMode] = useState<ActionDemande['type'] | null>(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [erreurMotif, setErreurMotif] = useState('');
  const [retour, setRetour] = useState<{ texte: string; ok: boolean } | null>(null);
  const [dossierOuvert, setDossierOuvert] = useState(false);

  const nom = d.eleve.nom || 'Élève';
  const autreEcole = (sens === 'entrant' ? d.ecoleSource.nom : d.ecoleDestination.nom) || 'École inconnue';
  const badge = BADGES[d.statut] ?? BADGES.ANNULEE;
  const enAttente = d.statut === 'EN_ATTENTE';
  const peutDecider = sens === 'entrant' && enAttente && peutModifier;
  const peutAnnuler = sens === 'sortant' && enAttente && peutModifier;

  const fermer = () => { setMode(null); setMotifRefus(''); setErreurMotif(''); };

  const executer = async (a: ActionDemande, succes: string) => {
    setRetour(null);
    try {
      await action.mutateAsync({ id: d.id, action: a });
      setRetour({ texte: succes, ok: true });
      fermer();
    } catch (e) {
      setRetour({ texte: resolveErrorMessage(e), ok: false });
    }
  };

  const confirmerRefus = () => {
    const m = motifRefus.trim();
    if (!m) { setErreurMotif('Indiquez le motif du refus : il sera transmis à l’école d’origine.'); return; }
    if (m.length > MOTIF_MAX) { setErreurMotif(`Le motif ne doit pas dépasser ${MOTIF_MAX} caractères.`); return; }
    void executer({ type: 'refuser', motif: m }, `Demande refusée ; le motif a été transmis à ${autreEcole}.`);
  };

  return (
    <li data-transfert={d.id} className="bg-white rounded-2xl border border-neutral-200 p-4 min-w-0">
      <div className="flex items-start gap-3 min-w-0">
        <div aria-hidden="true" className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
          {initiales(d.eleve.nom)}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-black text-neutral-900 break-words">{nom}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${badge.classe}`}>
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[13px]">{badge.icone}</span>
              {badge.texte}
            </span>
          </div>
          <p className="text-[11px] text-neutral-600 font-semibold break-words">
            {d.eleve.matricule ? <>{d.eleve.matricule} · </> : null}
            {sens === 'entrant' ? 'De' : 'Vers'} <b className="text-neutral-800">{autreEcole}</b>
          </p>
          <p className="text-[11px] text-neutral-500 font-semibold">
            Demandée le {dateFr(d.creeLe)}
            {d.decideLe ? <> · {d.statut === 'ANNULEE' ? 'annulée' : 'traitée'} le {dateFr(d.decideLe)}</> : null}
          </p>
          {d.motif && <p className="text-xs text-neutral-800 whitespace-pre-line break-words pt-1">« {d.motif} »</p>}
          {d.motifDecision && (
            <p className="text-[11px] text-red-700 font-semibold whitespace-pre-line break-words">
              {d.statut === 'REFUSEE' ? 'Motif du refus' : 'Note'} : {d.motifDecision}
            </p>
          )}
        </div>
      </div>

      {(peutDecider || peutAnnuler || d.dossierDisponible) && mode === null && (
        <div className="flex flex-wrap justify-end gap-2 mt-3 pt-3 border-t border-neutral-100">
          {d.dossierDisponible && (
            <button type="button" onClick={() => setDossierOuvert((o) => !o)} aria-expanded={dossierOuvert} aria-controls={`dossier-${d.id}`}
              className={`${bouton} bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 mr-auto`}>
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">folder_open</span>
              {dossierOuvert ? 'Masquer le dossier' : 'Voir le dossier transféré'}
            </button>
          )}
          {peutDecider && (
            <>
              <button type="button" onClick={() => { setRetour(null); setMode('refuser'); }}
                className={`${bouton} bg-white border border-red-300 text-red-700 hover:bg-red-50`}>Refuser</button>
              <button type="button" onClick={() => { setRetour(null); setMode('accepter'); }}
                className={`${bouton} bg-emerald-600 hover:bg-emerald-700 text-white`}>
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">how_to_reg</span>Accepter l’élève
              </button>
            </>
          )}
          {peutAnnuler && (
            <button type="button" onClick={() => { setRetour(null); setMode('annuler'); }}
              className={`${bouton} bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50`}>Annuler la demande</button>
          )}
        </div>
      )}

      {mode === 'accepter' && (
        <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 space-y-2">
          <p className="text-xs font-bold text-emerald-900">
            Accueillir {nom} dans votre école ? L’élève quitte {autreEcole} et une copie de son dossier vous est remise.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={fermer} disabled={action.isPending} className={`${bouton} text-neutral-600 hover:bg-white`}>Retour</button>
            <button type="button" disabled={action.isPending} className={`${bouton} bg-emerald-600 hover:bg-emerald-700 text-white`}
              onClick={() => void executer({ type: 'accepter' }, `${nom} fait désormais partie de votre école ; son dossier vous a été remis.`)}>
              {action.isPending ? 'Acceptation…' : 'Confirmer l’accueil'}
            </button>
          </div>
        </div>
      )}

      {mode === 'refuser' && (
        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1">
          <label htmlFor={`refus-${d.id}`} className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Motif du refus <span className="text-red-500">*</span>
          </label>
          <textarea id={`refus-${d.id}`} value={motifRefus} maxLength={MOTIF_MAX} rows={2}
            onChange={(e) => { setMotifRefus(e.target.value); setErreurMotif(''); }}
            aria-invalid={erreurMotif ? true : undefined} aria-describedby={erreurMotif ? `refus-${d.id}-erreur` : undefined}
            placeholder="Ex. : classe complète pour cette année"
            className={`w-full px-3 py-2 border rounded-xl bg-white text-xs font-semibold outline-none focus:border-primary resize-none ${erreurMotif ? 'border-red-400' : 'border-neutral-200'}`} />
          {erreurMotif
            ? <p id={`refus-${d.id}-erreur`} className="text-[10px] text-red-600 font-semibold">{erreurMotif}</p>
            : <p className="text-[10px] text-neutral-500 font-semibold">Transmis à {autreEcole} ; l’élève y reste inscrit.</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="button" onClick={fermer} disabled={action.isPending} className={`${bouton} text-neutral-600 hover:bg-neutral-100`}>Retour</button>
            <button type="button" onClick={confirmerRefus} disabled={action.isPending} className={`${bouton} bg-red-600 hover:bg-red-700 text-white`}>
              {action.isPending ? 'Envoi…' : 'Confirmer le refus'}
            </button>
          </div>
        </div>
      )}

      {mode === 'annuler' && (
        <div className="mt-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
          <p className="text-xs font-bold text-neutral-800">Annuler la demande envoyée à {autreEcole} ? {nom} reste dans votre école.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={fermer} disabled={action.isPending} className={`${bouton} text-neutral-600 hover:bg-white`}>Retour</button>
            <button type="button" disabled={action.isPending} className={`${bouton} bg-neutral-800 hover:bg-neutral-900 text-white`}
              onClick={() => void executer({ type: 'annuler' }, `Demande annulée : ${nom} reste dans votre école.`)}>
              {action.isPending ? 'Annulation…' : 'Confirmer l’annulation'}
            </button>
          </div>
        </div>
      )}

      {retour && (
        <p role={retour.ok ? 'status' : 'alert'}
          className={`mt-3 px-3 py-2 rounded-xl border text-[11px] font-bold ${retour.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {retour.texte}
        </p>
      )}

      {dossierOuvert && <DossierTransfere id={d.id} />}
    </li>
  );
}

function Rubrique({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{titre}</p>
      {children}
    </div>
  );
}

/** Copie figée du dossier remise à l'acceptation (GET /admin/transferts/{id}/dossier). */
function DossierTransfere({ id }: { id: string }) {
  const q = useDossierTransfere(id);
  if (q.isLoading) {
    return (
      <div id={`dossier-${id}`} aria-busy="true" className="mt-3 p-3 rounded-xl border border-neutral-100 bg-neutral-50 space-y-2">
        {[0, 1, 2].map((i) => <div key={i} className="h-3 rounded bg-neutral-200 animate-pulse" style={{ width: `${80 - i * 20}%` }} />)}
      </div>
    );
  }
  if (q.isError) {
    return (
      <div id={`dossier-${id}`} role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-[11px] text-red-700 font-semibold">
        <span>Dossier indisponible : {resolveErrorMessage(q.error)}</span>
        <button type="button" onClick={() => void q.refetch()} className="px-2 py-1 rounded-lg bg-white border border-red-200 text-[10px] font-black cursor-pointer">Réessayer</button>
      </div>
    );
  }
  const d = q.data ?? {};
  const email = emailAffichable(d.identite?.email);
  const notes = d.notes ?? [];
  const observations = d.observations ?? [];
  const documents = d.documents ?? [];
  return (
    <div id={`dossier-${id}`} className="mt-3 p-3 sm:p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3 text-[11px] text-neutral-700 min-w-0">
      <p className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px] text-primary">folder_shared</span>
        Dossier établi par {d.ecoleOrigine ?? 'l’école d’origine'} le {dateFr(d.etabliLe)}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Rubrique titre="Identité">
          <p className="font-semibold break-words">
            {[d.identite?.prenom, d.identite?.nom].filter(Boolean).join(' ') || '—'} · {d.identite?.matricule || 'sans matricule'}
          </p>
          <p className="font-semibold break-words">{email ?? 'Sans e-mail (connexion par matricule)'}</p>
        </Rubrique>
        <Rubrique titre="Profil">
          {d.profil ? (
            <p className="font-semibold">Groupe sanguin : {d.profil.groupeSanguin || 'non renseigné'} · Allergies : {d.profil.allergies || 'non renseignées'}</p>
          ) : <p className="font-semibold text-neutral-500">Aucun profil enregistré.</p>}
        </Rubrique>
      </div>
      <Rubrique titre={`Notes (${notes.length})`}>
        {notes.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full min-w-[420px] border-collapse text-[11px]">
              <thead><tr className="text-left text-neutral-500 bg-neutral-50">
                <th className="px-2 py-1.5 font-black">Module</th><th className="px-2 py-1.5 font-black">Enseignant</th>
                <th className="px-2 py-1.5 font-black text-right">CC</th><th className="px-2 py-1.5 font-black text-right">Examen</th>
              </tr></thead>
              <tbody>{notes.map((n, i) => (
                <tr key={i} className="border-t border-neutral-100">
                  <td className="px-2 py-1.5 font-semibold">{n.module || '—'}</td><td className="px-2 py-1.5">{n.enseignant || '—'}</td>
                  <td className="px-2 py-1.5 text-right">{n.cc ?? '—'}</td><td className="px-2 py-1.5 text-right">{n.examen ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="font-semibold text-neutral-500">Aucune note enregistrée.</p>}
      </Rubrique>
      <Rubrique titre={`Observations (${observations.length})`}>
        {observations.length > 0 ? (
          <ul className="space-y-1">{observations.map((o, i) => (
            <li key={o.id ?? i} className="break-words"><b>{dateFr(o.date)}{o.type ? ` · ${o.type}` : ''}</b> : {o.text || '—'}{o.auteur ? ` (${o.auteur})` : ''}</li>
          ))}</ul>
        ) : <p className="font-semibold text-neutral-500">Aucune observation.</p>}
      </Rubrique>
      <Rubrique titre={`Documents (${documents.length})`}>
        {documents.length > 0 ? (
          <ul className="space-y-0.5">{documents.map((o, i) => (
            <li key={i} className="break-words">{o.nom || 'Document sans nom'}{o.deposeLe ? ` · déposé le ${dateFr(o.deposeLe)}` : ''}</li>
          ))}</ul>
        ) : <p className="font-semibold text-neutral-500">Aucun document.</p>}
      </Rubrique>
    </div>
  );
}

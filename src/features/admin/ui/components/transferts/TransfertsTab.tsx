import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useRbacStore } from '@/core/store/rbacStore';

/**
 * Transferts d'élèves entre écoles (2026-11-13), comme dans la vraie vie : l'école d'origine fait la demande,
 * l'école d'accueil l'accepte ou la refuse ; à l'acceptation, l'élève change d'école et l'école d'accueil reçoit
 * une copie de son dossier. Toutes les règles sont vérifiées par le serveur (/admin/transferts).
 */
interface EcoleCourte { id: string; nom?: string }
interface Demande {
  id: string;
  eleve: { id: string; nom?: string; matricule?: string };
  ecoleSource: EcoleCourte;
  ecoleDestination: EcoleCourte;
  motif?: string | null;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULEE';
  creeLe?: string | null;
  decideLe?: string | null;
  motifDecision?: string | null;
  dossierDisponible: boolean;
}
interface Eleve { id: string; name?: string; matricule?: string; classe?: string }
interface EcoleTrouvee { id: string; nom: string; ville?: string | null; slug?: string }

const LIBELLES: Record<Demande['statut'], string> = { EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée', ANNULEE: 'Annulée' };
const COULEURS: Record<Demande['statut'], string> = {
  EN_ATTENTE: 'bg-amber-50 text-amber-800 border-amber-200', ACCEPTEE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REFUSEE: 'bg-rose-50 text-rose-800 border-rose-200', ANNULEE: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export function TransfertsTab() {
  const qc = useQueryClient();
  const peutModifier = useRbacStore((s) => s.peut('transferts.ecrire'));
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null);
  const [eleveId, setEleveId] = useState('');
  const [filtreEleve, setFiltreEleve] = useState('');
  const [recherche, setRecherche] = useState('');
  const [ecole, setEcole] = useState<EcoleTrouvee | null>(null);
  const [motif, setMotif] = useState('');
  const [refusEnCours, setRefusEnCours] = useState<string | null>(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [dossierOuvert, setDossierOuvert] = useState<string | null>(null);

  const demandes = useQuery({
    queryKey: ['admin', 'transferts'],
    queryFn: async () => (await apiClient.get('/admin/transferts')).data as { sortants: Demande[]; entrants: Demande[] },
  });
  const eleves = useQuery({
    queryKey: ['admin', 'transferts', 'eleves'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/students');
      return (Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []) as Eleve[];
    },
    enabled: peutModifier,
  });
  const [ecolesTrouvees, setEcolesTrouvees] = useState<EcoleTrouvee[]>([]);
  useEffect(() => {
    const q = recherche.trim();
    if (q.length < 2 || ecole) { setEcolesTrouvees([]); return; }
    const t = setTimeout(() => {
      apiClient.get('/admin/transferts/ecoles', { params: { recherche: q } })
        .then((r) => setEcolesTrouvees(Array.isArray(r.data) ? r.data : []))
        .catch(() => setEcolesTrouvees([]));
    }, 300);
    return () => clearTimeout(t);
  }, [recherche, ecole]);

  const elevesFiltres = useMemo(() => {
    const q = filtreEleve.trim().toLowerCase();
    return (eleves.data ?? []).filter((e) => !q || `${e.name ?? ''} ${e.matricule ?? ''}`.toLowerCase().includes(q)).slice(0, 50);
  }, [eleves.data, filtreEleve]);

  const rafraichir = () => qc.invalidateQueries({ queryKey: ['admin', 'transferts'] });
  const action = useMutation({
    mutationFn: async (f: () => Promise<unknown>) => f(),
    onSuccess: () => rafraichir(),
  });
  const executer = async (f: () => Promise<unknown>, succes: string) => {
    setMessage(null);
    try {
      await action.mutateAsync(f);
      setMessage({ texte: succes, ok: true });
    } catch (e) {
      setMessage({ texte: resolveErrorMessage(e), ok: false });
    }
  };

  const demander = () => {
    if (!eleveId) { setMessage({ texte: "Choisissez l'élève à transférer.", ok: false }); return; }
    if (!ecole) { setMessage({ texte: "Choisissez l'école d'accueil.", ok: false }); return; }
    void executer(() => apiClient.post('/admin/transferts', { eleveId, ecoleDestinationId: ecole.id, motif: motif.trim() || undefined }),
      `Demande envoyée à ${ecole.nom}. L'élève reste inscrit chez vous tant que l'école d'accueil n'a pas accepté.`)
      .then(() => { setEleveId(''); setEcole(null); setRecherche(''); setMotif(''); });
  };

  const ligne = (d: Demande, sens: 'entrant' | 'sortant') => (
    <li key={d.id} className="p-3 rounded-xl border border-neutral-200 bg-white flex flex-col gap-2" data-transfert={d.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[#1E293B] font-extrabold text-xs">{d.eleve.nom || 'Élève'} {d.eleve.matricule ? <span className="text-neutral-500 font-semibold">· {d.eleve.matricule}</span> : null}</p>
          <p className="text-[11px] text-neutral-500 font-semibold">
            {sens === 'entrant' ? <>De <b>{d.ecoleSource.nom ?? '—'}</b></> : <>Vers <b>{d.ecoleDestination.nom ?? '—'}</b></>} · demandé le {date(d.creeLe)}
            {d.decideLe ? <> · traité le {date(d.decideLe)}</> : null}
          </p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${COULEURS[d.statut]}`}>{LIBELLES[d.statut]}</span>
      </div>
      {d.motif && <p className="text-[11px] text-neutral-600"><b>Motif :</b> {d.motif}</p>}
      {d.motifDecision && <p className="text-[11px] text-rose-700"><b>Motif du refus :</b> {d.motifDecision}</p>}
      <div className="flex flex-wrap gap-2">
        {sens === 'entrant' && d.statut === 'EN_ATTENTE' && peutModifier && refusEnCours !== d.id && (
          <>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-black border-0 cursor-pointer"
              onClick={() => executer(() => apiClient.post(`/admin/transferts/${d.id}/accepter`), `${d.eleve.nom ?? "L'élève"} fait désormais partie de votre école ; son dossier vous a été remis.`)}>
              Accepter l'élève
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-white text-rose-700 border border-rose-200 text-[11px] font-black cursor-pointer"
              onClick={() => { setRefusEnCours(d.id); setMotifRefus(''); }}>
              Refuser
            </button>
          </>
        )}
        {refusEnCours === d.id && (
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <input value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} maxLength={1000} placeholder="Motif du refus (transmis à l'école d'origine)"
              className="flex-1 px-3 py-1.5 border border-neutral-200 rounded-lg text-xs" aria-label="Motif du refus" />
            <button type="button" className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-black border-0 cursor-pointer"
              onClick={() => executer(() => apiClient.post(`/admin/transferts/${d.id}/refuser`, { motif: motifRefus }), 'Demande refusée ; le motif a été transmis.')
                .then(() => setRefusEnCours(null))}>
              Confirmer le refus
            </button>
            <button type="button" className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-black border border-neutral-200 cursor-pointer"
              onClick={() => setRefusEnCours(null)}>Annuler</button>
          </div>
        )}
        {sens === 'sortant' && d.statut === 'EN_ATTENTE' && peutModifier && (
          <button type="button" className="px-3 py-1.5 rounded-lg bg-white text-neutral-700 border border-neutral-200 text-[11px] font-black cursor-pointer"
            onClick={() => executer(() => apiClient.post(`/admin/transferts/${d.id}/annuler`), 'Demande annulée.')}>
            Annuler la demande
          </button>
        )}
        {d.dossierDisponible && (
          <button type="button" className="px-3 py-1.5 rounded-lg bg-[#1E293B] text-white text-[11px] font-black border-0 cursor-pointer"
            onClick={() => setDossierOuvert(dossierOuvert === d.id ? null : d.id)}>
            {dossierOuvert === d.id ? 'Masquer le dossier' : 'Voir le dossier transféré'}
          </button>
        )}
      </div>
      {dossierOuvert === d.id && <DossierTransfere id={d.id} />}
    </li>
  );

  return (
    <div className="space-y-5 text-xs" id="transferts-tab">
      <div>
        <h3 className="font-black text-base text-[#1E293B]">Transferts d'élèves</h3>
        <p className="text-[11px] text-neutral-500 font-medium">
          Votre école demande le transfert d'un élève vers une autre école ; celle-ci l'accepte ou le refuse. À l'acceptation, l'élève
          rejoint la nouvelle école et son dossier (notes, profil, observations, documents) lui est remis. Vous gardez vos archives.
        </p>
      </div>

      {message && (
        <p role={message.ok ? 'status' : 'alert'} id="transferts-message"
          className={`p-3 rounded-xl border font-bold ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {message.texte}
        </p>
      )}

      {peutModifier && (
        <section className="p-4 rounded-2xl border border-neutral-200 bg-[#FAF8F6] space-y-3" id="transfert-demande">
          <h4 className="font-black text-[#1E293B]">Demander un transfert</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 font-bold text-neutral-600">
              Élève
              <input value={filtreEleve} onChange={(e) => setFiltreEleve(e.target.value)} placeholder="Filtrer par nom ou matricule"
                className="px-3 py-2 border border-neutral-200 rounded-xl bg-white font-medium" />
              <select id="transfert-eleve" value={eleveId} onChange={(e) => setEleveId(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-xl bg-white font-semibold">
                <option value="">— Choisir l'élève —</option>
                {elevesFiltres.map((e) => <option key={e.id} value={e.id}>{e.name ?? e.id}{e.matricule ? ` · ${e.matricule}` : ''}{e.classe ? ` · ${e.classe}` : ''}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 font-bold text-neutral-600 relative">
              École d'accueil
              {ecole ? (
                <span className="px-3 py-2 border border-emerald-200 rounded-xl bg-emerald-50 text-emerald-900 font-black flex justify-between items-center">
                  {ecole.nom}{ecole.ville ? ` (${ecole.ville})` : ''}
                  <button type="button" className="text-[11px] underline border-0 bg-transparent cursor-pointer" onClick={() => { setEcole(null); setRecherche(''); }}>changer</button>
                </span>
              ) : (
                <input id="transfert-ecole" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Nom de l'école (2 lettres au moins)"
                  className="px-3 py-2 border border-neutral-200 rounded-xl bg-white font-medium" />
              )}
              {!ecole && ecolesTrouvees.length > 0 && (
                <ul className="absolute top-full mt-1 left-0 right-0 z-10 bg-white border border-neutral-200 rounded-xl shadow-md max-h-56 overflow-y-auto">
                  {ecolesTrouvees.map((e) => (
                    <li key={e.id}>
                      <button type="button" className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-0 bg-transparent cursor-pointer font-semibold" onClick={() => setEcole(e)}>
                        {e.nom}{e.ville ? ` · ${e.ville}` : ''}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </label>
          </div>
          <label className="flex flex-col gap-1 font-bold text-neutral-600">
            Motif (facultatif)
            <textarea value={motif} onChange={(e) => setMotif(e.target.value)} maxLength={1000} rows={2}
              placeholder="Ex. : déménagement de la famille" className="px-3 py-2 border border-neutral-200 rounded-xl bg-white font-medium" />
          </label>
          <button type="button" id="transfert-envoyer" onClick={demander} disabled={action.isPending}
            className="px-4 py-2 bg-primary text-white rounded-xl font-black border-0 cursor-pointer disabled:opacity-50">
            {action.isPending ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </section>
      )}

      {demandes.isError && <p role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">Demandes indisponibles : {resolveErrorMessage(demandes.error)}</p>}

      <section className="space-y-2" id="transferts-entrants">
        <h4 className="font-black text-[#1E293B]">Demandes reçues</h4>
        {demandes.data && demandes.data.entrants.length === 0 && <p className="text-neutral-500 font-medium">Aucune demande reçue.</p>}
        <ul className="space-y-2">{demandes.data?.entrants.map((d) => ligne(d, 'entrant'))}</ul>
      </section>

      <section className="space-y-2" id="transferts-sortants">
        <h4 className="font-black text-[#1E293B]">Demandes envoyées</h4>
        {demandes.data && demandes.data.sortants.length === 0 && <p className="text-neutral-500 font-medium">Aucune demande envoyée.</p>}
        <ul className="space-y-2">{demandes.data?.sortants.map((d) => ligne(d, 'sortant'))}</ul>
      </section>
    </div>
  );
}

interface Dossier {
  etabliLe?: string;
  ecoleOrigine?: string;
  identite?: { nom?: string; prenom?: string; email?: string; matricule?: string };
  notes?: { module?: string; enseignant?: string; cc?: number; examen?: number }[];
  profil?: { groupeSanguin?: string | null; allergies?: string | null };
  observations?: { type?: string; text?: string; auteur?: string | null; date?: string }[];
  documents?: { nom?: string; deposeLe?: string | null }[];
}

function DossierTransfere({ id }: { id: string }) {
  const q = useQuery({
    queryKey: ['admin', 'transferts', 'dossier', id],
    queryFn: async () => (await apiClient.get(`/admin/transferts/${id}/dossier`)).data as Dossier,
  });
  if (q.isLoading) return <p className="text-neutral-500">Chargement du dossier…</p>;
  if (q.isError) return <p role="alert" className="text-rose-700 font-bold">Dossier indisponible : {resolveErrorMessage(q.error)}</p>;
  const d = q.data ?? {};
  return (
    <div className="p-3 rounded-xl bg-[#FAF8F6] border border-neutral-200 space-y-2 text-[11px]" id={`dossier-${id}`}>
      <p className="font-black text-[#1E293B]">Dossier établi par {d.ecoleOrigine ?? "l'école d'origine"} le {date(d.etabliLe)}</p>
      <p><b>Élève :</b> {[d.identite?.prenom, d.identite?.nom].filter(Boolean).join(' ') || '—'} · {d.identite?.matricule ?? 'sans matricule'} · {d.identite?.email ?? '—'}</p>
      {d.profil && <p><b>Profil :</b> groupe sanguin {d.profil.groupeSanguin || 'non renseigné'} · allergies {d.profil.allergies || 'non renseignées'}</p>}
      <div>
        <b>Notes ({d.notes?.length ?? 0}) :</b>
        {d.notes && d.notes.length > 0 ? (
          <table className="mt-1 w-full border-collapse">
            <thead><tr className="text-left text-neutral-500"><th>Module</th><th>Enseignant</th><th>CC</th><th>Examen</th></tr></thead>
            <tbody>{d.notes.map((n, i) => <tr key={i}><td>{n.module || '—'}</td><td>{n.enseignant || '—'}</td><td>{n.cc ?? '—'}</td><td>{n.examen ?? '—'}</td></tr>)}</tbody>
          </table>
        ) : <span> aucune note enregistrée.</span>}
      </div>
      <p><b>Observations :</b> {d.observations?.length ? d.observations.map((o) => `${o.date ?? ''} ${o.type ?? ''} : ${o.text ?? ''}`.trim()).join(' · ') : 'aucune.'}</p>
      <p><b>Documents :</b> {d.documents?.length ? d.documents.map((o) => o.nom).join(', ') : 'aucun.'}</p>
    </div>
  );
}

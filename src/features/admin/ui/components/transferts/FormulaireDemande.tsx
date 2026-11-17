import { useMemo, useState, type FormEvent } from 'react';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { useTenantStore } from '@/core/store/tenantStore';
import { ChampRecherche, type OptionRecherche } from './ChampRecherche';
import {
  MOTIF_MAX, STATUT_ELEVE_ACTIF, sansAccents, useDemanderTransfert, useEcolesAccueil, useElevesEcole,
  type EcoleTrouvee, type EleveEcole,
} from './transfertsApi';

const ELEVES_AFFICHES = 50;
// 16/11 : même allure que les champs de recherche (focus : bordure et halo de la couleur de l'école, sans le contour bleu de @tailwindcss/forms)
const champ = 'w-full px-3.5 py-2.5 border rounded-xl bg-white text-[13px] font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-medium shadow-none outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed';

const detailEleve = (e: EleveEcole) => [e.matricule, e.classe].filter(Boolean).join(' · ') || undefined;
const detailEcole = (e: EcoleTrouvee) => e.ville || undefined;

/**
 * Demande de transfert (POST /admin/transferts). L'élève est choisi parmi les élèves ACTIFS de l'école (le serveur
 * refuse les autres) ; l'école d'accueil parmi les écoles proposées par le serveur (actives, hors la vôtre). Rien n'est
 * envoyé tant que les deux ne sont pas choisis dans leur liste.
 */
export function FormulaireDemande({ elevesEnAttente, onVoirEnvoyees }: { elevesEnAttente: Set<string>; onVoirEnvoyees?: () => void }) {
  const ecoleCourante = useTenantStore((s) => s.currentTenant);
  const eleves = useElevesEcole(true);
  const demander = useDemanderTransfert();

  const [requeteEleve, setRequeteEleve] = useState('');
  const [eleveId, setEleveId] = useState('');
  const [requeteEcole, setRequeteEcole] = useState('');
  const [ecole, setEcole] = useState<EcoleTrouvee | null>(null);
  const [motif, setMotif] = useState('');
  const [erreurs, setErreurs] = useState<{ eleve?: string; ecole?: string; motif?: string }>({});
  const [erreurServeur, setErreurServeur] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const tous = useMemo(() => eleves.data ?? [], [eleves.data]);
  const actifs = useMemo(() => tous.filter((e) => e.status === STATUT_ELEVE_ACTIF), [tous]);
  const eleve = actifs.find((e) => e.id === eleveId) ?? null;
  const tousEnAttente = actifs.length > 0 && actifs.every((e) => elevesEnAttente.has(e.id));

  const correspondances = useMemo(() => {
    const q = sansAccents(requeteEleve.trim());
    return actifs.filter((e) => !q || sansAccents(`${e.name ?? ''} ${e.matricule ?? ''} ${e.classe ?? ''}`).includes(q));
  }, [actifs, requeteEleve]);
  const optionsEleves: OptionRecherche[] = correspondances.slice(0, ELEVES_AFFICHES).map((e) => ({
    id: e.id, titre: e.name || e.matricule || 'Élève sans nom', detail: detailEleve(e),
    indisponible: elevesEnAttente.has(e.id) ? 'Demande en attente' : undefined,
  }));

  const ecoles = useEcolesAccueil(requeteEcole, !ecole);
  const saisieEcole = requeteEcole.trim();
  const optionsEcoles: OptionRecherche[] = saisieEcole.length >= 2 && ecoles.requete === saisieEcole
    ? (ecoles.resultat.data ?? [])
      .filter((e) => e.id !== ecoleCourante?.id && (!e.slug || e.slug !== ecoleCourante?.slug))
      .map((e) => ({ id: e.id, titre: e.nom, detail: detailEcole(e) }))
    : [];
  const estLaNotre = !!ecoleCourante?.name && saisieEcole.length >= 2 && sansAccents(ecoleCourante.name).includes(sansAccents(saisieEcole));
  const etatEcoles = saisieEcole.length < 2
    ? "Tapez au moins 2 lettres du nom de l'école d'accueil."
    : ecoles.requete !== saisieEcole || ecoles.resultat.isFetching
      ? 'Recherche des écoles…'
      : ecoles.resultat.isError
        ? `Recherche indisponible : ${resolveErrorMessage(ecoles.resultat.error)}`
        : `Aucune autre école active ne correspond à « ${saisieEcole} ».${estLaNotre ? ' Votre propre école n’est pas proposée : un transfert se fait vers une autre école.' : ''}`;

  // Formulaire inutilisable : on le dit au lieu de laisser croire qu'on peut agir
  const blocage = eleves.isLoading
    ? 'Chargement des élèves de l’école…'
    : eleves.isError
      ? 'Envoi impossible : la liste des élèves n’a pas pu être chargée.'
      : tous.length === 0
        ? 'Envoi impossible : l’école n’a encore aucun élève.'
        : actifs.length === 0
          ? 'Envoi impossible : aucun élève actif à transférer.'
          : tousEnAttente
            ? 'Envoi impossible : chaque élève actif a déjà une demande en attente.'
            : '';

  const effacerRetours = () => { setErreurServeur(''); setConfirmation(''); };

  const envoyer = async (ev: FormEvent) => {
    ev.preventDefault();
    if (blocage || demander.isPending) return;
    effacerRetours();
    const err: typeof erreurs = {};
    if (!eleve) {
      err.eleve = requeteEleve.trim()
        ? `« ${requeteEleve.trim()} » n’est pas encore choisi : sélectionnez l’élève dans la liste.`
        : 'Choisissez l’élève à transférer.';
    } else if (elevesEnAttente.has(eleve.id)) {
      err.eleve = 'Une demande est déjà en attente pour cet élève : annulez-la avant d’en faire une autre.';
    }
    if (!ecole) {
      err.ecole = saisieEcole
        ? `« ${saisieEcole} » n’a pas été reconnue : choisissez l’école d’accueil dans la liste proposée.`
        : 'Choisissez l’école d’accueil.';
    } else if (ecole.id === ecoleCourante?.id || (!!ecole.slug && ecole.slug === ecoleCourante?.slug)) {
      err.ecole = 'L’école d’accueil doit être différente de la vôtre.';
    }
    if (motif.trim().length > MOTIF_MAX) err.motif = `Le motif ne doit pas dépasser ${MOTIF_MAX} caractères.`;
    setErreurs(err);
    if (err.eleve || err.ecole || err.motif) {
      document.getElementById(err.eleve ? 'transfert-eleve' : err.ecole ? 'transfert-ecole' : 'transfert-motif')?.focus();
      return;
    }
    if (!eleve || !ecole) return;
    try {
      await demander.mutateAsync({ eleveId: eleve.id, ecoleDestinationId: ecole.id, motif: motif.trim() || undefined });
      setConfirmation(`Demande envoyée à ${ecole.nom} pour ${eleve.name || 'l’élève'}. L’élève reste inscrit chez vous tant que l’école d’accueil n’a pas accepté ; sa réponse apparaîtra dans « Demandes envoyées ».`);
      setEleveId(''); setRequeteEleve(''); setEcole(null); setRequeteEcole(''); setMotif(''); setErreurs({});
    } catch (e) {
      setErreurServeur(resolveErrorMessage(e));   // rien n'a été enregistré
    }
  };

  const champEleve = eleves.isLoading ? (
    <div className="space-y-1" aria-busy="true">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Élève à transférer</p>
      <div className="h-[38px] rounded-xl bg-neutral-100 animate-pulse" />
    </div>
  ) : eleves.isError ? (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Élève à transférer</p>
      <div role="alert" className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-[11px] text-red-700 font-semibold">
        <span>Élèves indisponibles : {resolveErrorMessage(eleves.error)}</span>
        <button type="button" onClick={() => void eleves.refetch()} className="px-2 py-1 rounded-lg bg-white border border-red-200 text-[10px] font-black text-red-700 cursor-pointer">Réessayer</button>
      </div>
    </div>
  ) : tous.length === 0 || actifs.length === 0 ? (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Élève à transférer</p>
      <div id="transfert-aucun-eleve" role="status" className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
        <span translate="no" className="material-symbols-outlined text-[18px] text-amber-600 shrink-0">group_off</span>
        <p className="text-[11px] font-semibold leading-snug">
          {tous.length === 0
            ? <><b>Aucun élève dans l’école :</b> inscrivez d’abord des élèves (Gestion Élèves ou Admissions).</>
            : <><b>Aucun élève actif :</b> seuls les élèves actifs peuvent être transférés ; les élèves suspendus ou déjà transférés ne sont pas proposés.</>}
        </p>
      </div>
    </div>
  ) : (
    <ChampRecherche
      id="transfert-eleve"
      libelle="Élève à transférer"
      icone="person_search"
      requete={requeteEleve}
      onRequete={(v) => { setRequeteEleve(v); setEleveId(''); setErreurs((x) => ({ ...x, eleve: undefined })); }}
      options={optionsEleves}
      choisi={eleve ? { titre: eleve.name || eleve.matricule || 'Élève sans nom', detail: detailEleve(eleve) } : null}
      onChoisir={(id) => { setEleveId(id); setRequeteEleve(''); setErreurs((x) => ({ ...x, eleve: undefined })); effacerRetours(); }}
      onEffacer={() => { setEleveId(''); setTimeout(() => document.getElementById('transfert-eleve')?.focus(), 0); }}
      placeholder="Nom, matricule ou classe"
      etatListe={requeteEleve.trim() ? `Aucun élève actif ne correspond à « ${requeteEleve.trim()} ».` : undefined}
      piedListe={correspondances.length > ELEVES_AFFICHES ? `${correspondances.length - ELEVES_AFFICHES} autres élèves : précisez la recherche.` : `${actifs.length} élève${actifs.length > 1 ? 's' : ''} actif${actifs.length > 1 ? 's' : ''} dans l’école.`}
      erreur={erreurs.eleve}
      desactive={demander.isPending}
    />
  );

  return (
    <form id="transfert-demande" onSubmit={envoyer} noValidate aria-labelledby="transfert-demande-titre"
      className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
      <div className="px-4 sm:px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
        <span translate="no" className="material-symbols-outlined text-primary text-[20px]">outbox</span>
        <div className="min-w-0">
          <h3 id="transfert-demande-titre" className="text-sm font-black text-neutral-900">Demander un transfert</h3>
          <p className="text-[11px] text-neutral-500 font-semibold">L’élève reste inscrit chez vous jusqu’à la réponse de l’école d’accueil.</p>
        </div>
      </div>

      <fieldset disabled={!!blocage && !eleves.isLoading} className="p-4 sm:p-5 space-y-4 min-w-0 border-0 m-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {champEleve}
          <ChampRecherche
            id="transfert-ecole"
            libelle="École d’accueil"
            icone="domain"
            requete={requeteEcole}
            onRequete={(v) => { setRequeteEcole(v); setErreurs((x) => ({ ...x, ecole: undefined })); }}
            options={optionsEcoles}
            choisi={ecole ? { titre: ecole.nom, detail: detailEcole(ecole) } : null}
            onChoisir={(id) => {
              const e = (ecoles.resultat.data ?? []).find((x) => x.id === id);
              if (e) { setEcole(e); setRequeteEcole(''); setErreurs((x) => ({ ...x, ecole: undefined })); effacerRetours(); }
            }}
            onEffacer={() => { setEcole(null); setTimeout(() => document.getElementById('transfert-ecole')?.focus(), 0); }}
            placeholder="Nom de l’école (2 lettres au moins)"
            etatListe={etatEcoles}
            erreur={erreurs.ecole}
            aide={ecole ? undefined : 'Seules les écoles actives de la plateforme sont proposées, jamais la vôtre.'}
            desactive={!!blocage || demander.isPending}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="transfert-motif" className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">Motif (facultatif)</label>
            <span className={`text-[10px] font-semibold ${motif.length > MOTIF_MAX ? 'text-red-600' : 'text-neutral-400'}`}>{motif.length} / {MOTIF_MAX}</span>
          </div>
          <textarea id="transfert-motif" value={motif} rows={2} maxLength={MOTIF_MAX}
            onChange={(e) => { setMotif(e.target.value); setErreurs((x) => ({ ...x, motif: undefined })); }}
            aria-invalid={erreurs.motif ? true : undefined} aria-describedby={erreurs.motif ? 'transfert-motif-erreur' : undefined}
            placeholder="Ex. : déménagement de la famille à Thiès"
            className={`${champ} resize-none ${erreurs.motif ? 'border-red-400' : 'border-neutral-200'}`} />
          {erreurs.motif
            ? <p id="transfert-motif-erreur" className="text-[10px] text-red-600 font-semibold">{erreurs.motif}</p>
            : <p className="text-[10px] text-neutral-500 font-semibold">Transmis à l’école d’accueil avec la demande.</p>}
        </div>

        {erreurServeur && (
          <div id="transfert-erreur" role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700">
            <span translate="no" className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <p className="text-[11px] font-bold">Demande non envoyée : {erreurServeur}</p>
          </div>
        )}
        {confirmation && (
          <div id="transfert-confirmation" role="status" className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
            <span translate="no" className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-[11px] font-bold">{confirmation}</p>
              {onVoirEnvoyees && (
                <button type="button" onClick={onVoirEnvoyees} className="text-[11px] font-black text-emerald-800 underline cursor-pointer">
                  Voir mes demandes envoyées
                </button>
              )}
            </div>
            <button type="button" onClick={() => setConfirmation('')} aria-label="Fermer le message"
              className="shrink-0 text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <span translate="no" className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
          {blocage && <p id="transfert-envoyer-aide" className="text-[11px] font-semibold text-neutral-500 sm:mr-auto">{blocage}</p>}
          <button type="submit" id="transfert-envoyer" disabled={!!blocage || demander.isPending}
            aria-describedby={blocage ? 'transfert-envoyer-aide' : undefined}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary">
            <span translate="no" className="material-symbols-outlined text-[16px]">send</span>
            {demander.isPending ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

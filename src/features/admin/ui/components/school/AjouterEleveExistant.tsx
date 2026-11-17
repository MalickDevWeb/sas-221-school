import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { useRbacStore } from '@/core/store/rbacStore';
import { demanderConfirmation } from '@/shared/lib/confirmation';
import { marquerErreurAffichee, resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { listeBrute, objetBrut, texteOuNull } from '@/shared/lib/lectureServeur';
import { avecNombre } from '@/shared/lib/pluriel';
import type { Classe } from '../../../domain/SchoolModels';
import { mapStudentFromApi, type Student } from '../../../domain/StudentModels';

/**
 * « Ajouter un élève existant » depuis la fiche d'une classe.
 *
 * Routes (aucune ajoutée) : GET /admin/students (élèves de l'école, avec classeId et classe) ;
 * PUT /admin/students/{id}/classe { classeId } (404 si l'élève n'est pas de l'école, 400 si la classe est inconnue).
 * Après l'envoi, la liste de l'école est relue : la fiche affiche les élèves que le SERVEUR range dans la classe,
 * jamais la seule sélection (aucun faux succès).
 */

/** Résultats affichés à la fois : GET /admin/students n'est pas paginé par le serveur, la liste est filtrée à l'écran. */
const AFFICHES = 50;
/** Lecture fraîche à chaque ouverture (rien n'est gardé en cache entre deux ouvertures). */
const CLE_ELEVES = ['admin', 'classes', 'affectation', 'eleves-ecole'] as const;
/** Autres écrans qui lisent GET /admin/students et affichent la classe (transferts, dossiers de frais) : relus. */
const AUTRES_LISTES = [['admin', 'transferts', 'eleves'], ['admin', 'finances', 'eleves-ecole']] as const;

const sansAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const statutHttp = (e: unknown): number | null => {
  const s = objetBrut(objetBrut(e).response).status;
  return typeof s === 'number' ? s : null;
};
/** Seules les pannes passagères (réseau, 5xx) sont relancées ; un refus (403, 404…) s'affiche tout de suite. */
const relancer = (echecs: number, e: unknown) => {
  const s = statutHttp(e);
  return echecs < 2 && (s === null || s >= 500);
};

/** Même droit que l'inscription manuelle de la fiche (POST /admin/students : « eleves.ecrire ») ; la liste des
 *  élèves de l'école (GET /admin/students) demande en plus « eleves.lire ». Droits pas encore connus : bouton caché. */
function useAutorise(): boolean {
  const mesDroits = useRbacStore((s) => s.mesDroits);
  const charger = useRbacStore((s) => s.chargerMesDroits);
  useEffect(() => {
    if (!mesDroits) void charger();
  }, [mesDroits, charger]);
  return !!mesDroits && (mesDroits.administration
    || (mesDroits.permissions.includes('eleves.lire') && mesDroits.permissions.includes('eleves.ecrire')));
}

type Rang = 0 | 1 | 2;   // 0 : sans classe ; 1 : dans une autre classe ; 2 : déjà dans cette classe
interface Ligne { eleve: Student; rang: Rang; cle: string }
interface Echec { id: string; nom: string; message: string }

const GROUPES: { rang: Rang; titre: string }[] = [
  { rang: 0, titre: 'Sans classe' },
  { rang: 1, titre: 'Dans une autre classe' },
  { rang: 2, titre: 'Déjà dans cette classe' },
];

function messageChangement(eleves: Student[], nouvelle: string): string {
  if (eleves.length === 1) {
    const ancienne = eleves[0].classe || 'une autre classe';
    return `${eleves[0].name} est déjà dans la classe ${ancienne}. Changer de classe : ${ancienne} → ${nouvelle} ?`;
  }
  const premiers = eleves.slice(0, 3).map((e) => `${e.name} (${e.classe || 'autre classe'} → ${nouvelle})`).join(', ');
  const autres = eleves.length > 3 ? ` et ${avecNombre(eleves.length - 3, 'autre élève', 'autres élèves')}` : '';
  return `${avecNombre(eleves.length, 'élève')} sont déjà dans une autre classe. Changer de classe : ${premiers}${autres} ?`;
}

/** Genre de l'élève inconnu du serveur : « est maintenant dans » plutôt que « ajouté(e) » (charte, § 2). */
const messageSucces = (eleves: Student[], classe: string) => (eleves.length === 1
  ? `${eleves[0].name} est maintenant dans la classe ${classe}.`
  : `${avecNombre(eleves.length, 'élève')} ajoutés à la classe ${classe}.`);

const bouton = 'px-3.5 py-2 bg-white hover:bg-primary/5 text-primary border border-primary/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer';

/** Bouton de la fiche de classe + fenêtre d'affectation. N'apparaît qu'aux comptes autorisés. */
export function AjouterEleveExistant({ classe, onRelu }: {
  classe: Classe;
  /** Élèves que le serveur range dans la classe, relus après une affectation. */
  onRelu: (elevesDeLaClasse: Student[]) => void;
}) {
  const autorise = useAutorise();
  const [ouvert, setOuvert] = useState(false);
  const refBouton = useRef<HTMLButtonElement>(null);
  if (!autorise) return null;
  return (
    <>
      <button ref={refBouton} id="classe-ajouter-eleve-existant" type="button" onClick={() => setOuvert(true)} className={bouton}
        aria-haspopup="dialog">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">group_add</span>
        <span>Ajouter un élève existant</span>
      </button>
      {ouvert && (
        <FenetreAffectation
          classe={classe}
          onRelu={onRelu}
          onClose={() => {
            setOuvert(false);
            refBouton.current?.focus();
          }}
        />
      )}
    </>
  );
}

function FenetreAffectation({ classe, onRelu, onClose }: {
  classe: Classe;
  onRelu: (elevesDeLaClasse: Student[]) => void;
  onClose: () => void;
}) {
  const client = useQueryClient();
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set());
  const [echecs, setEchecs] = useState<Echec[]>([]);
  /** Confirmation ou envoi en cours : la fenêtre ne se ferme pas, un second clic ne renvoie rien. */
  const occupe = useRef(false);
  const refRecherche = useRef<HTMLInputElement>(null);

  const eleves = useQuery({
    queryKey: CLE_ELEVES,
    queryFn: async (): Promise<Student[]> => {
      try {
        const { data } = await apiClient.get<unknown>('/admin/students');
        return listeBrute(data).filter((e) => texteOuNull(e.id)).map((e) => mapStudentFromApi(e));
      } catch (err) {
        marquerErreurAffichee(err);   // l'erreur est affichée dans la fenêtre : pas de second message général
        throw err;
      }
    },
    staleTime: 0,
    gcTime: 0,
    retry: relancer,
  });

  // Rang et texte de recherche calculés une fois par lecture (et non à chaque frappe)
  const lignes = useMemo<Ligne[]>(() => (eleves.data ?? []).map((e) => {
    const ici = e.classeId ? e.classeId === classe.id : !!e.classe && e.classe.toLowerCase() === classe.name.toLowerCase();
    const rang: Rang = ici ? 2 : e.classeId || e.classe ? 1 : 0;
    return { eleve: e, rang, cle: sansAccents(`${e.name} ${e.matricule}`) };
  }).sort((a, b) => a.rang - b.rang || a.eleve.name.localeCompare(b.eleve.name, 'fr', { sensitivity: 'base' })),
  [eleves.data, classe.id, classe.name]);

  useEffect(() => {
    refRecherche.current?.focus();
  }, []);

  useEffect(() => {
    const echap = (e: KeyboardEvent) => {
      // defaultPrevented : Échap déjà traité par la fenêtre de confirmation, posée au-dessus
      if (e.key !== 'Escape' || e.defaultPrevented || occupe.current) return;
      onClose();
    };
    document.addEventListener('keydown', echap);
    return () => document.removeEventListener('keydown', echap);
  }, [onClose]);

  const affecter = useMutation({
    mutationFn: async (cibles: Student[]) => {
      const reussis: Student[] = [];
      const rates: Echec[] = [];
      for (const e of cibles) {   // une requête à la fois : le serveur n'a pas de route groupée
        try {
          await apiClient.put<unknown>(`/admin/students/${encodeURIComponent(e.id)}/classe`, { classeId: classe.id });
          reussis.push(e);
        } catch (err) {
          rates.push({ id: e.id, nom: e.name, message: resolveErrorMessage(err) });
        }
      }
      const relue = await eleves.refetch();
      return { reussis, rates, relue: relue.isError ? null : (relue.data ?? null) };
    },
  });

  const saisie = recherche.trim();
  const mots = sansAccents(saisie).split(/\s+/).filter(Boolean);
  const resultats = mots.length ? lignes.filter((l) => mots.every((m) => l.cle.includes(m))) : lignes;
  const affiches = resultats.slice(0, AFFICHES);
  const parId = new Map(lignes.map((l) => [l.eleve.id, l]));
  const choisis = [...selection].map((id) => parId.get(id)).filter((l): l is Ligne => !!l && l.rang !== 2).map((l) => l.eleve);

  /** Capacité absente ou nulle : non renseignée (même règle que la fiche de la classe). */
  const capacite = classe.capacityMax != null && classe.capacityMax > 0 ? classe.capacityMax : null;
  const effectif = lignes.filter((l) => l.rang === 2).length;
  const apres = effectif + choisis.length;
  const envoi = affecter.isPending;

  const basculer = (id: string) => {
    setEchecs([]);
    setSelection((avant) => {
      const s = new Set(avant);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  };

  const fermer = () => {
    if (!occupe.current) onClose();
  };

  const valider = async () => {
    if (occupe.current || choisis.length === 0) return;
    occupe.current = true;
    try {
      setEchecs([]);
      const changements = choisis.filter((e) => !!(e.classeId || e.classe));
      if (changements.length > 0 && !(await demanderConfirmation(messageChangement(changements, classe.name), {
        titre: 'Changer de classe',
        confirmer: 'Changer de classe',
        danger: false,
      }))) return;

      const { reussis, rates, relue } = await affecter.mutateAsync(choisis);
      // Relecture impossible : seules les affectations confirmées par le serveur (réponse 200) sont reportées
      const liste = relue ?? lignes.map((l) => (reussis.some((r) => r.id === l.eleve.id)
        ? { ...l.eleve, classeId: classe.id, classe: classe.name } : l.eleve));
      const deLaClasse = liste.filter((e) => e.classeId === classe.id);
      const constates = reussis.filter((r) => deLaClasse.some((e) => e.id === r.id));
      const nonConstates: Echec[] = reussis.filter((r) => !constates.includes(r)).map((r) => ({
        id: r.id, nom: r.name, message: "l'élève n'apparaît pas dans cette classe à la relecture. Vérifiez sa classe dans la liste, puis réessayez.",
      }));

      if (reussis.length > 0) {
        onRelu(deLaClasse);
        AUTRES_LISTES.forEach((cle) => void client.invalidateQueries({ queryKey: cle }));
      }
      if (constates.length > 0) {
        toast.success(messageSucces(constates, classe.name));
        if (capacite != null && deLaClasse.length > capacite) {
          toast.warning(`Capacité dépassée : la classe ${classe.name} compte maintenant ${avecNombre(deLaClasse.length, 'élève')} pour ${avecNombre(capacite, 'place')}.`);
        }
      }
      const restants = [...rates, ...nonConstates];
      if (restants.length === 0) {
        onClose();
        return;
      }
      setEchecs(restants);
      setSelection(new Set(restants.map((r) => r.id)));
    } finally {
      occupe.current = false;
    }
  };

  const libelleClasse = (l: Ligne) => (l.rang === 0 ? 'Sans classe' : l.rang === 2 ? 'Déjà dans cette classe' : l.eleve.classe || 'Autre classe');
  const tousEnClasse = lignes.length > 0 && lignes.every((l) => l.rang !== 0);
  const tousIci = lignes.length > 0 && lignes.every((l) => l.rang === 2);
  const resume = eleves.data
    ? `${avecNombre(effectif, 'élève')}${capacite != null ? ` pour ${avecNombre(capacite, 'place')}` : ' · capacité non renseignée'}`
    : capacite != null ? `Capacité : ${avecNombre(capacite, 'place')}` : 'Capacité non renseignée';

  const avertissementCapacite = capacite == null || !eleves.data ? null
    : choisis.length > 0 && apres > capacite
      ? `Capacité dépassée : avec cette sélection, la classe ${classe.name} comptera ${avecNombre(apres, 'élève')} pour ${avecNombre(capacite, 'place')}. L'affectation reste possible.`
      : choisis.length === 0 && effectif > capacite
        ? `La classe ${classe.name} dépasse déjà sa capacité : ${avecNombre(effectif, 'élève')} pour ${avecNombre(capacite, 'place')}.`
        : choisis.length === 0 && effectif === capacite
          ? `La classe ${classe.name} est complète : ${avecNombre(effectif, 'élève')} pour ${avecNombre(capacite, 'place')}.`
          : null;

  let contenu: ReactNode;
  if (eleves.isPending) {
    contenu = (
      <div id="affecter-eleves-chargement" className="space-y-2" aria-busy="true">
        <p className="text-[11px] font-semibold text-neutral-500 m-0">Chargement des élèves de l'école…</p>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-neutral-100 animate-pulse">
            <div className="h-4 w-4 rounded bg-neutral-200 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-1/2 rounded bg-neutral-200" />
              <div className="h-2.5 w-1/3 rounded bg-neutral-100" />
            </div>
            <div className="h-4 w-20 rounded-md bg-neutral-100 shrink-0" />
          </div>
        ))}
      </div>
    );
  } else if (eleves.isError) {
    contenu = (
      <div id="affecter-eleves-erreur-liste" role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-3">
        <p className="m-0">La liste des élèves de l'école n'a pas pu être chargée : {resolveErrorMessage(eleves.error)}</p>
        <button type="button" onClick={() => void eleves.refetch()} disabled={eleves.isFetching}
          className="px-4 py-2 rounded-xl bg-primary text-text-on-primary text-xs font-black border-0 cursor-pointer disabled:opacity-60">
          {eleves.isFetching ? 'Chargement…' : 'Réessayer'}
        </button>
      </div>
    );
  } else if (lignes.length === 0) {
    contenu = (
      <div id="affecter-eleves-ecole-vide" className="p-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center space-y-2">
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-3xl text-neutral-300">group_off</span>
        <p className="text-xs font-bold text-neutral-600 m-0">
          Aucun élève dans l'école pour l'instant. Fermez cette fenêtre et utilisez « Inscrire un élève » pour créer le premier.
        </p>
      </div>
    );
  } else if (resultats.length === 0) {
    contenu = (
      <div id="affecter-eleves-vide" role="status" className="p-6 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center space-y-3">
        <p className="text-xs font-bold text-neutral-600 m-0">Aucun élève ne correspond à « {saisie} ».</p>
        <button type="button" onClick={() => { setRecherche(''); refRecherche.current?.focus(); }}
          className="px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-xs font-black rounded-xl hover:bg-neutral-50 cursor-pointer">
          Effacer la recherche
        </button>
      </div>
    );
  } else {
    contenu = (
      <div className="space-y-4">
        {!saisie && (tousIci || tousEnClasse) && (
          <p id="affecter-eleves-tous-en-classe" role="status"
            className="flex items-start gap-2 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-semibold m-0">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base text-sky-600 shrink-0">info</span>
            <span>
              {tousIci
                ? "Tous les élèves de l'école sont déjà dans cette classe."
                : "Tous les élèves de l'école ont déjà une classe. Pour changer un élève de classe, sélectionnez-le ci-dessous."}
            </span>
          </p>
        )}
        {GROUPES.map((g) => {
          const membres = affiches.filter((l) => l.rang === g.rang);
          if (membres.length === 0) return null;
          const total = resultats.filter((l) => l.rang === g.rang).length;
          return (
            <fieldset key={g.rang} data-groupe={g.rang === 0 ? 'sans-classe' : g.rang === 1 ? 'autre-classe' : 'cette-classe'}
              className="border-0 p-0 m-0 min-w-0 space-y-1.5">
              <legend className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-1.5">{g.titre} ({total})</legend>
              <ul className="space-y-1.5 list-none p-0 m-0">
                {membres.map((l) => {
                  const e = l.eleve;
                  const ici = l.rang === 2;
                  const coche = !ici && selection.has(e.id);
                  return (
                    <li key={e.id}>
                      <label data-eleve-id={e.id} data-classe-actuelle={l.rang === 0 ? '' : e.classe}
                        className={`flex items-start sm:items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                          coche ? 'border-primary/50 bg-primary/5' : 'border-neutral-200 bg-white'} ${
                          ici ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary/40'}`}>
                        <input type="checkbox" checked={coche} disabled={ici || envoi} onChange={() => basculer(e.id)}
                          className="mt-0.5 sm:mt-0 w-4 h-4 accent-primary shrink-0 cursor-pointer disabled:cursor-not-allowed" />
                        {/* Téléphone : la classe passe sous le nom (le matricule reste lisible en entier) */}
                        <span className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                          <span className="min-w-0">
                            <span className="block text-xs font-extrabold text-[#1E293B] sm:truncate">{e.name}</span>
                            <span className="block text-[11px] font-semibold text-neutral-500 break-words">
                              Matricule : {e.matricule ? <span className="font-mono">{e.matricule}</span> : 'non renseigné'}
                              {e.status === 'Suspendu' ? ' · suspendu' : ''}
                            </span>
                          </span>
                          <span className={`self-start sm:self-auto shrink-0 max-w-full sm:max-w-[45%] truncate px-2 py-0.5 rounded-md text-[10px] font-black ${
                            l.rang === 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : l.rang === 1 ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                            {libelleClasse(l)}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          );
        })}
        {resultats.length > AFFICHES && (
          <p id="affecter-eleves-plus" className="text-[11px] font-semibold text-neutral-500 m-0">
            {AFFICHES} premiers élèves affichés sur {resultats.length.toLocaleString('fr-FR')} : précisez la recherche (nom ou matricule).
          </p>
        )}
      </div>
    );
  }

  const nomsChoisis = choisis.slice(0, 3).map((e) => e.name).join(', ')
    + (choisis.length > 3 ? ` et ${avecNombre(choisis.length - 3, 'autre', 'autres')}` : '');

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/50 backdrop-blur-xs"
      onMouseDown={(e) => { if (e.target === e.currentTarget && choisis.length === 0) fermer(); }}>
      <div id="affecter-eleves" role="dialog" aria-modal="true" aria-labelledby="affecter-eleves-titre" aria-describedby="affecter-eleves-resume"
        className="w-full max-w-xl max-h-[calc(100dvh-1.5rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-neutral-100">
          <div className="min-w-0">
            <h3 id="affecter-eleves-titre" className="font-extrabold text-[#1E293B] text-sm flex items-center gap-2 m-0">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-primary text-lg">group_add</span>
              Ajouter un élève existant
            </h3>
            <p id="affecter-eleves-resume" className="text-[11px] font-semibold text-neutral-500 mt-0.5 mb-0">
              Classe {classe.name} · {resume}
            </p>
          </div>
          <button type="button" onClick={fermer} disabled={envoi} aria-label="Fermer"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 border-0 bg-transparent cursor-pointer disabled:opacity-50">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="shrink-0 px-5 pt-4 pb-2 space-y-1">
          <label htmlFor="affecter-eleves-recherche" className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">
            Rechercher un élève de l'école
          </label>
          <div className="relative">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-400 text-sm">search</span>
            <input ref={refRecherche} id="affecter-eleves-recherche" type="search" value={recherche} autoComplete="off"
              onChange={(e) => setRecherche(e.target.value)} placeholder="Nom ou matricule" disabled={envoi}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary disabled:opacity-60" />
          </div>
          <p className="text-[11px] font-semibold text-neutral-500 m-0">Les élèves sans classe sont proposés en premier.</p>
        </div>

        <div id="affecter-eleves-liste" className="flex-1 min-h-0 overflow-y-auto px-5 py-3">
          {contenu}
        </div>

        <div className="shrink-0 border-t border-neutral-100 px-5 py-4 space-y-3">
          {avertissementCapacite && (
            <p id="affecter-eleves-capacite" role="status"
              className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold m-0">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base text-amber-600 shrink-0">warning</span>
              <span>{avertissementCapacite}</span>
            </p>
          )}
          {echecs.length > 0 && (
            <div id="affecter-eleves-erreur" role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold space-y-1 max-h-32 overflow-y-auto">
              {echecs.length === 1 || echecs.every((x) => x.message === echecs[0].message) ? (
                <p className="m-0">
                  Affectation non enregistrée pour {echecs.map((x) => x.nom).join(', ')} : {echecs[0].message}
                </p>
              ) : (
                <>
                  <p className="m-0">Affectation non enregistrée pour {avecNombre(echecs.length, 'élève')} :</p>
                  <ul className="m-0 pl-4 list-disc">
                    {echecs.map((x) => <li key={x.id}>{x.nom} : {x.message}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
          {choisis.length > 0 && (
            <p id="affecter-eleves-selection" className="text-[11px] font-semibold text-neutral-600 m-0">
              {avecNombre(choisis.length, 'élève sélectionné', 'élèves sélectionnés')} : {nomsChoisis}.{' '}
              <button type="button" onClick={() => { setSelection(new Set()); setEchecs([]); }} disabled={envoi}
                className="p-0 border-0 bg-transparent text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-60">
                Tout désélectionner
              </button>
            </p>
          )}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button id="affecter-eleves-annuler" type="button" onClick={fermer} disabled={envoi}
              className="px-4 py-2 text-xs font-bold text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl cursor-pointer disabled:opacity-60">
              Annuler
            </button>
            <button id="affecter-eleves-valider" type="button" onClick={() => void valider()} disabled={choisis.length === 0 || envoi}
              aria-busy={envoi}
              className="px-5 py-2 bg-primary text-text-on-primary text-xs font-black rounded-xl shadow border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
              {envoi
                ? 'Affectation…'
                : choisis.length > 0
                  ? `Affecter ${avecNombre(choisis.length, 'élève')} à ${classe.name}`
                  : `Affecter à ${classe.name}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

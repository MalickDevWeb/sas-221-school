import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';
import { objetBrut, texteOuNull } from '@/shared/lib/lectureServeur';
import { useRbacStore } from '@/core/store/rbacStore';
import type { Classe } from '../../../domain/SchoolModels';
import { ClasseRapideModal } from '../school/ClasseRapideModal';
import { EnvoiLienWhatsApp, type DestinataireLien } from '../liensAcces/EnvoiLienWhatsApp';
import { imprimerFicheIdentifiantsEleve, type FicheIdentifiantsEleve } from '../ficheIdentifiantsEleve';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Appelé après la création réelle du compte (pour relire l'annuaire). */
  onCreated: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RELATIONS = [
  { code: 'PERE', libelle: 'Père' }, { code: 'MERE', libelle: 'Mère' },
  { code: 'TUTEUR', libelle: 'Tuteur / tutrice' }, { code: 'AUTRE', libelle: 'Autre' },
] as const;

/** Même règle que le serveur (NumeroTelephone.e164) : mobile sénégalais (7x) ou numéro international avec indicatif. */
function mobileValide(saisi: string): boolean {
  let s = saisi.trim().replace(/[\s.\-()/]/g, '');
  if (!s || s.length > 20) return false;
  if (s.startsWith('00')) s = `+${s.slice(2)}`;
  else if (!s.startsWith('+')) {
    if (/^7[05678]\d{7}$/.test(s)) s = `+221${s}`;
    else if (/^221\d{9}$/.test(s)) s = `+${s}`;
    else return false;
  }
  return s.startsWith('+221') ? /^\+2217[05678]\d{7}$/.test(s) : /^\+[1-9]\d{7,14}$/.test(s);
}

const schema = z.object({
  prenom: z.string().trim().min(1, 'Le prénom est obligatoire.').max(80, '80 caractères au maximum.'),
  nom: z.string().trim().min(1, 'Le nom est obligatoire.').max(80, '80 caractères au maximum.'),
  classeId: z.string(),
  sansEmail: z.boolean(),
  email: z.string().trim(),
  telephone: z.string().trim().max(30, '30 caractères au maximum.'),
  matricule: z.string().trim().max(40, '40 caractères au maximum.'),
  lierParent: z.boolean(),
  parentEmail: z.string().trim(),
  parentNom: z.string().trim(),
  parentRelation: z.string(),
  parentTelephone: z.string().trim(),
}).superRefine((v, ctx) => {
  if (!v.sansEmail && !EMAIL.test(v.email)) {
    ctx.addIssue({ code: 'custom', path: ['email'], message: "Saisissez l'adresse e-mail de l'élève, ou cochez « Sans e-mail »." });
  }
  // Champs du parent contrôlés seulement quand ils sont affichés (sinon l'erreur serait invisible)
  if (v.lierParent) {
    if (!EMAIL.test(v.parentEmail)) ctx.addIssue({ code: 'custom', path: ['parentEmail'], message: "Saisissez l'adresse e-mail du parent." });
    if (!v.parentRelation) ctx.addIssue({ code: 'custom', path: ['parentRelation'], message: 'Choisissez le lien de parenté.' });
    if (v.parentNom.length > 120) ctx.addIssue({ code: 'custom', path: ['parentNom'], message: '120 caractères au maximum.' });
    // Contrôlé avant l'envoi : sinon l'élève serait créé, puis la liaison du parent refusée par le serveur
    if (v.parentTelephone && !mobileValide(v.parentTelephone)) {
      ctx.addIssue({ code: 'custom', path: ['parentTelephone'], message: "Saisissez un numéro de mobile (ex. : 77 123 45 67, ou +33 6 12 34 56 78 à l'étranger)." });
    }
  }
});
type Formulaire = z.infer<typeof schema>;
type Champ = keyof Formulaire;

const VIDE: Formulaire = {
  prenom: '', nom: '', classeId: '', sansEmail: false, email: '', telephone: '', matricule: '',
  lierParent: false, parentEmail: '', parentNom: '', parentRelation: '', parentTelephone: '',
};

/** Champs affichés selon les cases cochées : seuls ceux-là peuvent montrer un message d'erreur. */
function champsAffiches(v: Pick<Formulaire, 'sansEmail' | 'lierParent'>): Champ[] {
  return [
    'prenom', 'nom', 'classeId', 'telephone', 'matricule',
    ...(v.sansEmail ? [] : ['email' as const]),
    ...(v.lierParent ? ['parentEmail' as const, 'parentRelation' as const, 'parentNom' as const, 'parentTelephone' as const] : []),
  ];
}

/**
 * Champ de l'élève reconnu dans un message du serveur. 16/11 (défaut « rien ne se passe ») : « Le champ « sansEmail »
 * n'a pas le bon type » était rattaché au champ e-mail (« sansEmail » contient « Email »), masqué quand « Sans e-mail »
 * est coché, et aucun message n'apparaissait. Désormais : mot entier, et seulement vers un champ affiché.
 */
const MOTS_CLES_ELEVE: Partial<Record<Champ, RegExp>> = {
  email: /\be-?mail/i, matricule: /matricule/i, telephone: /t[ée]l[ée]phone/i, classeId: /\bclasse/i,
};

type ClasseOption = { id: string; nom: string };
function lireClasses(data: unknown): ClasseOption[] {
  const contenu = objetBrut(data).content;
  const brut = Array.isArray(data) ? data : (Array.isArray(contenu) ? contenu : []);
  return brut.flatMap((x) => {
    const c = objetBrut(x);
    const id = texteOuNull(c.id);
    const nom = texteOuNull(c.name) ?? texteOuNull(c.nom);
    return id && nom ? [{ id, nom }] : [];
  });
}

/** Résultat réel renvoyé par le serveur (mot de passe affiché une seule fois). */
interface Resultat {
  fiche: FicheIdentifiantsEleve | null;
  nom: string;
  identifiant: string;
  connexionParMatricule: boolean;
  /** Échec de la liaison du parent alors que l'élève est bien créé. */
  erreurParent: string | null;
  /** Comptes créés ici, à qui envoyer leur lien d'accès par WhatsApp (jamais le mot de passe). */
  destinataires: DestinataireLien[];
  /** Compte parent déjà existant alors qu'un numéro a été saisi : le serveur ne le modifie pas. */
  noteParent: string | null;
}

const champ = 'w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary';
const etiquette = 'text-[10px] font-bold text-neutral-500 uppercase block mb-1';
const lien = 'p-0 border-0 bg-transparent text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-60';

/**
 * Inscription directe d'un élève depuis l'annuaire (2026-11-15, validée par le Tech Lead) : POST /admin/students
 * (e-mail OU « sans e-mail » = connexion par matricule, APP-TL-23), puis, facultativement, liaison d'un parent par la
 * route existante POST /admin/students/{id}/parents. Les mots de passe provisoires renvoyés par le serveur sont
 * affichés une seule fois, avec une fiche imprimable.
 * 16/11 (demande du Tech Lead) : une classe se crée sans quitter la fenêtre (« Créer une classe » / « + Nouvelle
 * classe », réservé au droit « planning.ecrire ») ; elle est ensuite sélectionnée d'office.
 */
export function NouvelEleveModal({ isOpen, onClose, onCreated }: Props) {
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [erreurGlobale, setErreurGlobale] = useState('');
  const [classeRapideOuverte, setClasseRapideOuverte] = useState(false);
  /** Classe créée par-dessus, à sélectionner dès qu'elle figure dans la liste relue. */
  const [classeAttendue, setClasseAttendue] = useState<{ id: string; nom: string } | null>(null);
  const [messageClasse, setMessageClasse] = useState('');
  const focusClasseAuRetour = useRef(false);
  const refErreur = useRef<HTMLParagraphElement>(null);
  const mesDroits = useRbacStore((s) => s.mesDroits);
  const chargerMesDroits = useRbacStore((s) => s.chargerMesDroits);
  const classes = useQuery({
    queryKey: ['admin', 'planning', 'classes', 'options'],
    queryFn: async () => lireClasses((await apiClient.get<unknown>('/admin/planning/classes')).data),
    enabled: isOpen,
  });
  const {
    register, handleSubmit, control, getValues, setValue, setError, setFocus, reset, formState: { errors, isSubmitting },
  } = useForm<Formulaire>({
    resolver: zodResolver(schema),
    defaultValues: VIDE,
  });
  const sansEmail = useWatch({ control, name: 'sansEmail' });
  const lierParent = useWatch({ control, name: 'lierParent' });

  /** Même droit que l'enregistrement de l'écran Classes (PUT /admin/planning/classes) ; null : droits pas encore connus. */
  const peutCreerClasse = mesDroits ? mesDroits.administration || mesDroits.permissions.includes('planning.ecrire') : null;
  const aDesClasses = (classes.data?.length ?? 0) > 0;

  useEffect(() => {
    if (isOpen && !mesDroits) void chargerMesDroits();
  }, [isOpen, mesDroits, chargerMesDroits]);

  // Sélection de la classe créée : seulement quand son option est dans la liste (sinon le choix ne s'afficherait pas)
  useEffect(() => {
    if (!classeAttendue || !classes.data?.some((c) => c.id === classeAttendue.id)) return;
    setValue('classeId', classeAttendue.id, { shouldDirty: true, shouldValidate: true });
    setMessageClasse(`Classe « ${classeAttendue.nom} » créée et sélectionnée.`);
    setClasseAttendue(null);
  }, [classes.data, classeAttendue, setValue]);

  // Fenêtre du dessus fermée : le focus revient au champ Classe
  useEffect(() => {
    if (classeRapideOuverte || !focusClasseAuRetour.current) return;
    focusClasseAuRetour.current = false;
    setFocus('classeId');
  }, [classeRapideOuverte, setFocus]);

  // Erreur générale toujours visible, même si la fenêtre a défilé jusqu'au bouton
  useEffect(() => {
    if (erreurGlobale) refErreur.current?.scrollIntoView({ block: 'nearest' });
  }, [erreurGlobale]);

  const fermer = () => {
    if (isSubmitting) return;
    reset(VIDE);
    setResultat(null);
    setErreurGlobale('');
    setClasseRapideOuverte(false);
    setClasseAttendue(null);
    setMessageClasse('');
    onClose();
  };

  const ouvrirClasseRapide = () => {
    setMessageClasse('');
    setClasseRapideOuverte(true);
  };
  const fermerClasseRapide = () => {
    focusClasseAuRetour.current = true;
    setClasseRapideOuverte(false);
  };
  /** Classe enregistrée : liste relue, puis la classe est sélectionnée (effet ci-dessus) et la fenêtre du dessus fermée. */
  const classeCreee = async (classe: Classe) => {
    setClasseAttendue({ id: classe.id, nom: classe.name });
    const relue = await classes.refetch();
    if (!relue.data?.some((c) => c.id === classe.id)) {
      setMessageClasse(`Classe « ${classe.name} » créée, mais la liste des classes n'a pas pu être relue.`);
    }
    fermerClasseRapide();
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const echap = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (classeRapideOuverte) {   // Échap ferme la fenêtre du dessus seulement
        fermerClasseRapide();
        return;
      }
      if (!resultat) fermer();
    };
    document.addEventListener('keydown', echap);
    return () => document.removeEventListener('keydown', echap);
  });

  if (!isOpen) return null;

  /** Erreur de saisie sur un champ masqué (ne devrait plus arriver) : affichée en haut plutôt que perdue. */
  const saisieInvalide = (erreurs: FieldErrors<Formulaire>) => {
    const affiches = champsAffiches(getValues());
    const masque = (Object.keys(erreurs) as Champ[]).find((c) => !affiches.includes(c));
    setErreurGlobale(masque ? (erreurs[masque]?.message ?? 'Vérifiez les informations saisies.') : '');
  };

  const envoyer = async (v: Formulaire) => {
    setErreurGlobale('');
    const corps: Record<string, string | boolean> = { prenom: v.prenom, nom: v.nom };
    if (v.sansEmail) corps.sansEmail = true; else corps.email = v.email;
    if (v.classeId) corps.classeId = v.classeId;
    if (v.telephone) corps.telephone = v.telephone;
    if (v.matricule) corps.matricule = v.matricule;
    let eleve: Record<string, unknown>;
    try {
      eleve = objetBrut((await apiClient.post<unknown>('/admin/students', corps)).data);
    } catch (err) {
      // Message sous le champ concerné s'il est affiché, sinon en haut de la fenêtre : jamais d'échec muet
      const affiches = champsAffiches({ sansEmail: v.sansEmail, lierParent: false });
      const motsCles: Partial<Record<Champ, RegExp>> = {};
      for (const c of affiches) {
        const motif = MOTS_CLES_ELEVE[c];
        if (motif) motsCles[c] = motif;
      }
      setErreurGlobale(reporterErreurServeur(err, setError, { motsCles, champs: affiches }) ?? '');
      return;
    }
    onCreated();
    const nom = texteOuNull(eleve.name) ?? `${v.prenom} ${v.nom}`;
    const matricule = texteOuNull(eleve.matricule);
    const connexionParMatricule = eleve.sansEmail === true;
    const identifiant = texteOuNull(eleve.identifiant) ?? (connexionParMatricule ? matricule : texteOuNull(eleve.email)) ?? '';
    const motDePasse = texteOuNull(eleve.motDePasseProvisoire);

    let parent: FicheIdentifiantsEleve['parent'] = null;
    let erreurParent: string | null = null;
    let noteParent: string | null = null;
    const eleveId = texteOuNull(eleve.id);
    const destinataires: DestinataireLien[] = eleveId
      ? [{ role: 'eleve', id: eleveId, nom, telephone: texteOuNull(eleve.telephone), email: connexionParMatricule ? null : texteOuNull(eleve.email) }]
      : [];
    if (v.lierParent && eleveId) {
      try {
        const corpsParent: Record<string, string> = { email: v.parentEmail, relation: v.parentRelation };
        if (v.parentNom) corpsParent.nom = v.parentNom;
        if (v.parentTelephone) corpsParent.telephone = v.parentTelephone;
        const p = objetBrut((await apiClient.post<unknown>(`/admin/students/${encodeURIComponent(eleveId)}/parents`, corpsParent)).data);
        parent = {
          nom: texteOuNull(p.nom), identifiant: texteOuNull(p.email),
          relation: texteOuNull(p.relationLibelle) ?? texteOuNull(p.relation), motDePasse: texteOuNull(p.motDePasseProvisoire),
        };
        const parentId = texteOuNull(p.parentId);
        // Lien d'accès proposé pour un compte parent créé ici ; un compte existant garde ses accès (et son numéro)
        if (parentId && p.compteCree === true) {
          destinataires.push({ role: 'parent', id: parentId, nom: texteOuNull(p.nom) ?? 'le parent', telephone: texteOuNull(p.telephone), email: texteOuNull(p.email) });
        } else if (v.parentTelephone) {
          noteParent = 'Compte parent déjà existant : son numéro de téléphone n\'a pas été modifié.';
        }
      } catch (err) {
        erreurParent = resolveErrorMessage(err);
      }
    }
    toast.success(`Compte élève créé pour ${nom}.`);
    setResultat({
      nom, identifiant, connexionParMatricule, erreurParent, destinataires, noteParent,
      fiche: motDePasse ? { nom, classe: texteOuNull(eleve.classe), matricule, identifiant, connexionParMatricule, motDePasse, parent } : null,
    });
  };

  const imprimer = () => {
    if (resultat?.fiche && !imprimerFicheIdentifiantsEleve(resultat.fiche)) {
      toast.error("Le navigateur a bloqué la fenêtre d'impression : autorisez les fenêtres de ce site.");
    }
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-[#0F172A]/50 backdrop-blur-xs"
          inert={classeRapideOuverte}
          onMouseDown={(e) => { if (e.target === e.currentTarget && !resultat) fermer(); }}>
          <div id="nouvel-eleve" role="dialog" aria-modal="true" aria-labelledby="nouvel-eleve-titre"
            className="w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h3 id="nouvel-eleve-titre" className="font-extrabold text-[#1E293B] text-sm flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-primary text-lg">person_add</span>
                {resultat ? `Compte créé : ${resultat.nom}` : 'Nouvel élève'}
              </h3>
              {!resultat && (
                <button type="button" onClick={fermer} aria-label="Fermer" className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 border-0 bg-transparent cursor-pointer">
                  <span translate="no" className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-5 text-xs">
              {resultat ? (
                <div className="space-y-4" id="nouvel-eleve-resultat">
                  {resultat.erreurParent && (
                    <p id="nouvel-eleve-erreur-parent" role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold m-0">
                      Élève créé, mais le parent n'a pas pu être lié : {resultat.erreurParent} Liez-le depuis la fiche de l'élève.
                    </p>
                  )}
                  <p className="font-semibold text-neutral-700 m-0">
                    Identifiant de connexion : <span className="font-mono text-[#1E293B]">{resultat.identifiant}</span>
                    {resultat.connexionParMatricule && <span className="block text-[11px] text-neutral-500">Connexion par matricule (élève sans e-mail).</span>}
                  </p>
                  {resultat.fiche ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <p className="font-bold text-amber-900 m-0">Mot de passe provisoire de l'élève :</p>
                      <code className="block px-3 py-2 bg-white border border-amber-200 rounded-lg font-mono text-sm text-[#1E293B] select-all break-all">{resultat.fiche.motDePasse}</code>
                      {resultat.fiche.parent?.motDePasse && (
                        <>
                          <p className="font-bold text-amber-900 m-0">Compte parent créé ({resultat.fiche.parent.identifiant}) — mot de passe provisoire :</p>
                          <code className="block px-3 py-2 bg-white border border-amber-200 rounded-lg font-mono text-sm text-[#1E293B] select-all break-all">{resultat.fiche.parent.motDePasse}</code>
                        </>
                      )}
                      <p className="text-[11px] text-amber-800 font-semibold m-0">
                        Affiché une seule fois et envoyé à personne : imprimez la fiche et remettez-la. Il devra être changé à la première connexion.
                      </p>
                    </div>
                  ) : (
                    <p className="text-neutral-600 m-0">Le mot de passe saisi n'est pas réaffiché.</p>
                  )}
                  {resultat.fiche?.parent && !resultat.fiche.parent.motDePasse && (
                    <p className="text-neutral-600 m-0">Parent lié : {resultat.fiche.parent.nom} ({resultat.fiche.parent.relation}) — compte déjà existant, mot de passe inchangé.</p>
                  )}
                  {resultat.noteParent && <p id="nouvel-eleve-note-parent" className="text-neutral-600 font-semibold m-0">{resultat.noteParent}</p>}
                  <EnvoiLienWhatsApp destinataires={resultat.destinataires} />
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    {resultat.fiche && (
                      <button type="button" onClick={imprimer} className="px-4 py-2 bg-white text-[#1E293B] font-black rounded-xl border border-neutral-300 hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1">
                        <span translate="no" className="material-symbols-outlined text-sm">print</span> Imprimer la fiche
                      </button>
                    )}
                    <button type="button" onClick={fermer} className="px-5 py-2 bg-primary text-white font-black rounded-xl border-0 cursor-pointer">
                      J'ai remis les identifiants
                    </button>
                  </div>
                </div>
              ) : (
                <form noValidate onSubmit={handleSubmit(envoyer, saisieInvalide)} className="space-y-4">
                  {erreurGlobale && (
                    <p ref={refErreur} id="nouvel-eleve-erreur" role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold m-0">
                      {erreurGlobale}
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ne-prenom" className={etiquette}>Prénom *</label>
                      <input id="ne-prenom" {...register('prenom')} className={champ} autoComplete="off" />
                      {errors.prenom && <p className="text-rose-600 font-bold mt-1 m-0">{errors.prenom.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="ne-nom" className={etiquette}>Nom *</label>
                      <input id="ne-nom" {...register('nom')} className={champ} autoComplete="off" />
                      {errors.nom && <p className="text-rose-600 font-bold mt-1 m-0">{errors.nom.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="ne-classe" className={etiquette}>Classe</label>
                        {aDesClasses && peutCreerClasse && (
                          <button id="ne-classe-nouvelle" type="button" onClick={ouvrirClasseRapide} disabled={isSubmitting} className={`${lien} mb-1`}>
                            + Nouvelle classe
                          </button>
                        )}
                      </div>
                      <select id="ne-classe" {...register('classeId', { onChange: () => setMessageClasse('') })} className={champ} disabled={classes.isPending}>
                        <option value="">{classes.isPending ? 'Chargement des classes…' : aDesClasses ? 'Sans classe' : "Aucune classe pour l'instant"}</option>
                        {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                      {classes.isError && (
                        <p className="text-rose-600 font-bold mt-1 m-0">
                          Classes indisponibles : {resolveErrorMessage(classes.error)}{' '}
                          <button type="button" onClick={() => void classes.refetch()} className={lien}>Réessayer</button>
                        </p>
                      )}
                      {classes.isSuccess && !aDesClasses && peutCreerClasse === true && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <button id="ne-classe-creer" type="button" onClick={ouvrirClasseRapide} disabled={isSubmitting}
                            className="px-3 py-1.5 inline-flex items-center gap-1 bg-white border border-primary/40 text-primary font-bold rounded-xl hover:bg-primary/5 cursor-pointer disabled:opacity-60">
                            <span translate="no" className="material-symbols-outlined text-sm">add</span>
                            Créer une classe
                          </button>
                          <span className="text-neutral-500 font-semibold">ou laissez vide : la classe est facultative.</span>
                        </div>
                      )}
                      {classes.isSuccess && !aDesClasses && peutCreerClasse === false && (
                        <p id="ne-classe-aide" className="text-neutral-500 font-semibold mt-1 m-0">Demandez à l'administration de créer une classe.</p>
                      )}
                      {messageClasse && <p id="ne-classe-message" role="status" className="text-emerald-700 font-bold mt-1 m-0">{messageClasse}</p>}
                      {errors.classeId && <p className="text-rose-600 font-bold mt-1 m-0">{errors.classeId.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                        <input type="checkbox" {...register('sansEmail', { onChange: (e) => { if (e.target.checked) setValue('email', ''); } })} />
                        Sans e-mail (connexion par matricule)
                      </label>
                    </div>
                    {!sansEmail && (
                      <div className="sm:col-span-2">
                        <label htmlFor="ne-email" className={etiquette}>E-mail de l'élève * (identifiant de connexion)</label>
                        <input id="ne-email" type="email" {...register('email')} className={champ} placeholder="prenom.nom@exemple.sn" autoComplete="off" />
                        {errors.email && <p className="text-rose-600 font-bold mt-1 m-0">{errors.email.message}</p>}
                      </div>
                    )}
                    <div>
                      <label htmlFor="ne-tel" className={etiquette}>Téléphone (facultatif)</label>
                      <input id="ne-tel" type="tel" {...register('telephone')} className={champ} placeholder="+221 …" />
                      {errors.telephone && <p className="text-rose-600 font-bold mt-1 m-0">{errors.telephone.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="ne-matricule" className={etiquette}>Matricule (facultatif)</label>
                      <input id="ne-matricule" {...register('matricule')} className={champ} placeholder="Généré automatiquement si vide" />
                      {errors.matricule && <p className="text-rose-600 font-bold mt-1 m-0">{errors.matricule.message}</p>}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 space-y-3">
                    <label className="flex items-center gap-2 font-bold text-neutral-700 cursor-pointer">
                      <input type="checkbox" {...register('lierParent')} />
                      Lier un parent (facultatif)
                    </label>
                    {lierParent && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="ne-p-email" className={etiquette}>E-mail du parent *</label>
                          <input id="ne-p-email" type="email" {...register('parentEmail')} className={champ} autoComplete="off" />
                          {errors.parentEmail && <p className="text-rose-600 font-bold mt-1 m-0">{errors.parentEmail.message}</p>}
                        </div>
                        <div>
                          <label htmlFor="ne-p-relation" className={etiquette}>Lien de parenté *</label>
                          <select id="ne-p-relation" {...register('parentRelation')} className={champ}>
                            <option value="">Choisir…</option>
                            {RELATIONS.map((r) => <option key={r.code} value={r.code}>{r.libelle}</option>)}
                          </select>
                          {errors.parentRelation && <p className="text-rose-600 font-bold mt-1 m-0">{errors.parentRelation.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="ne-p-nom" className={etiquette}>Nom du parent (si son compte n'existe pas encore)</label>
                          <input id="ne-p-nom" {...register('parentNom')} className={champ} autoComplete="off" />
                          {errors.parentNom && <p className="text-rose-600 font-bold mt-1 m-0">{errors.parentNom.message}</p>}
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor="ne-p-tel" className={etiquette}>Téléphone du parent (WhatsApp)</label>
                          <input id="ne-p-tel" type="tel" {...register('parentTelephone')} className={champ} placeholder="77 123 45 67" autoComplete="off" />
                          {errors.parentTelephone && <p className="text-rose-600 font-bold mt-1 m-0">{errors.parentTelephone.message}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-500 font-semibold m-0">
                    Un mot de passe provisoire est généré par le serveur et affiché une seule fois, avec une fiche à imprimer.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={fermer} className="px-3.5 py-2 font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl border-0 bg-transparent cursor-pointer">Annuler</button>
                    <button id="nouvel-eleve-creer" type="submit" disabled={isSubmitting} className="px-5 py-2 bg-primary text-white font-black rounded-xl border-0 cursor-pointer disabled:opacity-60">
                      {isSubmitting ? 'Création…' : "Créer le compte de l'élève"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
      {classeRapideOuverte && <ClasseRapideModal onFermer={fermerClasseRapide} onCreee={classeCreee} />}
    </>
  );
}

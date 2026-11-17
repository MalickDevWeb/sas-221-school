import React, { ReactNode, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCollaborationState } from '../../hooks/useCollaborationState';
import { useAuthStore } from '@/core/store/authStore';
import { ModuleAvecSousMenu, SousMenuModule, useRepliSousMenu, type EntreeSousMenu } from '@/shared/components/SousMenuModule';
import { erreurLienMeet } from '@/shared/lib/lienMeet';
import { ChampsHoraire } from '../components/ChampsHoraire';
import { erreurHoraire, libelleHoraire, statutSeance, LIBELLE_STATUT } from '../../domain/horaireSeance';
import { MeetScheduler } from '../components/MeetScheduler';
import { GroupCreator } from '../components/GroupCreator';
import { GroupWorkspace } from '../components/GroupWorkspace';
import { GroupMembersPanel } from '../components/GroupMembersPanel';
import { GitHubCollaboration } from '../components/GitHubCollaboration';
import { MeetSessionTracker } from '../components/MeetSessionTracker';

/**
 * Collaboration — espace ADMINISTRATION (demande du Tech Lead, 2026-11-15) : sous-menu commun, une section par
 * sujet, un seul titre par section, formulaires ouverts par un bouton, boutons à la couleur de l'école.
 * Les espaces élève et professeur gardent CollaborationPage (inchangée).
 *
 * Réunions : le serveur (POST /collaboration/meets) n'enregistre ni l'audience ni le type d'événement ; ces deux
 * choix sont retirés du formulaire (ils étaient perdus) et l'écran l'explique.
 */
type Section = 'classes' | 'groupes' | 'reunions' | 'documents';
const ENTREES: EntreeSousMenu[] = [
  { id: 'classes', libelle: 'Classes virtuelles', icone: 'video_camera_front' },
  { id: 'groupes', libelle: 'Groupes de travail', icone: 'groups' },
  { id: 'reunions', libelle: 'Réunions & événements', icone: 'event' },
  { id: 'documents', libelle: 'Documents partagés', icone: 'folder_shared' },
];

const boutonPrincipal = 'px-4 py-2 bg-primary text-text-on-primary rounded-xl text-xs font-black flex items-center gap-1.5 w-fit cursor-pointer border-0';

function EnTete({ titre, texte, action }: { titre: string; texte: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div>
        <h3 className="font-extrabold text-sm text-[#1E293B]">{titre}</h3>
        <p className="text-[11px] text-neutral-500 font-semibold">{texte}</p>
      </div>
      {action}
    </div>
  );
}

function Vide({ icone, texte, action }: { icone: string; texte: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-neutral-300 rounded-2xl p-8 text-center space-y-3">
      <span translate="no" className="material-symbols-outlined text-3xl text-neutral-300 block">{icone}</span>
      <p className="text-xs text-neutral-500 font-semibold m-0">{texte}</p>
      {action}
    </div>
  );
}

const sansClasses = (m: object) => !('classIds' in m) || !Array.isArray(m.classIds) || m.classIds.length === 0;

export function CollaborationAdminPage() {
  const { utilisateur } = useAuthStore();
  const state = useCollaborationState();
  const [section, setSection] = useState<Section>('classes');
  const [replie, basculerRepli] = useRepliSousMenu('collaboration');
  const [formulaire, setFormulaire] = useState<Section | null>(null);
  const [meetActif, setMeetActif] = useState<string | null>(null);
  const nom = utilisateur?.nom || 'Administration';

  const classes = state.meets.filter((m) => m.classIds.length > 0);
  const reunions = state.adminMeets.filter(sansClasses);
  const groupe = state.workgroups.find((g) => g.id === state.activeGroupId) ?? state.workgroups[0];

  const rejoindre = (id: string, lien: string) => {
    if (utilisateur?.nom) state.recordAttendance(id, utilisateur.nom, utilisateur.email || '');
    window.open(lien, '_blank', 'noopener,noreferrer');
  };
  const choisir = (id: string) => { setSection(id as Section); setFormulaire(null); };

  return (
    <ModuleAvecSousMenu
      id="admin-collaboration-root"
      sousMenu={<SousMenuModule id="collaboration-subsidebar" titre="Collaboration" entrees={ENTREES} actif={section}
        onChoisir={choisir} replie={replie} onBasculerRepli={basculerRepli} />}
    >
      {state.toast && (
        <div role="status" className={`fixed top-4 right-4 z-[220] p-4 rounded-xl shadow-xl flex items-center gap-3 text-white text-xs font-bold ${state.toast.success ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          <CheckCircle className="w-5 h-5" /><span>{state.toast.message}</span>
        </div>
      )}

      {section === 'classes' && (
        <div className="space-y-4" id="collab-classes">
          <EnTete titre="Classes virtuelles" texte="Cours en visioconférence publiés pour une classe (lien Google Meet collé)."
            action={formulaire !== 'classes' && (
              <button type="button" className={boutonPrincipal} onClick={() => setFormulaire('classes')}>
                <span translate="no" className="material-symbols-outlined text-sm">add</span> Planifier une classe virtuelle
              </button>
            )} />
          {formulaire === 'classes' && (
            <div className="space-y-2">
              <MeetScheduler onSchedule={(...a) => { void state.createVirtualClass(...a); setFormulaire(null); }} teacherName={nom} />
              <button type="button" onClick={() => setFormulaire(null)} className="text-xs font-bold text-neutral-500 cursor-pointer border-0 bg-transparent">Annuler</button>
            </div>
          )}
          {classes.length === 0 ? (
            <Vide icone="video_camera_front" texte="Aucune classe virtuelle publiée pour le moment."
              action={formulaire !== 'classes' && <button type="button" className={`${boutonPrincipal} mx-auto`} onClick={() => setFormulaire('classes')}>Planifier la première</button>} />
          ) : (
            <ul className="space-y-2">
              {classes.map((m) => (
                <li key={m.id} className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${meetActif === m.id ? 'border-primary bg-primary/5' : 'border-neutral-200'}`}>
                  <button type="button" onClick={() => setMeetActif(meetActif === m.id ? null : m.id)} className="text-left cursor-pointer border-0 bg-transparent p-0">
                    <span className="font-bold text-xs text-[#1E293B] block">{m.subjectName}</span>
                    <span className="text-[11px] text-neutral-500">{m.classNames.join(', ')}{m.teacherName ? ` · ${m.teacherName}` : ''}</span>
                  </button>
                  <button type="button" onClick={() => rejoindre(m.id, m.meetLink)} className="px-3 py-1.5 bg-primary text-text-on-primary rounded-lg text-[11px] font-black cursor-pointer border-0">Rejoindre</button>
                </li>
              ))}
            </ul>
          )}
          {meetActif && <MeetSessionTracker attendances={state.attendances} meetId={meetActif} />}
        </div>
      )}

      {section === 'groupes' && (
        <div className="space-y-4" id="collab-groupes">
          <EnTete titre="Groupes de travail" texte="Groupes d'élèves par classe, avec leur chef et leur discussion."
            action={formulaire !== 'groupes' && (
              <button type="button" className={boutonPrincipal} onClick={() => setFormulaire('groupes')}>
                <span translate="no" className="material-symbols-outlined text-sm">add</span> Créer des groupes
              </button>
            )} />
          {formulaire === 'groupes' && (
            <div className="space-y-2">
              <GroupCreator onAutoGenerate={state.generateAutoGroups} onCreateManual={state.createManualGroup} />
              <button type="button" onClick={() => setFormulaire(null)} className="text-xs font-bold text-neutral-500 cursor-pointer border-0 bg-transparent">Fermer</button>
            </div>
          )}
          {state.workgroups.length === 0 ? (
            <Vide icone="groups" texte="Aucun groupe de travail pour le moment."
              action={formulaire !== 'groupes' && <button type="button" className={`${boutonPrincipal} mx-auto`} onClick={() => setFormulaire('groupes')}>Créer le premier groupe</button>} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <ul className="lg:col-span-4 space-y-2">
                {state.workgroups.map((g) => (
                  <li key={g.id}>
                    <button type="button" onClick={() => state.setActiveGroupId(g.id)}
                      className={`w-full text-left p-3 rounded-xl border cursor-pointer ${groupe?.id === g.id ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'}`}>
                      <span className="font-bold text-xs text-[#1E293B] block">{g.name}</span>
                      <span className="text-[11px] text-neutral-500">{g.members.length} membre{g.members.length > 1 ? 's' : ''}{g.leaderName ? ` · chef : ${g.leaderName}` : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {groupe && (
                <div className="lg:col-span-8 space-y-4">
                  <GroupMembersPanel group={groupe} onChangeLeader={state.changeGroupLeader} peutChangerChef />
                  <GroupWorkspace groupId={groupe.id} groupName={groupe.name} messages={state.messages} userName={nom} userRole="ADMIN"
                    onSendMessage={(gId, sName, txt, fType, fName) => state.sendMessage(gId, sName, 'ADMIN', txt, fType, fName)} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {section === 'reunions' && <SectionReunions reunions={reunions} onCreer={state.createAdminMeeting} onRejoindre={rejoindre} />}

      {section === 'documents' && (
        <div className="space-y-4" id="collab-documents">
          <EnTete titre="Documents partagés" texte="Fichiers déposés par les groupes de travail, avec leurs versions et commentaires." />
          {state.workgroups.length === 0 ? (
            <Vide icone="folder_shared" texte="Aucun groupe de travail : les documents sont partagés à l'intérieur d'un groupe." />
          ) : (
            <>
              <label className="block text-xs font-bold text-[#1E293B]">
                Groupe
                <select value={groupe?.id ?? ''} onChange={(e) => state.setActiveGroupId(e.target.value)}
                  className="block mt-1 px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold bg-white">
                  {state.workgroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </label>
              {groupe && <GitHubCollaboration documents={state.docs} groupId={groupe.id} onCommit={state.addDocVersion} onComment={state.addDocComment} userName={nom} />}
            </>
          )}
        </div>
      )}
    </ModuleAvecSousMenu>
  );
}

function SectionReunions({ reunions, onCreer, onRejoindre }: {
  reunions: ReturnType<typeof useCollaborationState>['adminMeets'];
  onCreer: ReturnType<typeof useCollaborationState>['createAdminMeeting'];
  onRejoindre: (id: string, lien: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [titre, setTitre] = useState('');
  const [lien, setLien] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [erreurs, setErreurs] = useState<{ titre?: string; lien?: string; horaire?: string }>({});

  const publier = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: { titre?: string; lien?: string; horaire?: string } = {};
    if (!titre.trim()) err.titre = "Saisissez le titre de l'événement.";
    const erreurLien = lien.trim() ? erreurLienMeet(lien) : 'Collez le lien Google Meet de la réunion.';
    if (erreurLien) err.lien = erreurLien;
    const erreurH = erreurHoraire(debut, fin);
    if (erreurH) err.horaire = erreurH;
    setErreurs(err);
    if (err.titre || err.lien || err.horaire) return;
    // audience et type : non enregistrés par le serveur, valeurs neutres transmises
    await onCreer(titre.trim(), 'Administration', 'ALL', '', 'réunion générale', lien.trim(), { debut, fin });
    setTitre(''); setLien(''); setDebut(''); setFin(''); setOuvert(false);
  };

  return (
    <div className="space-y-4" id="collab-reunions">
      <EnTete titre="Réunions & événements" texte="Réunions, conférences ou cérémonies de l'école, avec leur lien de visioconférence."
        action={!ouvert && (
          <button type="button" className={boutonPrincipal} onClick={() => setOuvert(true)}>
            <span translate="no" className="material-symbols-outlined text-sm">add</span> Publier un événement
          </button>
        )} />
      {ouvert && (
        <form onSubmit={(e) => void publier(e)} noValidate data-validation-externe className="border border-neutral-200 rounded-2xl p-4 space-y-3 text-xs bg-[#FAF8F6]">
          <div>
            <label htmlFor="reunion-titre" className="block font-bold text-[#1E293B] mb-1">Titre de l'événement</label>
            <input id="reunion-titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. : Réunion de rentrée des parents"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white" aria-invalid={!!erreurs.titre} />
            {erreurs.titre && <p role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{erreurs.titre}</p>}
          </div>
          <div>
            <label htmlFor="reunion-lien" className="block font-bold text-[#1E293B] mb-1">Lien Google Meet</label>
            <input id="reunion-lien" value={lien} onChange={(e) => setLien(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white" aria-invalid={!!erreurs.lien} />
            {erreurs.lien && <p role="alert" className="mt-1 text-[10px] font-bold text-rose-700">{erreurs.lien}</p>}
          </div>
          <ChampsHoraire prefixeId="reunion" debut={debut} fin={fin} onDebut={setDebut} onFin={setFin} erreur={erreurs.horaire} />
          <p className="text-[11px] text-neutral-500 font-semibold m-0">
            L'événement est visible de tous les comptes de l'école : le choix d'un public (enseignants, administration…)
            et du type d'événement n'est pas encore enregistré par le serveur.
          </p>
          <div className="flex gap-2">
            <button type="submit" className={boutonPrincipal}>Publier l'événement</button>
            <button type="button" onClick={() => { setOuvert(false); setErreurs({}); }} className="px-4 py-2 border border-neutral-200 rounded-xl font-bold bg-white cursor-pointer">Annuler</button>
          </div>
        </form>
      )}
      {reunions.length === 0 ? (
        <Vide icone="event" texte="Aucun événement publié pour le moment."
          action={!ouvert && <button type="button" className={`${boutonPrincipal} mx-auto`} onClick={() => setOuvert(true)}>Publier le premier</button>} />
      ) : (
        <ul className="space-y-2">
          {reunions.map((m) => (
            <li key={m.id} className="p-3 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#1E293B]">
                {m.title || 'Événement'}
                {m.debut && <span className="block font-semibold text-[11px] text-neutral-500">
                  {libelleHoraire(m.debut, m.fin)} · {LIBELLE_STATUT[m.statut ?? statutSeance(m.debut, m.fin)]}
                </span>}
              </span>
              <button type="button" onClick={() => onRejoindre(m.id, m.meetLink)} className="px-3 py-1.5 bg-primary text-text-on-primary rounded-lg text-[11px] font-black cursor-pointer border-0">Rejoindre</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

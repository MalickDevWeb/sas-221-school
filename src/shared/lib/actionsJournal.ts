/**
 * Traduction des entrées du journal d'audit en phrases françaises (« a encaissé un versement »).
 *
 * Le serveur (JournalAuditInterceptor) inscrit chaque écriture avec une description de la forme
 * « Suppression — DELETE /admin/periodes/{id} » (méthode + motif de route Spring). On en tire la méthode et la route,
 * puis on cherche la phrase dans la table ci-dessous (routes d'écriture de docs/api-contract-routes.md et des
 * contrôleurs ajoutés depuis). Route inconnue : phrase générique propre (« a modifié une donnée (Finances) »).
 * Une description qui n'a pas cette forme (libellé lisible écrit par le serveur : purge de conservation,
 * corbeille…) est affichée telle quelle.
 */

export type TypeAction = 'creation' | 'modification' | 'suppression' | 'securite';

/** Clé « MÉTHODE /route » (variables normalisées en « {} »). */
const PHRASES: Record<string, string> = {
  // Élèves
  'POST /admin/students': 'a inscrit un élève',
  'POST /admin/students/import': 'a importé une liste d’élèves',
  'DELETE /admin/students/{}': 'a supprimé un élève',
  'PATCH /admin/students/{}/toggle-status': 'a suspendu ou réactivé un élève',
  'PUT /admin/students/{}/toggle-status': 'a suspendu ou réactivé un élève',
  'POST /admin/students/{}/documents': 'a ajouté un document au dossier d’un élève',
  'POST /admin/students/{}/observations': 'a ajouté une observation sur un élève',
  'POST /admin/students/{}/parents': 'a lié un parent à un élève',
  'DELETE /admin/students/{}/parents/{}': 'a retiré le lien entre un parent et un élève',
  'POST /admin/students/{}/profile360': 'a mis à jour le dossier d’un élève',
  'POST /admin/students/{}/mot-de-passe-provisoire': 'a créé un mot de passe provisoire pour un élève',
  'POST /platform/students/{}/enroll': 'a inscrit un élève',
  'POST /admissions/candidates/{}/inscription': 'a inscrit un candidat admis',
  'POST /admissions/db': 'a enregistré un dossier d’admission',
  'PATCH /candidatures/candidatures/{}/statut': 'a changé le statut d’une candidature',
  'POST /candidatures/settings': 'a modifié la campagne de candidatures',
  'POST /admin/candidatures/settings': 'a modifié la campagne de candidatures',
  'POST /candidatures/submit': 'a déposé une candidature',
  'POST /admin/transferts': 'a demandé le transfert d’un élève',
  'POST /admin/transferts/{}/accepter': 'a accepté le transfert d’un élève',
  'POST /admin/transferts/{}/refuser': 'a refusé le transfert d’un élève',
  'POST /admin/transferts/{}/annuler': 'a annulé une demande de transfert',
  // Classes, planning, trimestres
  'POST /admin/promotions': 'a créé une classe',
  'PUT /admin/promotions/{}': 'a modifié une classe',
  'DELETE /admin/promotions/{}': 'a supprimé une classe',
  'POST /admin/courses': 'a créé un cours',
  'PUT /admin/planning/slots': 'a modifié l’emploi du temps',
  'POST /admin/schedule/assign': 'a affecté un cours à l’emploi du temps',
  'POST /admin/periodes': 'a créé une période',
  'DELETE /admin/periodes/{}': 'a supprimé une période',
  'POST /admin/periodes/{}/cloturer': 'a clôturé une période',
  'POST /admin/periodes/{}/rouvrir': 'a rouvert une période',
  // Personnel et droits
  'POST /admin/professors': 'a créé le compte d’un enseignant',
  'DELETE /admin/professors/{}': 'a supprimé le compte d’un enseignant',
  'POST /admin/staff': 'a créé le compte d’un membre du personnel',
  'PUT /admin/staff/{}': 'a modifié le compte d’un membre du personnel',
  'DELETE /admin/staff/{}': 'a supprimé le compte d’un membre du personnel',
  'PATCH /admin/staff/{}/toggle-status': 'a suspendu ou réactivé un membre du personnel',
  'POST /admin/attendance': 'a enregistré une présence du personnel',
  'PUT /admin/attendance/{}': 'a modifié une présence du personnel',
  'PUT /admin/rbac/{}': 'a modifié les droits d’accès d’un rôle',
  'DELETE /admin/rbac/{}': 'a rétabli les droits par défaut d’un rôle',
  // Établissement
  'PUT /admin/coordonnees': 'a modifié les coordonnées de l’école',
  'PUT /admin/identite-visuelle': 'a modifié l’identité visuelle de l’école',
  'POST /v1/referentiels/{}': 'a ajouté une valeur à une liste',
  'PUT /v1/referentiels/{}/{}': 'a modifié une valeur d’une liste',
  'DELETE /v1/referentiels/{}/{}': 'a supprimé ou rétabli une valeur d’une liste',
  // Sécurité et accès
  'POST /admin/terminaux': 'a créé un terminal d’accès',
  'POST /admin/terminaux/{}/revocation': 'a révoqué un terminal d’accès',
  'PATCH /admin/terminaux/{}/statut': 'a changé l’état d’un terminal d’accès',
  'PUT /admin/terminaux/{}/vigile': 'a affecté un vigile à un terminal',
  'POST /admin/gates/assign': 'a affecté une porte d’accès',
  'POST /auth/changer-mot-de-passe': 'a changé son mot de passe',
  'POST /auth/logout': 's’est déconnecté',
  'POST /auth/reinitialiser-mot-de-passe': 'a réinitialisé un mot de passe',
  'POST /vigil/scan': 'a contrôlé un badge à l’entrée',
  'POST /vigil/scans-hors-ligne': 'a envoyé des contrôles d’entrée faits hors ligne',
  'POST /security/scan-logs': 'a enregistré un contrôle d’accès',
  'POST /student/qr-validate': 'a validé sa présence par QR code',
  // Finances
  'POST /finance/ecolages/dossiers': 'a ouvert un dossier financier',
  'POST /finance/ecolages/versements': 'a encaissé un versement',
  'POST /finance/expenses': 'a enregistré une dépense',
  'POST /finance/payment-reminders': 'a envoyé une relance de paiement',
  // Communication
  'POST /v1/notifications/annonces': 'a envoyé une annonce',
  'PATCH /v1/notifications/{}/lue': 'a lu une notification',
  'POST /v1/notifications': 'a enregistré une notification',
  'DELETE /v1/notifications/{}': 'a supprimé une notification',
  'PATCH /admin/messages-parents/{}/lu': 'a lu un message d’un parent',
  'POST /admin/messages-parents/{}/repondre': 'a répondu à un parent',
  'PATCH /professor/messages-parents/{}/lu': 'a lu un message d’un parent',
  'POST /professor/messages-parents/{}/repondre': 'a répondu à un parent',
  'POST /parent/messages': 'a écrit à l’école',
  'PATCH /parent/messages/{}/lu': 'a lu un message de l’école',
  'POST /parent/rdv': 'a demandé un rendez-vous',
  // Espace parent
  'POST /parent/inscrire-enfant': 'a déposé une demande d’inscription',
  'POST /parent/presences/{}/justifier': 'a justifié une absence',
  'PATCH /parent/profil': 'a modifié son profil',
  // Espace enseignant
  'POST /prof/attendance/submit': 'a fait l’appel',
  'POST /professor/courses/{}/attendance': 'a fait l’appel',
  'POST /professor/courses/{}/evaluations': 'a créé une évaluation',
  'PUT /professor/courses/{}/evaluations/{}': 'a modifié une évaluation',
  'DELETE /professor/courses/{}/evaluations/{}': 'a supprimé une évaluation',
  'PUT /professor/courses/{}/evaluations/{}/notes': 'a saisi des notes',
  'POST /professor/courses/{}/grades/{}': 'a saisi une note',
  'POST /professor/courses/{}/homeworks': 'a donné un devoir',
  'PUT /professor/homeworks/{}': 'a modifié un devoir',
  'DELETE /professor/homeworks/{}': 'a supprimé un devoir',
  'PUT /professor/courses/{}/homeworks/{}/submissions/{}': 'a corrigé un devoir rendu',
  'POST /professor/courses/{}/lessons': 'a ajouté une leçon',
  'PUT /professor/lessons/{}': 'a modifié une leçon',
  'DELETE /professor/lessons/{}': 'a supprimé une leçon',
  'POST /professor/courses/{}/modules': 'a ajouté un chapitre de cours',
  'PUT /professor/modules/{}': 'a modifié un chapitre de cours',
  'DELETE /professor/modules/{}': 'a supprimé un chapitre de cours',
  'POST /professor/modules/{}/quizzes': 'a créé un quiz',
  'PUT /professor/quizzes/{}': 'a modifié un quiz',
  'DELETE /professor/quizzes/{}': 'a supprimé un quiz',
  'POST /professor/courses/{}/reminders': 'a créé un rappel',
  'PUT /professor/reminders/{}': 'a modifié un rappel',
  'DELETE /professor/reminders/{}': 'a supprimé un rappel',
  'POST /professor/schedule/{}/cancel': 'a annulé une séance',
  'POST /professor/schedule/{}/reschedule': 'a demandé le report d’une séance',
  'POST /professor/contenus': 'a ajouté un contenu de cours',
  'PUT /professor/contenus/{}': 'a modifié un contenu de cours',
  'DELETE /professor/contenus/{}': 'a supprimé un contenu de cours',
  // Espace élève
  'POST /student/attendances': 'a signalé sa présence',
  'POST /pointages': 'a pointé son arrivée ou son départ',
  'POST /student/courses/{}/homeworks/{}/submit': 'a rendu un devoir',
  'POST /student/grades/{}/review': 'a demandé la révision d’une note',
  'POST /student/live-sessions': 'a lancé un cours en direct',
  'DELETE /student/live-sessions/{}': 'a terminé un cours en direct',
  'POST /student/live-sessions/{}/chat': 'a écrit dans un cours en direct',
  'POST /student/live-sessions/{}/reaction': 'a réagi dans un cours en direct',
  // Collaboration
  'POST /collaboration/attendances': 'a enregistré une présence en réunion',
  'POST /collaboration/groupchat/groups': 'a créé une discussion de groupe',
  'POST /collaboration/groupchat/individual': 'a ouvert une discussion',
  'POST /collaboration/groupchat/groups/{}/messages/text': 'a écrit dans une discussion',
  'POST /collaboration/groupchat/groups/{}/messages/image': 'a envoyé une image dans une discussion',
  'POST /collaboration/groupchat/groups/{}/messages/audio': 'a envoyé un message vocal',
  'DELETE /collaboration/groupchat/messages/{}': 'a supprimé un message',
  'POST /collaboration/groupchat/groups/{}/participants': 'a ajouté un participant à une discussion',
  'DELETE /collaboration/groupchat/groups/{}/participants/{}': 'a retiré un participant d’une discussion',
  'PUT /collaboration/groupchat/groups/{}/name': 'a renommé une discussion',
  'POST /collaboration/meets': 'a planifié une réunion',
  'POST /collaboration/workgroups': 'a créé un groupe de travail',
  'PUT /collaboration/workgroups/{}/chef': 'a désigné le chef d’un groupe de travail',
  'POST /collaboration/workgroups/{}/documents': 'a partagé un document dans un groupe de travail',
  'POST /collaboration/workgroups/{}/homeworks': 'a déposé un travail de groupe',
  'POST /collaboration/workgroups/{}/messages': 'a écrit dans un groupe de travail',
  'POST /collaboration/workgroups/{}/tasks': 'a créé une tâche de groupe',
  'POST /wiki/pages': 'a créé une page du wiki',
  'POST /wiki/notes': 'a ajouté une note au wiki',
  'POST /media/upload': 'a déposé un fichier',
  // Plateforme
  'POST /v1/super-admin/plans': 'a créé une formule d’abonnement',
  'POST /v1/super-admin/subscriptions': 'a abonné une école à une formule',
  'PATCH /v1/super-admin/tenants/{}': 'a modifié une école',
  'DELETE /v1/super-admin/tenants/{}': 'a archivé une école',
  'POST /v1/super-admin/tenants/{}/activate': 'a réactivé une école',
  'POST /v1/super-admin/tenants/{}/approve': 'a validé une école',
  'POST /v1/super-admin/tenants/{}/suspend': 'a suspendu une école',
  'POST /v1/super-admin/users': 'a créé un compte de la plateforme',
  'DELETE /v1/super-admin/users/{}': 'a supprimé un compte de la plateforme',
  'POST /register-school': 'a inscrit une nouvelle école',
};

/** Nom lisible du module d'après le début de la route. */
const MODULES: [RegExp, string][] = [
  [/^\/admin\/(students|transferts)/, 'Élèves'], [/^\/(admissions|candidatures|admin\/candidatures)/, 'Admissions'],
  [/^\/admin\/(promotions|courses|planning|schedule)/, 'Classes et planning'], [/^\/admin\/periodes/, 'Trimestres'],
  [/^\/admin\/(staff|professors|attendance)/, 'Personnel'], [/^\/admin\/rbac/, 'Droits d’accès'],
  [/^\/admin\/(terminaux|gates)|^\/(vigil|security)/, 'Contrôle d’accès'], [/^\/finance/, 'Finances'],
  [/^\/(v1\/)?notifications|^\/admin\/messages-parents|^\/email/, 'Communication'], [/^\/v1\/referentiels/, 'Référentiels'],
  [/^\/admin\/(coordonnees|identite-visuelle|domaine)/, 'Établissement'], [/^\/(professor|prof)\//, 'Espace enseignant'],
  [/^\/student\//, 'Espace élève'], [/^\/parent\//, 'Espace parent'], [/^\/(collaboration|wiki|meet)/, 'Collaboration'],
  [/^\/v1\/super-admin/, 'Plateforme'], [/^\/auth/, 'Connexion'], [/^\/sync/, 'Synchronisation hors ligne'],
  [/^\/media/, 'Fichiers'], [/^\/admin/, 'Administration'],
];

const FORME = /^(.*?)\s+—\s+(GET|POST|PUT|PATCH|DELETE)\s+(\/\S*)\s*$/;
const normaliser = (route: string) => route.replace(/^\/api(?=\/)/, '').replace(/\{[^}]*\}/g, '{}').replace(/\/+$/, '') || '/';

export interface ActionLisible {
  /** « a encaissé un versement » (ou libellé du serveur quand il est déjà lisible). */
  phrase: string;
  /** Vrai si `phrase` est un libellé du serveur (à afficher après le nom, pas comme verbe). */
  libre: boolean;
  type: TypeAction;
  module: string;
  /** Méthode et route (détails techniques), si la description les contenait. */
  methode: string | null;
  route: string | null;
}

export function moduleDeRoute(route: string): string {
  return MODULES.find(([re]) => re.test(route))?.[1] ?? 'Autre';
}

/** `action` : CREATE | UPDATE | DELETE (colonne action du journal) ; `description` : texte inscrit par le serveur. */
export function actionLisible(action: string | null | undefined, description: string | null | undefined): ActionLisible {
  const desc = (description ?? '').trim();
  const m = FORME.exec(desc);
  const codeAction = (action ?? '').toUpperCase();
  if (!m) {
    // Libellé déjà lisible écrit par le serveur (corbeille, purge, synchronisation…) : affiché tel quel
    const type: TypeAction = codeAction === 'DELETE' ? 'suppression' : codeAction === 'CREATE' ? 'creation' : 'modification';
    const texte = desc || 'action sans description';
    return { phrase: texte, libre: true, type, module: 'Autre', methode: null, route: null };
  }
  const methode = m[2];
  const route = normaliser(m[3]);
  const module = moduleDeRoute(route);
  const securite = /^\/(auth|admin\/rbac|admin\/terminaux|admin\/gates|vigil|security)/.test(route) || /mot-de-passe/.test(route);
  const type: TypeAction = securite ? 'securite'
    : methode === 'DELETE' ? 'suppression'
      : methode === 'POST' && !route.includes('{}') ? 'creation' : 'modification';
  const connue = PHRASES[`${methode} ${route}`];
  const generique = type === 'suppression' ? `a supprimé une donnée (${module})`
    : type === 'creation' ? `a créé une donnée (${module})` : `a modifié une donnée (${module})`;
  return { phrase: connue ?? generique, libre: false, type, module, methode, route: m[3] };
}

export const LIBELLES_TYPES: Record<TypeAction, string> = {
  creation: 'Création', modification: 'Modification', suppression: 'Suppression', securite: 'Connexion et sécurité',
};

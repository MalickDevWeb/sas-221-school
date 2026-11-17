/**
 * Menu de l'administration d'école, en sections (structure validée par le Tech Lead le 15/11/2026).
 * Les `id` sont les identifiants d'onglet internes (AdminTabViews, tests : attribut data-onglet) : ils ne changent pas.
 * `requiredPerm` : permission du catalogue du serveur (GET /admin/rbac) exigée pour voir l'entrée.
 * Partagé par la barre latérale (AdminSidebar) et le menu mobile « Plus » (MobilePlusMenu).
 */
export interface EntreeMenuAdmin { id: string; label: string; icon: string; requiredPerm: string }
export interface SectionMenuAdmin { titre: string | null; entrees: EntreeMenuAdmin[] }

export const SECTIONS_MENU_ADMIN: SectionMenuAdmin[] = [
  { titre: null, entrees: [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', requiredPerm: 'ecole.lire' },
  ] },
  { titre: 'Scolarité', entrees: [
    { id: 'students', label: 'Élèves', icon: 'group', requiredPerm: 'eleves.lire' },
    { id: 'promotions', label: 'Classes', icon: 'account_tree', requiredPerm: 'planning.lire' },
    { id: 'admissions', label: 'Admissions', icon: 'person_add', requiredPerm: 'admissions.lire' },
    { id: 'transferts', label: 'Transferts', icon: 'swap_horiz', requiredPerm: 'transferts.lire' },
    { id: 'justificatifs', label: 'Absences justifiées', icon: 'assignment_turned_in', requiredPerm: 'eleves.lire' },
  ] },
  { titre: 'Pédagogie', entrees: [
    { id: 'schedule', label: 'Emploi du temps', icon: 'calendar_today', requiredPerm: 'planning.lire' },
    { id: 'periodes', label: 'Trimestres & bulletins', icon: 'event_available', requiredPerm: 'ecole.lire' },
    { id: 'collaboration', label: 'Collaboration', icon: 'group_work', requiredPerm: 'collaboration.lire' },
  ] },
  { titre: 'Équipe', entrees: [
    { id: 'personnel', label: 'Personnel', icon: 'badge', requiredPerm: 'personnel.lire' },
  ] },
  { titre: 'Finances', entrees: [
    { id: 'finances', label: 'Finances', icon: 'payments', requiredPerm: 'finances.lire' },
    { id: 'billing', label: 'Mon abonnement', icon: 'workspace_premium', requiredPerm: 'ecole.lire' },
  ] },
  { titre: 'Communication', entrees: [
    { id: 'notifications', label: 'Annonces & alertes', icon: 'campaign', requiredPerm: 'communication.lire' },
    { id: 'messages_parents', label: 'Messages des parents', icon: 'mail', requiredPerm: 'eleves.lire' },
  ] },
  { titre: 'Paramètres', entrees: [
    { id: 'school', label: 'Configuration de l’école', icon: 'school', requiredPerm: 'planning.lire' },
    { id: 'branding', label: 'Personnalisation', icon: 'palette', requiredPerm: 'ecole.lire' },
    { id: 'referentiels', label: 'Référentiels', icon: 'tune', requiredPerm: 'ecole.lire' },
    { id: 'security', label: 'Sécurité & audit', icon: 'security', requiredPerm: 'securite.lire' },
    // Corbeille (V21, 16/11) : l'administration voit toute l'école, un membre du personnel ses propres suppressions
    { id: 'corbeille', label: 'Corbeille', icon: 'delete', requiredPerm: 'ecole.lire' },
  ] },
];

export const ENTREES_MENU_ADMIN: EntreeMenuAdmin[] = SECTIONS_MENU_ADMIN.flatMap(s => s.entrees);

/** Sections réduites aux entrées autorisées par les droits du compte (sections vides retirées). */
export function sectionsVisibles(droits: { administration: boolean; permissions: string[] } | null): SectionMenuAdmin[] {
  if (!droits) return [];
  return SECTIONS_MENU_ADMIN
    .map(s => ({ ...s, entrees: s.entrees.filter(e => droits.administration || droits.permissions.includes(e.requiredPerm)) }))
    .filter(s => s.entrees.length > 0);
}

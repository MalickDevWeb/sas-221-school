export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: 'Actif' | 'Suspendu';
  assignedClass?: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  photo: string;
  role: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'À l\'heure' | 'En retard' | 'Absent';
  note?: string;
  phone?: string;
  email?: string;
  department?: string;
  date?: string;
}

export const STAFF_ROLES = ['Administrateur', 'Secrétaire', 'Comptable', 'Enseignant', 'Vigile'];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'EMP-2026-001', firstName: 'Marie', lastName: 'Sow', email: 'marie.sow@ecole221.sn', phone: '77 123 45 67', role: 'Secrétaire', status: 'Actif' },
  { id: 'EMP-2026-002', firstName: 'Khadim', lastName: 'Diallo', email: 'khadim.diallo@ecole221.sn', phone: '78 987 65 43', role: 'Enseignant', status: 'Actif', assignedClass: 'L2 Génie Civil' },
  { id: 'EMP-2026-003', firstName: 'Abdou', lastName: 'Ndiaye', email: 'abdou.ndiaye@ecole221.sn', phone: '76 543 21 09', role: 'Vigile', status: 'Actif' },
  { id: 'EMP-2026-004', firstName: 'Ibrahima', lastName: 'Faye', email: 'ibrahima.faye@ecole221.sn', phone: '70 888 99 00', role: 'Comptable', status: 'Actif' },
  { id: 'EMP-2026-005', firstName: 'Awa', lastName: 'Diop', email: 'awa.diop@ecole221.sn', phone: '75 111 22 33', role: 'Secrétaire', status: 'Suspendu' },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', name: 'Marie Sow', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80', role: 'Secrétaire', checkIn: '07h52', checkOut: '17h05', hours: 9, status: 'À l\'heure' },
  { id: 'att-2', name: 'Khadim Diallo', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80', role: 'Enseignant', checkIn: '08h15', checkOut: '16h00', hours: 7.5, status: 'En retard' },
  { id: 'att-3', name: 'Abdou Ndiaye', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', role: 'Vigile', checkIn: '06h45', checkOut: '18h00', hours: 11.25, status: 'À l\'heure' },
  { id: 'att-4', name: 'Ibrahima Faye', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80', role: 'Comptable', checkIn: '08h02', checkOut: '17h30', hours: 9.25, status: 'À l\'heure' },
  { id: 'att-5', name: 'Awa Diop', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80', role: 'Secrétaire', checkIn: '--', checkOut: '--', hours: 0, status: 'Absent' },
];

export interface RbacPermission {
  key: string;
  label: string;
  category: 'Finance' | 'Pédagogie' | 'Logistique' | 'Scolarité' | 'Sécurité' | 'Personnel & RH' | 'Communication' | 'Système & École';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  description: string;
}

export const RBAC_CATEGORIES = [
  'Toutes',
  'Finance',
  'Pédagogie',
  'Logistique',
  'Scolarité',
  'Sécurité',
  'Personnel & RH',
  'Communication',
  'Système & École',
] as const;

export const RBAC_PERMISSIONS: RbacPermission[] = [
  // ==================== FINANCE & FACTURATION ====================
  { key: 'finance_transactions_get', label: 'Consulter journal des paiements', category: 'Finance', method: 'GET', endpoint: '/api/finance/transactions', description: 'Historique des transactions, reçus et paiements élèves' },
  { key: 'finance_transactions_post', label: 'Enregistrer un encaissement / reçu', category: 'Finance', method: 'POST', endpoint: '/api/finance/transactions', description: 'Création d\'un versement en espèces, virement ou Wave' },
  { key: 'finance_transactions_put', label: 'Modifier une transaction financière', category: 'Finance', method: 'PUT', endpoint: '/api/finance/transactions/{id}', description: 'Rectification d\'un montant, date ou référence de paiement' },
  { key: 'finance_transactions_patch', label: 'Valider / Rapprocher un paiement', category: 'Finance', method: 'PATCH', endpoint: '/api/finance/transactions/{id}/validate', description: 'Validation formelle du versement et émission du reçu définitif' },
  { key: 'finance_transactions_delete', label: 'Annuler / Supprimer un paiement', category: 'Finance', method: 'DELETE', endpoint: '/api/finance/transactions/{id}', description: 'Rétractation d\'un paiement erroné ou fraude signalée' },
  { key: 'finance_expenses_get', label: 'Consulter les dépenses & charges', category: 'Finance', method: 'GET', endpoint: '/api/finance/expenses', description: 'Suivi des factures fournisseurs, loyers, salaires et achats' },
  { key: 'finance_expenses_post', label: 'Créer / Engager une dépense', category: 'Finance', method: 'POST', endpoint: '/api/finance/expenses', description: 'Déclaration d\'une facture ou d\'une sortie de caisse' },
  { key: 'finance_expenses_put', label: 'Modifier une dépense engagée', category: 'Finance', method: 'PUT', endpoint: '/api/finance/expenses/{id}', description: 'Mise à jour des justificatifs et des montants de dépenses' },
  { key: 'finance_expenses_delete', label: 'Supprimer / Rejeter une dépense', category: 'Finance', method: 'DELETE', endpoint: '/api/finance/expenses/{id}', description: 'Rejet ou suppression définitive d\'une note de frais' },
  { key: 'finance_reports_get', label: 'Exporter bilans comptables (Excel/PDF)', category: 'Finance', method: 'GET', endpoint: '/api/finance/reports', description: 'Extraction des états comptables et récapitulatifs périodiques' },
  { key: 'finance_relances_post', label: 'Déclencher relances d\'impayés', category: 'Finance', method: 'POST', endpoint: '/api/finance/relances', description: 'Envoi d\'alertes SMS / WhatsApp / email aux parents débiteurs' },

  // ==================== PÉDAGOGIE & ENSEIGNEMENT ====================
  { key: 'pedagogy_grades_get', label: 'Consulter les notes & moyennes', category: 'Pédagogie', method: 'GET', endpoint: '/api/admin/grades', description: 'Vue globale des relevés de notes et classements' },
  { key: 'pedagogy_grades_post', label: 'Saisir de nouvelles notes d\'évaluation', category: 'Pédagogie', method: 'POST', endpoint: '/api/professor/grades', description: 'Enregistrement des devoirs, examens et coefficients' },
  { key: 'pedagogy_grades_put', label: 'Modifier les notes attribuées', category: 'Pédagogie', method: 'PUT', endpoint: '/api/admin/grades/{id}', description: 'Correction d\'une erreur de saisie ou réévaluation' },
  { key: 'pedagogy_grades_delete', label: 'Supprimer une note ou évaluation', category: 'Pédagogie', method: 'DELETE', endpoint: '/api/admin/grades/{id}', description: 'Annulation d\'une épreuve ou suppression d\'une note erronée' },
  { key: 'pedagogy_bulletins_post', label: 'Générer & verrouiller les bulletins', category: 'Pédagogie', method: 'POST', endpoint: '/api/admin/bulletins/generate', description: 'Calcul automatique des rangs et scellage des bulletins' },

  // ==================== LOGISTIQUE, PLANNING & SALLES ====================
  { key: 'planning_schedule_get', label: 'Consulter l\'emploi du temps', category: 'Logistique', method: 'GET', endpoint: '/api/planning/schedule', description: 'Visualisation de la grille hebdomadaire des cours et salles' },
  { key: 'planning_slots_post', label: 'Planifier un cours / créneau', category: 'Logistique', method: 'POST', endpoint: '/api/planning/slots', description: 'Attribution d\'un horaire, d\'une matière et d\'un professeur' },
  { key: 'planning_slots_put', label: 'Modifier un créneau horaire', category: 'Logistique', method: 'PUT', endpoint: '/api/planning/slots/{id}', description: 'Changement de salle, de professeur ou décalage horaire' },
  { key: 'planning_slots_delete', label: 'Annuler / Supprimer un créneau', category: 'Logistique', method: 'DELETE', endpoint: '/api/planning/slots/{id}', description: 'Suppression d\'un cours ou report de séance' },
  { key: 'planning_rooms_get', label: 'Consulter les salles & équipements', category: 'Logistique', method: 'GET', endpoint: '/api/planning/rooms', description: 'Liste des infrastructures physiques et disponibilités' },
  { key: 'planning_rooms_post', label: 'Créer une nouvelle salle', category: 'Logistique', method: 'POST', endpoint: '/api/planning/rooms', description: 'Ajout d\'un amphi, laboratoire ou salle de classe' },
  { key: 'planning_rooms_put', label: 'Modifier une salle & capacité', category: 'Logistique', method: 'PUT', endpoint: '/api/planning/rooms/{id}', description: 'Changement de capacité, matériel ou statut de maintenance' },
  { key: 'planning_rooms_delete', label: 'Supprimer une salle', category: 'Logistique', method: 'DELETE', endpoint: '/api/planning/rooms/{id}', description: 'Retrait définitif d\'un local d\'enseignement' },
  { key: 'planning_classes_get', label: 'Consulter les classes & promotions', category: 'Logistique', method: 'GET', endpoint: '/api/planning/classes', description: 'Inventaire des promotions scolaires et niveaux' },
  { key: 'planning_classes_post', label: 'Créer une promotion / classe', category: 'Logistique', method: 'POST', endpoint: '/api/planning/classes', description: 'Ouverture d\'une nouvelle classe avec effectif max' },
  { key: 'planning_classes_put', label: 'Modifier frais & niveaux de classe', category: 'Logistique', method: 'PUT', endpoint: '/api/planning/classes/{id}', description: 'Mise à jour du tarif annuel d\'écolage et responsable' },
  { key: 'planning_classes_delete', label: 'Supprimer une classe', category: 'Logistique', method: 'DELETE', endpoint: '/api/planning/classes/{id}', description: 'Suppression d\'une division d\'élèves' },
  { key: 'planning_filieres_get', label: 'Consulter les filières d\'études', category: 'Logistique', method: 'GET', endpoint: '/api/planning/filieres', description: 'Spécialités enseignées dans l\'établissement' },
  { key: 'planning_filieres_post', label: 'Créer une filière d\'enseignement', category: 'Logistique', method: 'POST', endpoint: '/api/planning/filieres', description: 'Création d\'un nouveau cursus ou département' },
  { key: 'planning_filieres_put', label: 'Modifier une filière', category: 'Logistique', method: 'PUT', endpoint: '/api/planning/filieres/{id}', description: 'Modification du code ou de l\'intitulé de la filière' },
  { key: 'planning_filieres_delete', label: 'Supprimer une filière', category: 'Logistique', method: 'DELETE', endpoint: '/api/planning/filieres/{id}', description: 'Suppression d\'un cursus académique' },

  // ==================== SCOLARITÉ & ADMISSIONS ====================
  { key: 'students_list_get', label: 'Consulter l\'annuaire des élèves (360°)', category: 'Scolarité', method: 'GET', endpoint: '/api/admin/students', description: 'Accès aux dossiers scolaires complets, assiduité et finances' },
  { key: 'students_list_post', label: 'Inscrire un élève (Manuel / Excel)', category: 'Scolarité', method: 'POST', endpoint: '/api/admin/students', description: 'Création du dossier administratif et matricule scolaire' },
  { key: 'students_list_put', label: 'Modifier la fiche d\'un élève', category: 'Scolarité', method: 'PUT', endpoint: '/api/admin/students/{id}', description: 'Mise à jour des coordonnées parents, photo et statut' },
  { key: 'students_list_delete', label: 'Archiver / Radier un élève', category: 'Scolarité', method: 'DELETE', endpoint: '/api/admin/students/{id}', description: 'Désinscription définitive ou transfert d\'établissement' },
  { key: 'admissions_candidatures_get', label: 'Consulter les dossiers d\'admission', category: 'Scolarité', method: 'GET', endpoint: '/api/admissions/candidatures', description: 'Revue des demandes d\'inscription web et pièces jointes' },
  { key: 'admissions_candidatures_post', label: 'Créer une candidature d\'admission', category: 'Scolarité', method: 'POST', endpoint: '/api/admissions/candidatures', description: 'Dépôt d\'un nouveau dossier d\'inscription en ligne' },
  { key: 'admissions_candidatures_patch', label: 'Statuer (Accepter/Rejeter) un dossier', category: 'Scolarité', method: 'PATCH', endpoint: '/api/admissions/candidatures/{id}/status', description: 'Décision d\'admission et conversion en élève actif' },
  { key: 'admissions_candidatures_delete', label: 'Supprimer un dossier d\'admission', category: 'Scolarité', method: 'DELETE', endpoint: '/api/admissions/candidatures/{id}', description: 'Nettoyage des dossiers abandonnés ou doublons' },

  // ==================== SÉCURITÉ & CONTRÔLE D\'ACCÈS ====================
  { key: 'security_scans_get', label: 'Consulter le flux des scans en direct', category: 'Sécurité', method: 'GET', endpoint: '/api/security/scans', description: 'Suivi des franchissements de portes et bornes par élèves' },
  { key: 'security_scans_post', label: 'Scanner & valider badge QR d\'accès', category: 'Sécurité', method: 'POST', endpoint: '/api/security/scan', description: 'Pointage de sécurité vigile à l\'entrée ou sortie' },
  { key: 'security_badges_post', label: 'Générer & réémettre les badges QR', category: 'Sécurité', method: 'POST', endpoint: '/api/security/badges/generate', description: 'Création des pass chiffrés avec QR Code inviolable' },
  { key: 'security_gates_put', label: 'Configurer & assigner les portiques', category: 'Sécurité', method: 'PUT', endpoint: '/api/security/gates/{id}', description: 'Affectation des vigiles aux postes de contrôle' },
  { key: 'security_patrols_post', label: 'Enregistrer les rondes de surveillance', category: 'Sécurité', method: 'POST', endpoint: '/api/security/patrols', description: 'Rapport d\'incident et confirmation de ronde physique' },
  { key: 'security_audit_get', label: 'Consulter la piste d\'audit & traçabilité', category: 'Sécurité', method: 'GET', endpoint: '/api/audit/logs', description: 'Journal de sécurité immuable de toutes les actions' },

  // ==================== RESSOURCES HUMAINES & PERSONNEL ====================
  { key: 'hr_staff_get', label: 'Consulter l\'annuaire du personnel', category: 'Personnel & RH', method: 'GET', endpoint: '/api/admin/staff', description: 'Liste des employés, secrétaires, comptables et vigiles' },
  { key: 'hr_staff_post', label: 'Créer un nouveau compte employé', category: 'Personnel & RH', method: 'POST', endpoint: '/api/admin/staff', description: 'Attribution des identifiants et du rôle professionnel' },
  { key: 'hr_staff_put', label: 'Modifier un compte employé', category: 'Personnel & RH', method: 'PUT', endpoint: '/api/admin/staff/{id}', description: 'Mise à jour du poste, téléphone ou informations RH' },
  { key: 'hr_staff_patch', label: 'Suspendre / Réactiver un employé', category: 'Personnel & RH', method: 'PATCH', endpoint: '/api/admin/staff/{id}/toggle-status', description: 'Blocage immédiat des accès en cas de départ ou congé' },
  { key: 'hr_staff_delete', label: 'Supprimer définitivement un compte', category: 'Personnel & RH', method: 'DELETE', endpoint: '/api/admin/staff/{id}', description: 'Suppression irréversible du profil personnel' },
  { key: 'hr_attendance_get', label: 'Consulter l\'émargement du personnel', category: 'Personnel & RH', method: 'GET', endpoint: '/api/admin/attendance', description: 'Heures d\'arrivée, de départ et retards constatés' },
  { key: 'hr_attendance_post', label: 'Valider le pointage des employés', category: 'Personnel & RH', method: 'POST', endpoint: '/api/admin/attendance', description: 'Émargement officiel journalier de présence' },

  // ==================== COMMUNICATION & COLLABORATION ====================
  { key: 'communication_notifs_get', label: 'Consulter les annonces & alertes', category: 'Communication', method: 'GET', endpoint: '/api/notifications', description: 'Boîte de réception des alertes d\'établissement' },
  { key: 'communication_notifs_post', label: 'Diffuser une annonce générale', category: 'Communication', method: 'POST', endpoint: '/api/notifications', description: 'Diffusion multicanale (SMS, WhatsApp, portail parents)' },
  { key: 'communication_chat_post', label: 'Envoyer messages de discussion', category: 'Communication', method: 'POST', endpoint: '/api/collaboration/messages', description: 'Échanges collaboratifs entre équipes pédagogiques' },
  { key: 'communication_chat_delete', label: 'Modérer / Supprimer un message', category: 'Communication', method: 'DELETE', endpoint: '/api/collaboration/messages/{id}', description: 'Modération des salons de discussion' },

  // ==================== GOUVERNANCE & PARAMÈTRES ÉTABLISSEMENT ====================
  { key: 'governance_settings_get', label: 'Consulter paramètres de l\'école', category: 'Système & École', method: 'GET', endpoint: '/api/admin/settings', description: 'Informations juridiques, année scolaire et coordonnées' },
  { key: 'governance_branding_put', label: 'Modifier le branding (palette & logo)', category: 'Système & École', method: 'PUT', endpoint: '/api/admin/branding', description: 'Personnalisation des couleurs primaires, logos et thèmes' },
  { key: 'governance_rbac_put', label: 'Mettre à jour la matrice RBAC', category: 'Système & École', method: 'PUT', endpoint: '/api/admin/rbac', description: 'Attribution et révocation des privilèges par rôle' },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  Administrateur: RBAC_PERMISSIONS.map(p => p.key),
  Secrétaire: [
    'planning_schedule_get',
    'planning_slots_post',
    'planning_slots_put',
    'planning_rooms_get',
    'planning_classes_get',
    'students_list_get',
    'students_list_post',
    'students_list_put',
    'admissions_candidatures_get',
    'admissions_candidatures_post',
    'admissions_candidatures_patch',
    'finance_transactions_get',
    'finance_transactions_post',
    'hr_attendance_get',
    'hr_attendance_post',
    'communication_notifs_get',
    'communication_notifs_post',
  ],
  Comptable: [
    'finance_transactions_get',
    'finance_transactions_post',
    'finance_transactions_put',
    'finance_transactions_patch',
    'finance_expenses_get',
    'finance_expenses_post',
    'finance_expenses_put',
    'finance_reports_get',
    'finance_relances_post',
    'students_list_get',
    'communication_notifs_get',
  ],
  Enseignant: [
    'pedagogy_grades_get',
    'pedagogy_grades_post',
    'pedagogy_grades_put',
    'planning_schedule_get',
    'communication_notifs_get',
    'communication_chat_post',
  ],
  Vigile: [
    'security_scans_get',
    'security_scans_post',
    'security_patrols_post',
    'hr_attendance_post',
  ],
};

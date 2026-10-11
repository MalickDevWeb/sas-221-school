export const ROUTES = {
  login:       '/login',
  landing:     '/',
  candidature: '/candidature',
  dashboard:   '/dashboard',
  admin: {
    dashboard: '/admin/dashboard',
  },
  student: {
    dashboard: '/etudiant',
    cours:     '/etudiant/cours',
    devoirs:   '/etudiant/devoirs',
    planning:  '/etudiant/planning',
    notes:     '/etudiant/notes',
    tuteur:    '/etudiant/tuteur',
    collaboration: '/etudiant/collaboration',
  },
  vigil: {
    dashboard: '/vigile',
    rondes:    '/vigile/rondes',
    rapports:  '/vigile/rapports',
  },
  professor: {
    dashboard: '/professeur',
  },
  parent: {
    dashboard:      '/parent',
    planning:       '/parent/planning',
    presences:      '/parent/presences',
    notes:          '/parent/notes',
    messages:       '/parent/messages',
    inscrireEnfant: '/parent/inscrire-enfant',
    suiviDossiers:  '/parent/suivi-dossiers',
    paiements:      '/parent/paiements',
    profil:         '/parent/profil',
  },
} as const;


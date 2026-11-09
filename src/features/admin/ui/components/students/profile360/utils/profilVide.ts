/**
 * Profil 360 vide (APP-FE-10) : utilisé quand le dossier réel n'a pas pu être chargé.
 * Remplace le repli vers StudentMockData, qui affichait un dossier inventé comme réel.
 */
export const PROFIL_VIDE = {
  donneesStatus: 'non_disponible',
  admissionDetails: {},
  ueList: [],
  connectionLogs: [],
  activityTrail: [],
  timeline: [],
  payments: [],
  paymentsStatus: 'non_disponible',
  extra: { messages: [] },
} as const;

import { CalendarSlot, UnassignedCourse, ConflictAlert } from './PlanningModels';

export const INITIAL_TEACHERS = [
  { name: 'Dr. Diallo', subjects: ['Béton Armé', 'Résistance des Matériaux', 'Mécanique des Sols'], maxHours: 12 },
  { name: 'Mme. Sow', subjects: ['Machine Learning', 'Algorithmique & Graphes', 'Base de données'], maxHours: 10 },
  { name: 'M. Ndiaye', subjects: ['Construction Métallique', 'Dessin Technique', 'Génie Logiciel'], maxHours: 14 },
  { name: 'Dr. Ndiaye', subjects: ['Algorithmique', 'Base de données', 'Génie Logiciel'], maxHours: 15 },
];

export const INITIAL_ROOMS = [
  { name: 'Salle 1 - Amphi A', building: 'Bâtiment Central', capacity: 150, isAvailable: true },
  { name: 'Salle 2 - Informatique', building: 'Bâtiment B', capacity: 40, isAvailable: true },
  { name: 'Salle 3 - Labo GC', building: 'Bâtiment Central', capacity: 30, isAvailable: true },
];

export const INITIAL_UNASSIGNED: UnassignedCourse[] = [
  {
    id: 'un-1', subject: 'Béton Armé', prof: 'Dr. Diallo', room: 'Salle 1 - Amphi A', classe: 'L2 Génie Civil',
    duration: '2h', faculte: 'Sciences & Techniques', departement: 'Génie Civil', filiere: 'Génie Civil',
    niveau: 'L2', type: 'CM', capacityRequired: 120
  },
  {
    id: 'un-2', subject: 'Machine Learning', prof: 'Mme. Sow', room: 'Salle 3 - Labo GC', classe: 'Master 1 Spécialité IA',
    duration: '2h', faculte: 'Sciences & Techniques', departement: 'Informatique', filiere: 'Intelligence Artificielle',
    niveau: 'M1', type: 'TP', capacityRequired: 25
  },
  {
    id: 'un-3', subject: 'Génie Logiciel', prof: 'Dr. Ndiaye', room: 'Salle 2 - Informatique', classe: 'L3 Informatique',
    duration: '2h', faculte: 'Sciences & Techniques', departement: 'Informatique', filiere: 'Informatique',
    niveau: 'L3', type: 'TD', capacityRequired: 35
  },
];

export const INITIAL_SLOTS: CalendarSlot[] = [
  {
    id: 'slot-1', subject: 'Résistance des Matériaux', prof: 'Dr. Diallo', room: 'Salle 1 - Amphi A',
    classe: 'L2 Génie Civil', day: 'Lundi', slot: '08h - 10h', type: 'CM', faculte: 'Sciences & Techniques',
    departement: 'Génie Civil', filiere: 'Génie Civil', niveau: 'L2', semestre: 'Semestre 1',
    anneeAcademique: '2025-2026', groupe: 'Groupe A', building: 'Bâtiment Central',
    capacityRequired: 110, isPublished: true, weekNumber: 1
  },
  {
    id: 'slot-2', subject: 'Algorithmique & Graphes', prof: 'Mme. Sow', room: 'Salle 2 - Informatique',
    classe: 'Master 1 Spécialité IA', day: 'Mardi', slot: '10h - 12h', type: 'TP', faculte: 'Sciences & Techniques',
    departement: 'Informatique', filiere: 'Intelligence Artificielle', niveau: 'M1', semestre: 'Semestre 1',
    anneeAcademique: '2025-2026', groupe: 'Aucun', building: 'Bâtiment B', capacityRequired: 30, isPublished: true, weekNumber: 1
  }
];

export const INITIAL_CONFLICTS: ConflictAlert[] = [
  {
    id: 'c-1', type: 'Salle',
    message: 'Capacité insuffisante pour L2 Génie Civil en Salle 3 - Labo GC (cap: 30 vs req: 120)',
    timestamp: 'Il y a 5 min', severity: 'high'
  }
];

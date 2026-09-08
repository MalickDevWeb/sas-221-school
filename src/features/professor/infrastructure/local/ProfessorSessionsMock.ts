export const INITIAL_SESSIONS = [
  {
    id: 'p1', nom: 'Algorithmique Avancée', courseId: 'course-1', jour: 'LUN', jourComplet: 'Lundi', dateStr: '06 Juil 2026', heureDebut: '08:00', heureFin: '11:00', heureStr: '08:00 - 11:00', type: 'CM', salle: 'Amphi A', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Analyse de complexité théorique, structures de données avancées, graphes et programmation dynamique.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p2', nom: 'Éthique & Droit Numérique', courseId: 'course-ethique', jour: 'LUN', jourComplet: 'Lundi', dateStr: '06 Juil 2026', heureDebut: '10:00', heureFin: '12:05', heureStr: '10:00 - 12:05', type: 'CM', salle: 'Amphi B', profId: 'usr-prof-other', professeur: 'Dr. Kane', description: "Aspects juridiques des données à caractère personnel, législation cybernétique au Sénégal et éthique des algorithmes.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p3', nom: 'Développement Web Fullstack', courseId: 'course-web', jour: 'LUN', jourComplet: 'Lundi', dateStr: '06 Juil 2026', heureDebut: '14:00', heureFin: '16:00', heureStr: '14:00 - 16:00', type: 'TP', salle: 'Labo 10', profId: 'usr-prof-other', professeur: 'M. Malick Teuw', description: "Industrialisation d'une application React avec Vite, typage TypeScript strict, state managers et intégration back-end.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p4', nom: 'Anglais Technique', courseId: 'course-anglais', jour: 'MAR', jourComplet: 'Mardi', dateStr: '07 Juil 2026', heureDebut: '09:00', heureFin: '11:00', heureStr: '09:00 - 11:00', type: 'TD', salle: 'Salle 301', profId: 'usr-prof-other', professeur: 'Mrs. Ndiaye', description: "Lecture de documentations techniques en anglais informatique, rédaction de cahiers des charges et pitch de projets innovants.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p5', nom: 'Intelligence Artificielle', courseId: 'course-ia', jour: 'MAR', jourComplet: 'Mardi', dateStr: '07 Juil 2026', heureDebut: '13:00', heureFin: '16:00', heureStr: '13:00 - 16:00', type: 'CM', salle: 'Amphi A', profId: 'usr-prof-other', professeur: 'Prof. Sy', description: "Modélisation de réseaux neuronaux, apprentissage machine non-supervisé et applications du TAL.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p6', nom: 'Architecture Réseaux', courseId: 'course-reseaux', jour: 'MER', jourComplet: 'Mercredi', dateStr: '08 Juil 2026', heureDebut: '08:00', heureFin: '11:00', heureStr: '08:00 - 11:00', type: 'TP', salle: 'Labo 204', profId: 'usr-prof-other', professeur: 'M. Diop', description: "Modélisation de topologies physiques et virtuelles, routage dynamique, VPN IPSec et pare-feux de nouvelle génération.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p7', nom: 'Base de Données SQL', courseId: 'course-sql', jour: 'JEU', jourComplet: 'Jeudi', dateStr: '09 Juil 2026', heureDebut: '13:00', heureFin: '15:00', heureStr: '13:00 - 15:00', type: 'TD', salle: 'Salle 205', profId: 'usr-prof-other', professeur: 'Mme. Sow', description: "Modélisation relationnelle de données, algèbre relationnelle complexe et optimisation de requêtes d'agrégation SQL.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p8', nom: 'Cybersécurité', courseId: 'course-4', jour: 'JEU', jourComplet: 'Jeudi', dateStr: '09 Juil 2026', heureDebut: '15:00', heureFin: '17:00', heureStr: '15:00 - 17:00', type: 'CM', salle: 'Amphi C', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Analyse des vulnérabilités logicielles communes (OWASP Top 10), cryptographie asymétrique et réponse de crise cyber.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p9', nom: 'Mathématiques Appliquées', courseId: 'course-maths', jour: 'VEN', jourComplet: 'Vendredi', dateStr: '10 Juil 2026', heureDebut: '08:00', heureFin: '10:00', heureStr: '08:00 - 10:00', type: 'TD', salle: 'Salle 102', profId: 'usr-prof-other', professeur: 'Prof. Ba', description: "Probabilités discrètes et de Poisson, algèbre linéaire numérique, vecteurs propres et valeurs singulières appliquées au traitement du signal.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p10', nom: "Systèmes d'Exploitation", courseId: 'course-os', jour: 'VEN', jourComplet: 'Vendredi', dateStr: '10 Juil 2026', heureDebut: '10:00', heureFin: '12:00', heureStr: '10:00 - 12:00', type: 'TP', salle: 'Salle Info 4', profId: 'usr-prof-other', professeur: 'M. Sene', description: "Concurrence de processus, sémaphores de Dijkstra, gestion de la mémoire paginée et programmation système Bash/C.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p11', nom: 'TD Algorithmique Avancée', courseId: 'course-1', jour: 'MER', jourComplet: 'Mercredi', dateStr: '08 Juil 2026', heureDebut: '10:00', heureFin: '12:00', heureStr: '10:00 - 12:00', type: 'TD', salle: 'Labo 5', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Séance pratique d'exercices sur la complexité et les tris.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p-wed-12-14', nom: 'TD Algorithmique Avancée', courseId: 'course-1', jour: 'MER', jourComplet: 'Mercredi', dateStr: '08 Juil 2026', heureDebut: '12:00', heureFin: '14:00', heureStr: '12:00 - 14:00', type: 'TD', salle: 'Labo 5', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Séance pratique d'exercices de niveau avancé sur la complexité et les tris.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p-wed-17-20', nom: "Sécurité des Systèmes d'Information", courseId: 'course-4', jour: 'MER', jourComplet: 'Mercredi', dateStr: '08 Juil 2026', heureDebut: '17:00', heureFin: '20:00', heureStr: '17:00 - 20:00', type: 'CM', salle: 'Amphi B', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Introduction aux concepts de cryptographie, modélisation de menaces et protocoles de communication sécurisés.", status: 'a_venir', cancellationReason: ''
  },
  {
    id: 'p-past-1', nom: 'Algorithmique Avancée (Ancien)', courseId: 'course-1', jour: 'LUN', jourComplet: 'Lundi', dateStr: '29 Juin 2026', heureDebut: '08:00', heureFin: '10:00', heureStr: '08:00 - 10:00', type: 'CM', salle: 'Amphi A', profId: 'usr-prof-01', professeur: 'Dr. Cheikh Anta', description: "Analyse de complexité théorique, structures de données avancées.", status: 'non_fait', cancellationReason: ''
  }
];

export const COURSE_CLASS_MAP: Record<string, string> = {
  'course-1': 'L2 CM',
  'course-4': 'L3 Développement Web',
  'course-2': 'Master IA',
  'course-5': 'L1 Développement Web',
};

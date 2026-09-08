import type { 
  ProfessorCourse, 
  StudentEnrolled, 
  StudentGrade, 
  ProfessorHomework, 
  ProfessorSchedule, 
  ClassroomReminder,
  ProfessorLesson,
  CourseModule,
  CourseQuiz,
  QuizQuestion
} from '../../domain/ProfessorModels';

export const DEFAULT_MODULES: CourseModule[] = [
  // Course-4 modules
  { id: 'mod-1', courseId: 'course-4', title: 'Module 1 : Cryptographie Symétrique & Fondamentaux', description: 'Concepts théoriques, chiffrement symétrique par blocs, attaques et parades.' },
  { id: 'mod-2', courseId: 'course-4', title: 'Module 2 : Sécurité Réseau & Handshake TLS', description: 'Protocoles SSL/TLS, certificats, chiffrement asymétrique et sécurisation des canaux.' },
  { id: 'mod-3', courseId: 'course-4', title: 'Module 3 : Firewalls, IDS & Contrôle d\'Accès', description: 'Mise en place de pare-feux, détection des intrusions et filtrage réseau.' },

  // Course-1 modules
  { id: 'mod-4', courseId: 'course-1', title: 'Module 1 : Analyse de Complexité & Notations Asymptotiques', description: 'Modélisation du temps d\'exécution, borne supérieure et calcul de complexité.' },
  { id: 'mod-5', courseId: 'course-1', title: 'Module 2 : Algorithmes Diviser pour Régner', description: 'Application au tri rapide, fusion et multiplication matricielle de Strassen.' },
  { id: 'mod-6', courseId: 'course-1', title: 'Module 3 : Programmation Dynamique', description: 'Principe d\'optimalité, mémoisation, problème du sac à dos et alignement de séquences.' },
];

export const DEFAULT_QUIZZES: CourseQuiz[] = [
  {
    id: 'quiz-1',
    moduleId: 'mod-1',
    title: 'Quiz 1 : Algorithmes AES & Modes d\'Opération',
    description: 'Vérification de vos connaissances sur les cycles d\'AES et l\'usage des IV dans les différents modes (CBC, GCM).',
    questions: [
      {
        id: 'q1',
        questionText: 'Combien de rounds (cycles) comporte le chiffrement AES-128 ?',
        options: ['10 rounds', '12 rounds', '14 rounds', '16 rounds'],
        correctAnswerIndex: 0
      },
      {
        id: 'q2',
        questionText: 'Quel mode de chiffrement de bloc intègre nativement l\'authentification (AEAD) ?',
        options: ['ECB', 'CBC', 'GCM', 'OFB'],
        correctAnswerIndex: 2
      },
      {
        id: 'q3',
        questionText: 'Pourquoi le mode ECB est-il considéré comme non sécurisé ?',
        options: [
          'Il est trop lent',
          'Il produit le même bloc chiffré pour des blocs de texte en clair identiques',
          'Il nécessite une clé de 1024 bits',
          'Il corrompt facilement les données'
        ],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    id: 'quiz-2',
    moduleId: 'mod-4',
    title: 'Quiz d\'évaluation : Complexité & Grand O',
    description: 'Testez votre compréhension de la notation Grand O et de la récurrence.',
    questions: [
      {
        id: 'q4',
        questionText: 'Quelle est la complexité du pire des cas pour la recherche binaire dans un tableau trié ?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctAnswerIndex: 1
      },
      {
        id: 'q5',
        questionText: 'Selon le théorème maître (Master Theorem), si T(N) = 2T(N/2) + O(N), quelle est la complexité ?',
        options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(log N)'],
        correctAnswerIndex: 1
      }
    ]
  }
];

export const DEFAULT_LESSONS: ProfessorLesson[] = [
  {
    id: 'les-1',
    courseId: 'course-4',
    moduleId: 'mod-1',
    title: "Chapitre 1 : Introduction à la Cryptographie Symétrique",
    description: "Concepts de base de la cryptographie symétrique, algorithme AES, chiffrement par bloc et modes d'opération (CBC, GCM).",
    dateStr: "Publié le 15 Juin 2026",
    attachmentName: "Cours_Crypto_Symetrique.pdf",
    attachmentUrl: "#"
  },
  {
    id: 'les-2',
    courseId: 'course-4',
    moduleId: 'mod-2',
    title: "Chapitre 2 : Protocoles Réseau Sécurisés (TLS/SSL)",
    description: "Analyse détaillée du handshake TLS 1.3, certificats X.509, autorités de certification et sécurité de la couche transport.",
    dateStr: "Publié le 22 Juin 2026",
    attachmentName: "TP_TLS_Handshake_Wireshark.pdf",
    attachmentUrl: "#"
  },
  {
    id: 'les-3',
    courseId: 'course-1',
    moduleId: 'mod-4',
    title: "Chapitre 1 : Complexité Algorithmique et Grand O",
    description: "Définition formelle des notations asymptotiques (O, Omega, Theta), techniques de calcul de complexité temporelle et spatiale.",
    dateStr: "Publié le 10 Juin 2026",
    attachmentName: "Complexite_Cours_1.pdf",
    attachmentUrl: "#"
  }
];

export const DEFAULT_REMINDERS: ClassroomReminder[] = [
  {
    id: 'rem-1',
    courseId: 'course-1',
    content: "Rappel : Le projet final sur la programmation dynamique doit être soumis avant lundi matin 8h00.",
    dateStr: "Aujourd'hui à 09:30",
    isUrgent: true
  },
  {
    id: 'rem-2',
    courseId: 'course-4',
    content: "N'oubliez pas d'installer le simulateur de firewall Wireshark avant la séance de TP de mardi.",
    dateStr: "Hier",
    isUrgent: false
  }
];

export const MOCK_COURSES_TEACHER_1: ProfessorCourse[] = [
  {
    id: 'course-4',
    titre: "Sécurité des Systèmes d'Information",
    coefficient: 4,
    progress: 10,
    unites: ['Cryptographie', 'Firewalls', 'Conformité'],
    prochainCours: 'Mardi à 13h00',
    salle: 'Amphi B',
    classe: 'L3 Développement Web'
  },
  {
    id: 'course-1',
    titre: 'Algorithmique Avancée & Complexité',
    coefficient: 5,
    progress: 80,
    unites: ['Graphes', 'Programmation Dynamique', 'Complexité'],
    prochainCours: 'Lundi à 08h00',
    salle: 'Amphi A',
    classe: 'L2 CM'
  }
];

export const MOCK_COURSES_TEACHER_2: ProfessorCourse[] = [
  {
    id: 'course-5',
    titre: 'Prise de Parole en Public',
    coefficient: 3,
    progress: 100,
    unites: ['Expression Orale', 'Gestion du Trac', 'Pitch commercial'],
    prochainCours: 'Jeudi à 10h00',
    salle: 'Salle Rethorique 1',
    classe: 'L1 Développement Web'
  },
  {
    id: 'course-2',
    titre: 'Management Stratégique II',
    coefficient: 4,
    progress: 40,
    unites: ['Gouvernance', 'Analyse Globale', 'Cas d\'études'],
    prochainCours: 'Mardi à 09h00',
    salle: 'Salle de séminaire C',
    classe: 'Master IA'
  }
];

export const MOCK_STUDENTS: StudentEnrolled[] = [
  { id: 'usr-etudiant-01', nom: 'Diop', prenom: 'Assane', email: 'etudiant221@gmail.com', matricule: '221-E001' },
  { id: 'usr-etudiant-02', nom: 'Sow', prenom: 'Fatou', email: 'etudiant222@gmail.com', matricule: '221-E002' },
  { id: 'usr-etudiant-03', nom: 'Ndiaye', prenom: 'Malick', email: 'etudiant223@gmail.com', matricule: '221-E003' },
];

export const DEFAULT_GRADES: StudentGrade[] = [
  // Sécurité des Systèmes d'Information
  { id: 'gr-1', studentId: 'usr-etudiant-01', studentNom: 'Assane Diop', courseId: 'course-4', cc: 14, examen: 12, finalGrade: 12.8, status: 'Validé' },
  { id: 'gr-2', studentId: 'usr-etudiant-02', studentNom: 'Fatou Sow', courseId: 'course-4', cc: 11, examen: 9, finalGrade: 9.8, status: 'Rattrapage' },
  { id: 'gr-3', studentId: 'usr-etudiant-03', studentNom: 'Malick Ndiaye', courseId: 'course-4', cc: 16, examen: 15, finalGrade: 15.4, status: 'Validé' },

  // Algorithmique Avancée & Complexité
  { id: 'gr-4', studentId: 'usr-etudiant-01', studentNom: 'Assane Diop', courseId: 'course-1', cc: 15, examen: 16, finalGrade: 15.6, status: 'Validé' },
  { id: 'gr-5', studentId: 'usr-etudiant-02', studentNom: 'Fatou Sow', courseId: 'course-1', cc: 10, examen: 8, finalGrade: 8.8, status: 'Rattrapage' },
  { id: 'gr-6', studentId: 'usr-etudiant-03', studentNom: 'Malick Ndiaye', courseId: 'course-1', cc: 18, examen: 17, finalGrade: 17.4, status: 'Validé' },

  // Prise de Parole en Public
  { id: 'gr-7', studentId: 'usr-etudiant-01', studentNom: 'Assane Diop', courseId: 'course-5', cc: 18, examen: 19, finalGrade: 18.6, status: 'Validé' },
  { id: 'gr-8', studentId: 'usr-etudiant-02', studentNom: 'Fatou Sow', courseId: 'course-5', cc: 14, examen: 15, finalGrade: 14.6, status: 'Validé' },
  { id: 'gr-9', studentId: 'usr-etudiant-03', studentNom: 'Malick Ndiaye', courseId: 'course-5', cc: 12, examen: 11, finalGrade: 11.4, status: 'Validé' },
];

export const DEFAULT_HOMEWORKS: ProfessorHomework[] = [
  { id: 'hw-1', titre: 'Analyse d\'une faille Heartbleed', courseId: 'course-4', courseLabel: 'Sécurité', desc: 'Rédiger un rapport d\'analyse détaillé de la vulnérabilité Heartbleed OpenSSL avec des contre-mesures.', prio: 'haute', deadlineStr: 'Dans 3 jours', submissionsCount: 2 },
  { id: 'hw-2', titre: 'Implémentation de Dijkstra en Go', courseId: 'course-1', courseLabel: 'Algo', desc: 'Développer un algorithme de recherche du plus court chemin optimisé en utilisant des structures de tas binaires.', prio: 'normale', deadlineStr: 'Dans 5 jours', submissionsCount: 3 },
  { id: 'hw-3', titre: 'Préparation du Pitch de Projet L3', courseId: 'course-5', courseLabel: 'Speech', desc: 'Présenter une vidéo de 3 minutes décrivant votre concept innovant pour l\'incubateur de l\'école.', prio: 'haute', deadlineStr: 'Dans 1 jour', submissionsCount: 1 }
];

export const MOCK_SCHEDULE_T1: ProfessorSchedule[] = [
  { id: 'sch-1', courseId: 'course-1', courseTitle: 'Algorithmique Avancée', day: 'Lundi', time: '08:00 - 11:00', room: 'Amphi A', type: 'CM', dateStr: 'Lundi 06 Juillet 2026', classe: 'L2 CM' },
  { id: 'sch-2', courseId: 'course-4', courseTitle: "Sécurité des Systèmes d'Information", day: 'Mardi', time: '13:00 - 16:00', room: 'Amphi B', type: 'CM', dateStr: 'Mardi 07 Juillet 2026', classe: 'L3 Développement Web' },
  { id: 'sch-3', courseId: 'course-1', courseTitle: 'TD Algorithmique Avancée', day: 'Mercredi', time: '10:00 - 12:00', room: 'Labo 5', type: 'TD', dateStr: 'Mercredi 08 Juillet 2026', classe: 'L2 CM' },
  { id: 'sch-wed-1', courseId: 'course-1', courseTitle: 'TD Algorithmique Avancée', day: 'Mercredi', time: '12:00 - 14:00', room: 'Labo 5', type: 'TD', dateStr: 'Mercredi 08 Juillet 2026', classe: 'L2 CM' },
  { id: 'sch-wed-2', courseId: 'course-4', courseTitle: "Sécurité des Systèmes d'Information", day: 'Mercredi', time: '17:00 - 20:00', room: 'Amphi B', type: 'CM', dateStr: 'Mercredi 08 Juillet 2026', classe: 'L3 Développement Web' },
];

export const MOCK_SCHEDULE_T2: ProfessorSchedule[] = [
  { id: 'sch-4', courseId: 'course-2', courseTitle: 'Management Stratégique II', day: 'Mardi', time: '09:00 - 12:00', room: 'Salle C', type: 'CM', dateStr: 'Mardi 07 Juillet 2026', classe: 'Master IA' },
  { id: 'sch-5', courseId: 'course-5', courseTitle: 'Prise de Parole en Public', day: 'Jeudi', time: '10:00 - 13:00', room: 'Salle Rethorique 1', type: 'CM', dateStr: 'Jeudi 09 Juillet 2026', classe: 'L1 Développement Web' },
];

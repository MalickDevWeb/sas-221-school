export interface CoursItem {
  id: string;
  jour: string; 
  nom: string;
  heure: string;
  salle: string;
  professeur: string;
  description: string;
  type: 'CM' | 'TP' | 'TD';
  enCours?: boolean;
}

export interface DbProfile {
  id: string;
  name: string;
  matricule: string;
  promotion: string;
  gpa: string;
}

export interface Attendance {
  id: string;
  timestamp: string;
  type: string;
  method: string;
  status: string;
  salle: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isTeacher: boolean;
}

export interface LiveSession {
  id: string;
  courseName: string;
  teacherName: string;
  title: string;
  status: string;
  attendeesCount: number;
  reactions: Record<string, number>;
  chatMessages: ChatMessage[];
}

export interface StudentProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  dateNaissance: string;
  telephone: string;
  adresse: string;
  filiere: string;
  niveau: string;
  photoUrl: string;
}

export interface StudentDashboard {
  totalCredits: number;
  moyenneGenerale: number;
  coursEnCours: number;
  devoirsARendre: number;
  prochainsExamens: {
    id: string;
    titre: string;
    date: string;
    salle: string;
  }[];
  statsPresence: {
    tauxPresence: number;
    present: number;
    absent: number;
    retards: number;
  };
  notifications: {
    id: string;
    titre: string;
    message: string;
    date: string;
    lu: boolean;
  }[];
}

export interface DigitalBadge {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  classe: string;
  qrPayload: string;
  token: string;
  minuteEpoch: number;
  expiresInSeconds: number;
  status: string;
}

export interface PageResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AttendanceDto {
  id: string;
  date: string;
  status: string;
  studentId: string;
  studentName: string;
  courseId: string;
}

export interface LiveSessionDto {
  id: string;
  courseTitle: string;
  professorName: string;
  status: string;
  activeUsers: number;
  link: string;
  time: string;
  reactions: Record<string, number>;
}

export interface GradeDto {
  id: string;
  module: string;
  prof: string;
  ects: number;
  cc: number;
  examen: number;
  moyPromo: number;
}

export interface CourseDto {
  id: string;
  titre: string;
  coefficient: number;
  progress: number;
  statut: string;
  unites: string[];
}

export interface HomeworkDto {
  id: string;
  statut: string;
  titre: string;
  deadline: string;
  prio: string;
  courseId: string;
  desc: string;
  progress: number;
}

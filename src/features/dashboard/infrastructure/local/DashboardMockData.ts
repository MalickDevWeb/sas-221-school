import { LiveSession, PerformanceData } from '../../domain/Dashboard';

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: "live-1",
    courseName: "Architecture Microservices",
    teacherName: "Dr. Aly Diatta",
    title: "Introduction aux patterns CQRS",
    status: "finished",
    attendeesCount: 42,
    reactions: { '👍': 12, '💡': 5 },
    chatMessages: [
      { id: "1", user: "Dr. Aly Diatta", text: "Bienvenue à tous dans cette session.", timestamp: "14:00", isTeacher: true }
    ]
  }
];

export const MOCK_PROFILE = {
  id: "usr-1",
  name: "Abdoulaye Diallo",
  matricule: "SN-2026-8492",
  promotion: "M1 Architecture Logicielle",
  gpa: "3.8/4.0"
};

export const MOCK_PERFORMANCE_DATA: PerformanceData[] = [
  { mois: 'Janvier',  note: 14.2,  presence: 92, promoMoy: 13.8 },
  { mois: 'Février',  note: 15.5,  presence: 95, promoMoy: 13.8 },
  { mois: 'Mars',     note: 16.3,  presence: 98, promoMoy: 13.8 },
  { mois: 'Avril',    note: 15.8,  presence: 94, promoMoy: 13.8 },
  { mois: 'Mai',      note: 16.89, presence: 96, promoMoy: 13.8 }
];

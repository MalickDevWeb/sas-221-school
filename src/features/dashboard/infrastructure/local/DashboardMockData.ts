import { LiveSession } from '../../domain/Dashboard';

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


README Frontend — Module Étudiant (Student)
Ce guide explique comment consommer correctement les endpoints du module Student depuis un frontend.

1) Base URL
Base API: http://localhost:8080/api
Student: http://localhost:8080/api/student
Auth: http://localhost:8080/api/auth
WebSocket (SockJS): http://localhost:8080/api/ws
2) Dépendances frontend recommandées
npm i axios @tanstack/react-query
WebSocket (sessions live) :

npm i @stomp/stompjs sockjs-client
Option validation :

npm i zod
3) Authentification
3.1 Rôles autorisés
Route	Accès
POST /student/qr-validate	Public (vigile / scanner QR)
Toutes les autres /student/**	ETUDIANT, PROFESSEUR ou ADMIN
3.2 Login étudiant (cookie web)
POST /api/auth/login

Body:

{
  "email": "etudiant221@gmail.com",
  "password": "ecole221"
}
Réponse: infos utilisateur + cookie auth_token HTTP-only.

3.3 Login token (API / Swagger / mobile)
POST /api/auth/login-token

Body:

{
  "email": "etudiant221@gmail.com",
  "password": "ecole221"
}
Réponse:

{
  "token": "<JWT>",
  "role": "ETUDIANT"
}
3.4 Profil auth
GET /api/auth/me — pour vérifier la session avant d’appeler /student/*.

Note backend actuelle : le contrôleur Student lit les données de l’étudiant mock usr-001 (pas encore le user JWT). L’auth sert surtout à autoriser l’accès aux routes.

4) Client HTTP prêt à l’emploi (Axios)
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000,
  withCredentials: true, // cookie web
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
5) Endpoints Student (24 REST)
Profil & dashboard
GET /student/profile
GET /student/dashboard
Badge numérique & QR
GET /student/digital-badge
POST /student/qr-validate (public)
Présences
GET /student/attendances?page=0&size=10
POST /student/attendances
Sessions live
GET /student/live-sessions?page=0&size=10
POST /student/live-sessions/{sessionId}/reaction
GET /student/live-sessions/{sessionId}/chat
POST /student/live-sessions/{sessionId}/chat
GET /student/live-sessions/{sessionId}/chat-history
Notes
GET /student/grades
GET /student/grades/download (PDF)
POST /student/grades/{gradeId}/review
Cours
GET /student/courses
GET /student/courses/{courseId}/details
Devoirs
GET /student/homeworks
POST /student/courses/{courseId}/homeworks/{homeworkId}/submit (multipart)
POST /student/homeworks/{homeworkId}/start
POST /student/homeworks/{homeworkId}/progress
Quiz & tuteur IA
POST /student/courses/{courseId}/quizzes/submit
POST /student/tutor/chat
Emails
POST /student/send-notification
POST /student/request-confirmation
Note: 23 routes sur StudentController + 1 route historique chat sur LiveSessionMessageController.

6) Détail des réponses & payloads
6.1 Profil
GET /student/profile

{
  "id": "usr-001",
  "nom": "Sall",
  "prenom": "Mamadou",
  "email": "etudiant221@gmail.com",
  "matricule": "SN-2026-1234",
  "dateNaissance": "2002-05-12",
  "telephone": "+221771234567",
  "adresse": "...",
  "filiere": "Genie Logiciel",
  "niveau": "Licence 3",
  "photoUrl": "https://..."
}
6.2 Dashboard
GET /student/dashboard

{
  "totalCredits": 60,
  "moyenneGenerale": 14.5,
  "coursEnCours": 5,
  "devoirsARendre": 3,
  "prochainsExamens": [
    { "id": "ex-1", "titre": "Architecture des Microservices", "date": "2026-08-15", "salle": "Amphi A" }
  ],
  "statsPresence": {
    "tauxPresence": 95.0,
    "present": 40,
    "absent": 1,
    "retards": 2
  },
  "notifications": [
    { "id": "n-1", "titre": "Nouveau devoir", "message": "...", "date": "2026-07-30", "lu": false }
  ]
}
6.3 Badge numérique
GET /student/digital-badge

{
  "id": "badge-usr-001",
  "studentId": "usr-001",
  "studentName": "Mamadou Sall",
  "matricule": "SN-2026-1234",
  "classe": "M1 GL",
  "qrPayload": "...",
  "token": "<HMAC>",
  "minuteEpoch": 1234567890,
  "expiresInSeconds": 60,
  "status": "ACTIF"
}
Le token expire chaque minute : rafraîchir le badge côté UI (polling ~50–55 s).

6.4 Validation QR (public — vigile)
POST /student/qr-validate

{
  "matricule": "SN-2026-1234",
  "minuteEpoch": 1234567890,
  "token": "<HMAC scanné>"
}
Réponse:

{
  "valid": true,
  "matricule": "SN-2026-1234",
  "timestamp": "2026-07-30T12:00:00",
  "message": "Badge etudiant verifie avec succes"
}
6.5 Présences (paginé)
GET /student/attendances?page=0&size=10

Réponse PageResponseDto:

{
  "content": [
    {
      "id": "att-123",
      "date": "2026-07-30T08:30:00",
      "status": "PRESENT",
      "studentId": "usr-001",
      "studentName": "Mamadou Sall",
      "courseId": "course-1"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 12,
  "totalPages": 2,
  "last": false
}
6.6 Auto check-in
POST /student/attendances

{
  "type": "PRESENT",
  "method": "QR"
}
Champ	Valeurs
type	PRESENT, ABSENT, LATE, EXCUSED, UNKNOWN (alias COURS / COURSE → PRESENT)
method	ex. QR, GPS, MANUAL
Réponse:

{
  "success": true,
  "attendanceId": "att-1234",
  "timestamp": "2026-07-30T08:31:00",
  "status": "VALIDATED"
}
6.7 Sessions live (paginé)
GET /student/live-sessions?page=0&size=10

{
  "content": [
    {
      "id": "sess-1",
      "courseTitle": "Architecture Hexagonale",
      "professorName": "Dr. Aly Diatta",
      "status": "ACTIVE",
      "activeUsers": 24,
      "link": "https://...",
      "time": "08:30",
      "reactions": { "LIKE": 5, "CLAP": 2 }
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
6.8 Réaction live (REST)
POST /student/live-sessions/{sessionId}/reaction

{
  "type": "LIKE"
}
Types: LIKE, HEART, CLAP, QUESTION, CONFUSED, THUMBS_UP, THUMBS_DOWN.

Réponse:

{
  "success": true,
  "sessionId": "sess-1",
  "reaction": "LIKE"
}
6.9 Chat live (REST)
GET /student/live-sessions/{sessionId}/chat
GET /student/live-sessions/{sessionId}/chat-history — historique persisté à la reconnexion.

POST /student/live-sessions/{sessionId}/chat

{
  "user": "Mamadou Sall",
  "text": "Question sur le chapitre 1"
}
Réponse:

{
  "success": true,
  "id": "msg-1720000000000"
}
6.10 Notes
GET /student/grades

[
  {
    "id": "g1",
    "module": "Architecture Hexagonale",
    "prof": "Dr. Aly Diatta",
    "ects": 6,
    "cc": 16.5,
    "examen": 18.0,
    "moyPromo": 13.5
  }
]
Formule côté UI (aussi utilisée pour le PDF) :

Note finale = cc * 0.4 + examen * 0.6
Validé si note finale ≥ 10
6.11 Télécharger le relevé PDF
GET /student/grades/download

const res = await api.get('/student/grades/download', { responseType: 'blob' });
const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
// déclencher un <a download="releve_notes_officiel_ecole221_S2.pdf">
Headers réponse: Content-Type: application/pdf, Content-Disposition: attachment; filename="releve_notes_officiel_ecole221_S2.pdf".

6.12 Demande de révision de note
POST /student/grades/{gradeId}/review

{
  "reason": "Erreur de calcul sur le contrôle continu du 12/06"
}
Contraintes: reason entre 10 et 500 caractères.

Réponse:

{
  "success": true,
  "gradeId": "g1",
  "reason": "Erreur de calcul...",
  "status": "PENDING_REVIEW"
}
6.13 Cours
GET /student/courses

[
  {
    "id": "course-1",
    "titre": "Architecture des Microservices",
    "coefficient": 3,
    "progress": 42,
    "statut": "EN_COURS",
    "unites": ["Intro", "Patterns", "Déploiement"]
  }
]
Statuts: EN_COURS, TERMINE, A_COMMENCER, ABANDONNE.

GET /student/courses/{courseId}/details — objet libre (JSONB). IDs acceptés: course-1 ou legacy c-1.
404 si cours inconnu.

6.14 Devoirs
GET /student/homeworks

[
  {
    "id": "hw-001",
    "statut": "a_rendre",
    "titre": "TP Docker",
    "deadline": "2026-08-01",
    "prio": "haute",
    "courseId": "course-1",
    "desc": "Containeriser une API Spring",
    "progress": 50
  }
]
Soumettre un fichier (multipart) :

POST /student/courses/{courseId}/homeworks/{homeworkId}/submit

const form = new FormData();
form.append('file', file); // champ obligatoire: "file"
await api.post(`/student/courses/${courseId}/homeworks/${homeworkId}/submit`, form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
Réponse:

{
  "success": true,
  "homeworkId": "hw-001",
  "fileName": "tp-docker.zip",
  "size": 20480,
  "status": "Soumis"
}
Démarrer / progression :

POST /student/homeworks/{homeworkId}/start
POST /student/homeworks/{homeworkId}/progress
Content-Type: application/json

{ "addedProgress": 10 }
6.15 Quiz
POST /student/courses/{courseId}/quizzes/submit

{
  "answers": [
    { "selectedOption": 1, "correctOption": 1 },
    { "selectedOption": 0, "correctOption": 2 }
  ]
}
Réponse:

{
  "success": true,
  "courseId": "course-1",
  "score": 1,
  "total": 2,
  "message": "Quiz evalue avec succes par le serveur !"
}
6.16 Tuteur IA
POST /student/tutor/chat

{
  "message": "Explique-moi l'architecture hexagonale"
}
Réponse:

{
  "text": "...",
  "provider": "openai|...",
  "available": true
}
6.17 Notifications email
POST /student/send-notification

{
  "to": "etudiant221@gmail.com",
  "subject": "Rappel devoir",
  "content": "Le TP Docker est à rendre demain."
}
POST /student/request-confirmation

{
  "to": "etudiant221@gmail.com",
  "type": "inscription",
  "data": { "nom": "Sall", "filiere": "GL" }
}
7) WebSocket — chat & réactions live (temps réel)
Endpoint SockJS: http://localhost:8080/api/ws

Action	Destination client → serveur	Broadcast serveur → clients
Chat	/app/live-sessions/{sessionId}/chat	/topic/live-sessions/{sessionId}/chat
Réaction	/app/live-sessions/{sessionId}/reaction	/topic/live-sessions/{sessionId}/reaction
Payload chat recommandé:

{
  "senderId": "usr-001",
  "senderName": "Mamadou Sall",
  "content": "Bonjour"
}
Exemple minimal STOMP:

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/api/ws'),
  onConnect: () => {
    client.subscribe('/topic/live-sessions/sess-1/chat', (msg) => {
      console.log(JSON.parse(msg.body));
    });
    client.publish({
      destination: '/app/live-sessions/sess-1/chat',
      body: JSON.stringify({
        senderId: 'usr-001',
        senderName: 'Mamadou Sall',
        content: 'Hello live',
      }),
    });
  },
});
client.activate();
Flux recommandé UI live:

GET /student/live-sessions → lister les sessions
GET /student/live-sessions/{id}/chat-history → historique
Connecter STOMP → s’abonner aux topics
Envoyer messages / réactions via STOMP (ou REST en fallback)
8) Gestion des erreurs côté frontend
200/201: succès
400: payload invalide (validation @Valid, multipart sans file, reason trop court, etc.)
401: non authentifié (token/cookie absent ou expiré)
403: rôle non autorisé (ex. route student sans ETUDIANT/PROF/ADMIN)
404: ressource absente (ex. courseId inconnu)
500: erreur serveur
Exemple:

try {
  const { data } = await api.get('/student/dashboard');
  return data;
} catch (e: any) {
  const status = e?.response?.status;
  const message = e?.response?.data?.message || 'Erreur inconnue';
  throw new Error(`[${status}] ${message}`);
}
9) Contrat d’intégration frontend
Se connecter via /auth/login ou /auth/login-token avant les routes protégées.
Mode token: Authorization: Bearer <JWT>.
Mode cookie web: withCredentials: true.
JSON: Content-Type: application/json (sauf submit devoir → multipart/form-data).
PDF notes: responseType: 'blob'.
Badge QR: rafraîchir avant expiration (60 s).
Live: historique REST + temps réel STOMP.
Gérer explicitement 401/403/404/500 dans l’UI.
10) Checklist rapide
Login OK (/auth/login-token avec etudiant221@gmail.com)
GET /auth/me retourne le profil auth
GET /student/profile → 200
GET /student/dashboard → 200
GET /student/digital-badge → token + minuteEpoch
POST /student/qr-validate (sans auth) avec badge frais → valid: true
GET /student/attendances paginé OK
POST /student/attendances check-in OK
GET /student/grades + GET /student/grades/download (PDF)
GET /student/courses + details
GET /student/homeworks + submit multipart
GET /student/live-sessions + chat-history + STOMP
Compte de test étudiant: etudiant221@gmail.com / ecole221
Rôles acceptés sur /student/**: ETUDIANT, PROFESSEUR, ADMIN
Route publique: POST /student/qr-validate

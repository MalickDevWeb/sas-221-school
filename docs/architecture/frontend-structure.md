# Structure du Frontend — Écoles 221

## Arborescence complète

```
frontend/src/
│
├── core/                        → Initialisation globale de l'app
│   ├── firebase/
│   │   └── firebase.ts          → Firebase App (Google Auth uniquement)
│   ├── router/                  → React Router (routes & guards)
│   └── store/
│       └── authStore.ts         → Store Zustand (session utilisateur)
│
├── shared/                      → Éléments partagés entre tous les modules
│   ├── lib/
│   │   ├── apiClient.ts         ← ⭐ CLIENT HTTP PRINCIPAL (Axios + JWT interceptor)
│   │   ├── googleAuth.ts        → Connexion Google OAuth (Firebase Auth)
│   │   └── firebaseRealtime.ts  → (simulacre local, plus utilisé en prod)
│   ├── components/              → Composants UI génériques (Button, Modal...)
│   ├── constants/               → Routes, constantes globales
│   ├── hooks/                   → Hooks génériques (useDebounce, etc.)
│   ├── design/                  → Tokens CSS, reset, design system
│   └── utils/                   → Fonctions utilitaires pures
│
└── features/                    → Un dossier par module métier
    ├── auth/
    │   ├── infrastructure/api/
    │   │   └── authService.ts   ← ⭐ POST /auth/login, GET /auth/me
    │   └── hooks/
    │       └── useCandidatureSettings.ts
    │
    ├── dashboard/
    │   ├── infrastructure/api/
    │   │   └── dashboardService.ts  ← ⭐ 22 endpoints KPIs, Alertes, Stats
    │   └── ui/components/
    │       └── AdminCEODashboard.tsx  ← Branché sur l'API réelle
    │
    ├── collaboration/
    │   ├── infrastructure/
    │   │   ├── groupChatService.ts   ← ⭐ 26 endpoints chat & fichiers
    │   │   ├── voiceSessionService.ts
    │   │   ├── groupService.ts
    │   │   ├── collabWebSocket.ts    ← ⭐ Client STOMP/SockJS
    │   │   ├── wikiSaver.ts          → Sauvegarde Wiki via API
    │   │   └── wikiSubscriber.ts     → Lecture Wiki via polling API
    │   └── hooks/
    │       └── useGroupWorkspaceState.ts  ← Hybride API + WebSocket
    │
    ├── notifications/
    │   └── infrastructure/
    │       └── firebase/
    │           └── FirebaseNotificationRepository.ts  ← ⭐ Polling API (plus Firebase)
    │
    └── admin/
        └── ui/components/
            └── AdminAdmissionConfig.tsx  ← Branché sur /admin/candidatures/settings
```

## Conventions de nommage

| Type | Convention | Exemple |
|---|---|---|
| Service API | `*Service.ts` | `authService.ts` |
| Hook React | `use*.ts` | `useGroupWorkspaceState.ts` |
| Composant | `PascalCase.tsx` | `AdminCEODashboard.tsx` |
| Store | `*Store.ts` | `authStore.ts` |
| Modèles de domaine | `*Models.ts` | `CollaborationModels.ts` |

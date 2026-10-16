# Architecture Globale — Écoles 221

## Stack Technique

| Couche | Technologie | Port |
|---|---|---|
| **Frontend** | React 18 + Vite + TypeScript | `5173` |
| **Backend** | Spring Boot (Java) | `8080` |
| **Cache / Pub-Sub** | Redis | `6379` |
| **Base de données** | PostgreSQL | `5432` |
| **Temps réel** | STOMP over WebSocket (SockJS) | via `/api/ws` |

---

## Schéma de Communication

```
Navigateur (React)
       │
       │  HTTP/REST → /api/*  (Vite proxy redirige vers :8080)
       │  WebSocket → /api/ws (STOMP/SockJS)
       ▼
Spring Boot :8080
       │
       ├─── PostgreSQL (données persistantes)
       └─── Redis      (cache, sessions, Pub-Sub temps réel)
```

> ❌ **Aucune dépendance Firebase Firestore** — toute la communication passe par Spring Boot.
> ✅ **Firebase Auth** reste uniquement pour la connexion via Google OAuth (Google Calendar / Meet scopes).

---

## Principes Architecturaux Frontend

Le frontend suit une **architecture par feature (feature-based)** :

```
src/features/<nom-du-module>/
  ├── domain/          → Interfaces TypeScript (contrats de données)
  ├── infrastructure/  → Services API (appels HTTP via apiClient)
  │   ├── api/         → Fichiers *Service.ts (endpoints REST)
  │   └── local/       → Fallback localStorage
  ├── hooks/           → Logique d'état React (useXxx.ts)
  └── ui/              → Composants React (.tsx)
```

### Modules existants

| Module | Rôle |
|---|---|
| `auth` | Connexion, session, candidatures |
| `dashboard` | KPIs, alertes, activités, stats |
| `collaboration` | Chat de groupe, Wiki, sessions vocales |
| `admin` | Gestion école, personnel, finances, admissions |
| `student` | Tableau de bord étudiant, notes, emploi du temps |
| `professor` | Interface professeur |
| `notifications` | Centre de notifications |
| `schedule` | Emploi du temps |
| `courses` | Cours et ressources |
| `grades` | Notes et résultats |
| `vigil` | Contrôle d'accès / QR Code |
| `screenguard` | Gestion des appareils / responsive |

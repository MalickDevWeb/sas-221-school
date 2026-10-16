# Écoles 221 — Documentation du Projet

Bienvenue dans la documentation de référence du projet **Écoles 221**.
Ce dossier `docs/` est le point d'entrée unique pour comprendre, configurer et contribuer au projet.

---

## 📁 Structure de ce dossier

```
docs/
├── README.md                   ← Ce fichier (index général)
├── architecture/
│   ├── overview.md             ← Vue d'ensemble de l'architecture
│   └── frontend-structure.md  ← Arborescence et conventions du frontend
├── api/
│   ├── auth.md                 ← Endpoints Auth & Login
│   ├── dashboard.md            ← Endpoints Dashboard (KPIs, Alertes, Activités)
│   └── collaboration.md        ← Endpoints Collaboration (Chat, Wiki, Voix, WebSocket)
└── config/
    ├── environment.md          ← Variables d'environnement (.env)
    ├── proxy-vite.md           ← Configuration du proxy Vite → Spring Boot
    └── websocket.md            ← Configuration STOMP/SockJS
```

---

## 🚀 Démarrage rapide

```bash
# 1. Backend Spring Boot (port 8080)
cd backend
# Lancer avec Maven ou votre IDE Java

# 2. Frontend React/Vite (port 5173)
cd frontend
npm install
npm run dev

# L'app est dispo sur : http://localhost:5173
# Le backend est dispo sur : http://localhost:8080
```

---

## 🔗 Liens rapides

| Sujet | Fichier |
|---|---|
| Variables d'environnement | [config/environment.md](./config/environment.md) |
| Architecture globale | [architecture/overview.md](./architecture/overview.md) |
| API Auth & Dashboard | [api/auth.md](./api/auth.md) |
| API Collaboration & Chat | [api/collaboration.md](./api/collaboration.md) |
| WebSocket STOMP | [config/websocket.md](./config/websocket.md) |
| Proxy Vite | [config/proxy-vite.md](./config/proxy-vite.md) |

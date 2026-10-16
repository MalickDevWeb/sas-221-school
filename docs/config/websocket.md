# WebSocket STOMP / SockJS

## Vue d'ensemble

Le temps réel (chat de groupe, mise à jour du Wiki) utilise le protocole **STOMP** transporté sur **WebSocket** (avec SockJS comme fallback).

| Élément | Valeur |
|---|---|
| Endpoint de connexion | `http://localhost:8080/api/ws` |
| Protocol | STOMP over WebSocket / SockJS |
| Bibliothèques | `@stomp/stompjs` + `sockjs-client` |
| Fichier client | `src/features/collaboration/infrastructure/collabWebSocket.ts` |

---

## Architecture des canaux (Topics)

### Abonnements (écouter les messages entrants)

| Topic | Description |
|---|---|
| `/topic/collaboration` | Messages du chat de groupe général |
| `/topic/group/{groupId}` | Messages d'un groupe spécifique |
| `/topic/wiki.update` | Mises à jour du Wiki collaboratif |
| `/topic/wiki.note.update` | Mises à jour des notes collaboratives |

### Envoi (envoyer des messages vers le serveur)

| Destination | Description |
|---|---|
| `/app/chat.send` | Envoyer un message dans le chat |
| `/app/wiki.update` | Sauvegarder une page Wiki |
| `/app/wiki.note.update` | Sauvegarder une note |

---

## Utilisation dans le code

### Se connecter et s'abonner

```typescript
import { collabSocket } from '@/features/collaboration/infrastructure/collabWebSocket';

// Connexion + abonnement à un groupe
collabSocket.connect(groupId, (message) => {
  console.log('Nouveau message reçu:', message);
});

// Déconnexion (dans le cleanup useEffect)
collabSocket.disconnect();
```

### Envoyer un message

```typescript
collabSocket.sendMessage('/app/chat.send', {
  content: 'Bonjour !',
  groupId: 'groupe-123',
});
```

---

## Authentification WebSocket

La connexion STOMP envoie le JWT dans les headers STOMP (pas HTTP) :

```typescript
const headers = {
  Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
};
client.connectHeaders = headers;
```

---

## Fix SockJS dans Vite

SockJS a été écrit pour Node.js et utilise `global` qui n'existe pas dans un navigateur.
Le fix est dans `vite.config.ts` :

```typescript
define: {
  global: 'globalThis',
}
```

Sans ce fix, vous obtenez : `Uncaught ReferenceError: global is not defined`

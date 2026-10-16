# API Collaboration — Chat, Wiki, Voix

Base URL : `http://localhost:8080/api`

Fichiers services :
- `src/features/collaboration/infrastructure/groupChatService.ts` (26 endpoints)
- `src/features/collaboration/infrastructure/voiceSessionService.ts`
- `src/features/collaboration/infrastructure/collabWebSocket.ts` (WebSocket)

---

## Gestion des Groupes de Travail

```typescript
import groupService from '@/features/collaboration/infrastructure/groupService';

// Récupérer tous les groupes de l'utilisateur
const groupes = await groupService.getWorkgroups();

// Créer un groupe
await groupService.createWorkgroup({ name: 'Groupe IA', description: '...' });
```

---

## Chat de Groupe (26 endpoints)

```typescript
import * as chatService from '@/features/collaboration/infrastructure/groupChatService';

// Récupérer les messages d'un groupe
const messages = await chatService.getGroupMessages(groupId);

// Envoyer un message texte
await chatService.sendMessage(groupId, { content: 'Bonjour !' });

// Envoyer un fichier audio (FormData)
const formData = new FormData();
formData.append('audio', audioBlob, 'message.webm');
await chatService.sendAudioMessage(groupId, formData);

// Envoyer une image
const formData = new FormData();
formData.append('image', imageFile);
await chatService.sendImageMessage(groupId, formData);

// Réactions
await chatService.addReaction(groupId, messageId, '👍');
await chatService.removeReaction(groupId, messageId, '👍');

// Épingler / Supprimer
await chatService.pinMessage(groupId, messageId);
await chatService.deleteMessage(groupId, messageId);
```

---

## Sessions Vocales

```typescript
import * as voiceService from '@/features/collaboration/infrastructure/voiceSessionService';

// Démarrer une session vocale
const session = await voiceService.startSession(groupId);

// Terminer la session
await voiceService.endSession(groupId, session.id);
```

---

## WebSocket (Temps Réel)

Voir [config/websocket.md](../config/websocket.md) pour la documentation complète.

```typescript
import { collabSocket } from '@/features/collaboration/infrastructure/collabWebSocket';

// Connexion à un groupe (reçoit les messages en temps réel)
collabSocket.connect(groupId, (newMessage) => {
  setMessages(prev => [...prev, newMessage]);
});

// Envoyer via WebSocket (optimiste)
collabSocket.sendMessage('/app/chat.send', { content: 'Hello', groupId });

// Toujours déconnecter dans le cleanup
return () => collabSocket.disconnect();
```

---

## Wiki Collaboratif

```typescript
import { subscribeWikis } from '@/features/collaboration/infrastructure/wikiSubscriber';
import { saveWiki } from '@/features/collaboration/infrastructure/wikiSaver';

// Écouter les mises à jour (polling toutes les 4s)
const unsubscribe = subscribeWikis((wikis) => setWikis(wikis));

// Sauvegarder une page (API + notification WebSocket)
await saveWiki({ id: 'page-1', title: 'Introduction', content: '...' });

// Cleanup
unsubscribe();
```

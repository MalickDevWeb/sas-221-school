# Proxy Vite → Spring Boot

## Pourquoi un proxy ?

En développement, le frontend tourne sur `http://localhost:5173` et le backend sur `http://localhost:8080`.
Sans proxy, le navigateur bloquerait les requêtes à cause de la politique **CORS** (origines différentes).

Le proxy Vite résout ce problème : toutes les requêtes vers `/api/*` sont automatiquement redirigées vers Spring Boot.

---

## Configuration actuelle

Fichier : `frontend/vite.config.ts`

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // ← Spring Boot
      changeOrigin: true,
    },
  },
},
define: {
  // Fix SockJS : la bibliothèque utilise `global` (Node.js), pas disponible dans le navigateur
  global: 'globalThis',
},
```

---

## Comment ça fonctionne

```
Frontend appelle :  GET /api/auth/me
       ↓ (proxy Vite)
Backend reçoit :    GET http://localhost:8080/api/auth/me
```

Le code frontend n'a **jamais besoin d'écrire le host complet**. Il utilise toujours des chemins relatifs :
```typescript
// ✅ Correct
await apiClient.get('/auth/me');

// ❌ À éviter en dev
await apiClient.get('http://localhost:8080/api/auth/me');
```

---

## En production

En production (déployé sur Render, Railway, VPS...), le proxy Vite n'existe plus.
Il faut utiliser la variable d'environnement :

```env
# frontend/.env (production)
VITE_API_URL=https://votre-backend.onrender.com/api
```

Le `apiClient.ts` utilise automatiquement cette variable :
```typescript
baseURL: import.meta.env.VITE_API_URL || '/api',
```

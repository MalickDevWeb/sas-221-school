# Configuration des Variables d'Environnement

## Fichiers concernés

| Fichier | Rôle |
|---|---|
| `.env` (racine projet) | Variables partagées (rarement utilisé) |
| `frontend/.env` | Variables injectées dans Vite (`VITE_*`) |
| `frontend/.env.example` | Template de référence — **NE PAS modifier** |

---

## Variables Frontend (`frontend/.env`)

Créez ce fichier en copiant `.env.example` :
```bash
cp frontend/.env.example frontend/.env
```

### Variables obligatoires

```env
# URL du backend Spring Boot
# En développement local, laisser vide (le proxy Vite gère la redirection)
VITE_API_URL=

# Si vous déployez en production (ex: Render, Railway)
# VITE_API_URL=https://votre-backend.onrender.com/api
```

### Variables optionnelles (Google Auth)

Ces variables sont nécessaires uniquement si vous utilisez la connexion **Google OAuth** (pour les scopes Google Calendar / Google Meet).

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Note :** Si ces variables sont absentes, des valeurs `dummy-*` sont utilisées par défaut.
> L'application fonctionnera, mais le bouton "Connexion avec Google" ne marchera pas.

---

## Variable Backend (Spring Boot)

La configuration du backend se fait dans `backend/src/main/resources/application.properties` ou `application.yml`.

Éléments clés à vérifier :
```properties
# Port du serveur
server.port=8080

# Base de données PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/ecole221
spring.datasource.username=votre_user
spring.datasource.password=votre_password

# Redis
spring.redis.host=localhost
spring.redis.port=6379

# JWT
jwt.secret=votre_cle_secrete_tres_longue
jwt.expiration=86400000
```

---

## Résumé des ports en développement

| Service | Port |
|---|---|
| Frontend (Vite) | `5173` |
| Backend (Spring Boot) | `8080` |
| PostgreSQL | `5432` |
| Redis | `6379` |

# API Auth & Dashboard

Base URL : `http://localhost:8080/api` (géré automatiquement par le proxy Vite en dev)

Fichier service : `src/features/auth/infrastructure/api/authService.ts`
Fichier service : `src/features/dashboard/infrastructure/api/dashboardService.ts`

---

## Authentification (4 endpoints)

### POST `/auth/login` — Connexion web (cookie)
```typescript
import { loginWeb } from '@/features/auth/infrastructure/api/authService';

const user = await loginWeb({ email: 'admin221@gmail.com', password: 'ecole221' });
// Réponse : infos utilisateur. Le token est dans un cookie HTTP-only.
```

### POST `/auth/login-token` — Connexion API (JWT)
```typescript
import { loginToken } from '@/features/auth/infrastructure/api/authService';

const { token, role } = await loginToken({ email: 'admin221@gmail.com', password: 'ecole221' });
localStorage.setItem('auth_token', token);
// Stocker le token → apiClient l'injectera automatiquement dans les requêtes suivantes
```

### POST `/auth/logout`
```typescript
import { logout } from '@/features/auth/infrastructure/api/authService';
await logout();
localStorage.removeItem('auth_token');
```

### GET `/auth/me` — Profil connecté
```typescript
import { getMe } from '@/features/auth/infrastructure/api/authService';

const profile = await getMe();
// { id, nom, prenom, email, role }
```

---

## Dashboard (22 endpoints)

### KPIs

```typescript
import {
  getKpis, getKpiByKey, getKpisByCategory,
  createKpi, updateKpi, updateKpiValue
} from '@/features/dashboard/infrastructure/api/dashboardService';

// Récupérer tous les KPIs
const kpis = await getKpis();

// Créer un KPI
await createKpi({ name: 'Taux de réussite', value: '92', unit: '%', trend: 'UP' });

// Mettre à jour une valeur
await updateKpiValue('RECOVERY_RATE', '95');
```

### Alertes

```typescript
import { getActiveAlerts, createAlert, deactivateAlert } from '...';

const alertes = await getActiveAlerts();
await createAlert({ alertType: 'SYSTEM', title: 'CPU élevé', severity: 'CRITICAL', isActive: true });
await deactivateAlert('alert-id-123');
```

### Agrégations (le plus utile pour l'UI)

```typescript
import { getDashboardComplete, getFinancialKpis } from '...';

// Charge tout d'un coup : KPIs + Alertes + Activités
const tout = await getDashboardComplete();
```

---

## Gestion des erreurs

```typescript
try {
  const data = await getDashboardComplete();
} catch (e: any) {
  // apiClient affiche automatiquement un toast d'erreur (sonner)
  // Codes possibles :
  // 401 → redirigé vers /login automatiquement
  // 403 → accès refusé
  // 404 → ressource absente
  // 500 → erreur serveur
}
```

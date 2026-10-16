# 📘 Project History — Ecole 221 (SaaS Multi-Tenant)

> Ce fichier est automatiquement mis à jour par l'agent à chaque session. Ne pas supprimer.

---

## Backend (Spring Boot / Java)

- **Last Updated**: 2026-09-18 12:45
- **Current Goal**: Travail en cours sur le rôle `SUPER_ADMIN` — gestion des droits, endpoints, et logique métier.
- **Recent Changes**:
  - Consultation et analyse de `User.java` (modèle de domaine, UserDetails, rôles, vérification email/téléphone)
  - Consultation et analyse de `RoleUtilisateur.java` (record immutable, validation, constantes prédéfinies dont `SUPER_ADMIN`)
  - Le rôle `SUPER_ADMIN` est bien défini dans `RoleUtilisateur`, la méthode `isAdmin()` le reconnaît
- **Next Steps**:
  - Déterminer la tâche exacte sur le SUPER_ADMIN (endpoint de création, initialisation par défaut, droits Spring Security, dashboard UI)
- **Key Files**:
  - `ecole/src/main/java/ecole_221/sn/ecole/modules/auth/domain/model/User.java`
  - `ecole/src/main/java/ecole_221/sn/ecole/modules/auth/domain/valueobject/RoleUtilisateur.java`
- **Blockers**: Contexte précis de la tâche SUPER_ADMIN à clarifier avec l'utilisateur

---

## Frontend (React / Vite)

- **Last Updated**: 2026-09-18 12:55
- **Current Goal**: Création des interfaces de connexion dédiées (Super Admin & Admin École) et de leurs tableaux de bord.
- **Recent Changes**:
  - Création du `SuperAdminLayout` (Sidebar avec navigation).
  - Traduction de toute l'interface Super Admin en Français.
  - Création de `SuperAdminDashboardPage`, `SuperAdminTenantsPage`, `SuperAdminUsersPage`, `SuperAdminBillingPage` et `SuperAdminSettingsPage`.
  - Création de la **Landing Page publique** (`/accueil`) pour la vitrine SaaS (Ecole 221).
  - Création de `AddTenantModal` (Modale d'ajout d'une nouvelle école) intégrée à `SuperAdminTenantsPage`.
  - Création de `SuperAdminPlaceholderPage` pour les routes de la sidebar en cours de développement.
  - Création de `SuperAdminLoginPage` et `AdminPortalLoginPage`.
  - Modification de `AppRouter.tsx` pour inclure toutes les routes du panneau Super Admin.
  - Création du système de Marque Blanche / Multi-Tenant via l'URL (`/t/:slug/login`).
  - Ajout des champs `slug` et `primaryColor` dans `AddTenantModal` et `SchoolRegistrationPage`.
- **Next Steps**:
  - Thématiser l'intérieur des tableaux de bord (Direction, Étudiants) avec la couleur `primary` du store.
- **Key Files**:
  - `frontend (Copie)/src/core/store/tenantStore.ts`
  - `frontend (Copie)/src/features/auth/ui/components/LoginDesktopView.tsx`

---

## Base de données (PostgreSQL / Migrations)

- **Last Updated**: 2026-09-18 12:45
- **Current Goal**: Non défini
- **Recent Changes**:
  - Migrations V5 mentionnées dans `User.java` (nouveaux champs: telephone, emailVerified, phoneVerified, lastLoginAt, language, timezone)
- **Next Steps**:
  - Implémenter l'endpoint public pour la résolution du tenant : `GET /api/v1/public/tenants/{slug}` (doit retourner le nom, le slug, et l'objet branding avec `primaryColor` et `logoUrl`).
  - Mettre à jour la création d'organisation (via `SUPER_ADMIN` ou `/register-school`) pour accepter et persister `slug` et `primaryColor` (vers la table `organization_branding`).
- **Key Files**:
  - `ecole/src/main/resources/db/migration/V16__add_slug_to_organizations.sql` (Nouvelle migration ajoutée par le frontend)
- **Blockers**: Le frontend utilise actuellement un store Zustand en mode "Mock" pour la résolution du tenant tant que l'API n'est pas prête.

---

## Infrastructure / DevOps

- **Last Updated**: 2026-09-18 12:45
- **Current Goal**: Non défini
- **Recent Changes**: Aucun
- **Next Steps**: À définir
- **Key Files**: /
- **Blockers**: Aucun

## Tenant Branding Storage
Please ensure that the `primaryColor` (and `logoUrl` if applicable) submitted during `/register-school` and tenant creation endpoints are properly saved in the database in the `Tenant` entity. The Frontend now heavily relies on this dynamic color to brand the whole application dynamically.
Also, the Frontend expects `GET /api/v1/public/tenants/{slug}` to return `{ id, name, slug, branding: { primaryColor, logoUrl } }`.

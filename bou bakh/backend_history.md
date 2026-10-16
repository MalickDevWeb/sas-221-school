# 📘 Backend History — Ecole 221 (SaaS Multi-Tenant)

> Ce fichier est automatiquement mis à jour par l'agent à chaque session backend. Ne pas supprimer.

---

## Statut actuel
- **Dernière mise à jour** : 2026-10-16 12:28
- **Objectif en cours** : Nettoyage intégral des écoles de test — Conservation unique d'École 221 (/ecole-221)
- **Statut** : TERMINÉ ✅

## Changements récents
- [2026-10-16] Nettoyage complet de la base PostgreSQL : suppression définitive (Hard Delete) des 27 écoles de test créées lors des essais, ainsi que des 26 comptes utilisateurs synthétiques associés. Seul l'établissement officiel **École 221** (`id: default-tenant-id`, `slug: ecole-221`, `status: ACTIVE`) est conservé.
- [2026-10-16] `AdminStaffService.java` — Service applicatif dédié (117 lignes, R9 validé) assurant l'isolation stricte des membres du personnel selon le tenant (`TenantContext.getCurrentOrganization()`). Récupération ciblée via `organization_users` + comptes du domaine institutionnel (`@<slug>.sn`).
- [2026-10-16] `AdminStaffService.java` — Gestion sécurisée des doublons d'email : si un utilisateur existe déjà dans PostgreSQL (`users`), mise à jour de son profil et rattachement immédiat dans `organization_users` sans échec de contrainte `utilisateurs_email_key` ni erreur 500.
- [2026-10-16] `AdminController.java` — Refactorisation des endpoints `/admin/staff` (GET et POST) pour déléguer à `AdminStaffService`.
- [2026-10-15] `application.yaml` — Paramétrage HikariCP optimisé pour Neon serverless (keepalive 60s, max-lifetime 5min, idle-timeout 2min) pour éliminer les erreurs 500 "Connection has been closed"
- [2026-10-15] `Appointment.java` — Modèle de domaine pour les rendez-vous et visioconférences Google Meet
- [2026-10-15] `AppointmentRepositoryPort.java` — Port repository domaine (Architecture Hexagonale)
- [2026-10-15] `AppointmentJpaEntity.java` — Entité JPA avec `@TenantId` multi-tenant (table `parent_appointments`)
- [2026-10-15] `AppointmentJpaRepository.java` — Repository Spring Data JPA
- [2026-10-15] `AppointmentRepositoryAdapter.java` — Adaptateur d'infrastructure de persistance
- [2026-10-15] `ParentService.java` — Remplacement du stockage in-memory par la persistance PostgreSQL
- [2026-10-15] `ParentController.java` — Ajout du endpoint `GET /parent/professeurs` pour alimenter dynamiquement la liste des professeurs
- [2026-10-15] `ParentMessagesPage.tsx` — Branchage dynamique sur `/parent/professeurs` pour le sélecteur de professeurs
- [2026-10-15] Tests d'intégration automatisés : POST + GET `/api/parent/rdv` vérifiés avec succès avec token JWT parent

## Prochaines étapes
1. [ ] Côté professeur : afficher les demandes de rendez-vous reçues des parents dans l'espace professeur
2. [ ] Groupes d'élèves : valider les flux de collaboration / groupes d'étude
3. [ ] Création de cours côté Admin : valider l'appel réel `POST /admin/courses` depuis les formulaires de l'interface admin

## Fichiers clés
| Fichier | Rôle |
|---------|------|
| `shared/error/ErrorCode.java` | Enum centralisé des codes d'erreur |
| `shared/error/AppException.java` | Exception domaine typée |
| `shared/error/ApiErrorResponse.java` | Envelope JSON uniforme |
| `infrastructure/web/GlobalExceptionHandler.java` | Gestionnaire global des erreurs |
| `modules/student/infrastructure/web/StudentDashboardController.java` | Routes courtes dashboard étudiant |
| `infrastructure/config/SecurityConfig.java` | Sécurité Spring — routes publiques |

## Blocages
- [RÉSOLU] 500 sur `/api/meet/active`, `/api/notifications`, `/api/schedule` — créé `StudentDashboardController`
- [RÉSOLU] `NotificationController` commenté car `NotificationUseCaseImpl` n'est pas `@Service` — gardé commenté, route `/notifications` exposée via `StudentDashboardController`

## Architecture décidée
> Architecture hexagonale stricte : Domain → Application (UseCase/Port) → Infrastructure (Web/Persistence)
> R9 : aucun fichier > 125 lignes (`StudentDashboardController` = 103 lignes ✅)
> R10 : `StudentDashboardController` appelle uniquement `StudentUseCase`, jamais de repo direct ✅

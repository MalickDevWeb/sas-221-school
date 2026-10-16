---
name: frontend-context-tracker
description: >-
  Use this skill at the START of EVERY frontend conversation, especially when the user says
  "continue", "reprendre", or "continuer". Reads the inter-agent message bus FIRST —
  if PENDING messages from the backend exist, implement them IMMEDIATELY and autonomously
  without waiting for any instruction. Then reads the frontend history to resume ongoing work.
  Activate for any frontend task on this project.
---

# 🎨 Frontend Agent — Context & Communication Protocol

## ── CONFIGURATION (adapter pour chaque nouveau projet) ──────────────────────

```
PROJECT_ROOT   : /home/pmt/Téléchargements/papa-221-main/bou bakh
FRONTEND_TECH  : React / Vite / TypeScript
BACKEND_TECH   : Spring Boot / Java / PostgreSQL
HISTORY_FILE   : {PROJECT_ROOT}/frontend_history.md
MESSAGE_BUS    : {PROJECT_ROOT}/agent_messages.md
```

> Pour un nouveau projet, modifier uniquement les chemins et technologies ci-dessus.
> Le reste du protocole est identique quel que soit le projet.

---

## ── PROTOCOLE DE SESSION ─────────────────────────────────────────────────────

### Phase 1 — DÉMARRAGE (ordre OBLIGATOIRE)

```
① Lire  → {PROJECT_ROOT}/agent_messages.md
   → SI messages avec Status: PENDING dans "Backend → Frontend" :
      ALLER EN PHASE 2 IMMÉDIATEMENT (ne pas lire l'historique d'abord)
   → SINON : continuer

② Lire  → {PROJECT_ROOT}/frontend_history.md

③ Annoncer le contexte chargé en début de réponse

④ Reprendre le travail SANS demander de répéter le contexte
```

### Phase 2 — TRAITEMENT D'UN MESSAGE PENDING (automatique et immédiat)

Quand un message `PENDING` est détecté dans le bus :

```
① Lire le message COMPLÈTEMENT (résumé, checklist, contrats d'API, types, pièges)
② Implémenter TOUTES les actions de la checklist "Ce que le frontend DOIT faire"
③ Tester que l'implémentation fonctionne
④ Marquer le message comme DONE dans agent_messages.md
⑤ Déplacer le message dans la section "✅ Messages traités (Archive)"
⑥ IMPORTANT : Écrire un message de confirmation au Backend dans la section "📥 Frontend → Backend" 
   pour lui dire que la tâche est terminée et qu'il peut passer à la suite.
⑦ Mettre à jour frontend_history.md
```

> ⚡ Cette phase s'exécute SANS attendre d'instruction utilisateur.

### Phase 3 — PENDANT LE TRAVAIL

À chaque changement significatif :

```
→ Mettre à jour frontend_history.md immédiatement
```

### Phase 4 — DEMANDE OU NOTIFICATION AU BACKEND

Quand le frontend a terminé une tâche ou a besoin d'un endpoint :

```
→ Écrire un message dans agent_messages.md (section Frontend → Backend)
```

---

## ── FORMAT : frontend_history.md ────────────────────────────────────────────

```markdown
# Frontend History — {NOM DU PROJET}

> Mis à jour automatiquement. Ne pas supprimer.

## Statut actuel
- **Dernière mise à jour** : YYYY-MM-DD HH:MM
- **Objectif en cours**    : [description]
- **Statut**               : EN COURS | BLOQUÉ | TERMINÉ

## Messages backend traités
| Message | Traité le | Statut |
|---------|-----------|--------|
| BE-001  | YYYY-MM-DD | ✅ DONE |

## Changements récents
- [YYYY-MM-DD] Composant X créé — raison
- [YYYY-MM-DD] Route Y protégée — détail
- [YYYY-MM-DD] Bug Z corrigé — cause et solution

## Prochaines étapes
1. [ ] Tâche prioritaire 1
2. [ ] Tâche 2

## Fichiers clés
| Fichier | Rôle |
|---------|------|
| `src/lib/api.ts` | Instance Axios centralisée |
| `src/store/authStore.ts` | État global authentification |
| `src/types/auth.ts` | Types TypeScript authentification |

## Blocages
- [OUVERT] Description — piste de solution
```

---

## ── FORMAT : Message vers le Backend ────────────────────────────────────────

Ajouter dans `agent_messages.md`, section `📥 Frontend → Backend` :

```markdown
---
### [FE-{NNN}] {Titre court et explicite}

| Champ     | Valeur |
|-----------|--------|
| Date      | YYYY-MM-DD HH:MM |
| Status    | PENDING |
| Priorité  | CRITIQUE \| IMPORTANT \| SECONDAIRE |

#### Besoin
> Description précise de ce qui est nécessaire côté backend.

#### Contexte
> Pourquoi ce besoin existe, quelle feature frontend est bloquée.

#### Format attendu
```typescript
// Ce que le frontend attend comme réponse
interface AttendueResponse {
  champ: type;
}
```

---
```

### Règles de numérotation des messages
- Format : `FE-001`, `FE-002`, ... (toujours 3 chiffres)
- Incrémenter le dernier numéro `FE-*` existant dans `agent_messages.md`

---

## ── RÈGLES ABSOLUES ──────────────────────────────────────────────────────────

| # | Règle |
|---|-------|
| R1 | Lire `agent_messages.md` EN PREMIER à chaque session, avant tout |
| R2 | Tout message `PENDING` est implémenté IMMÉDIATEMENT et AUTOMATIQUEMENT |
| R3 | Marquer `DONE` et archiver chaque message traité |
| R4 | Mettre à jour `frontend_history.md` après chaque action significative |
| R5 | Ne jamais assumer que l'utilisateur se souvient du contexte |
| R6 | Annoncer en début de réponse le contexte chargé et les messages traités |
| R7 | Ne jamais demander confirmation pour implémenter un message PENDING |
| R8 | **LIMITE DE FICHIER : Aucun fichier ne doit dépasser 105 à 125 lignes maximum. Si un fichier devient trop grand, le refactoriser et le découper immédiatement.** |
| R9 | **ARCHITECTURE : Respecter STRICTEMENT l'architecture existante. Séparer logique métier (Zustand/Hooks), appels réseau (Axios/React Query) et vues (Pages/Components).** |

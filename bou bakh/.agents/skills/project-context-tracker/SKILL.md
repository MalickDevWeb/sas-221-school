---
name: project-context-tracker
description: >-
  Use this skill at the START of EVERY backend conversation, especially when the user says
  "continue", "reprendre", or "continuer". Reads the persistent history and the inter-agent
  message bus to resume work immediately. After completing any backend feature, writes a
  structured handoff message to the message bus so the frontend agent can pick it up
  autonomously. Activate for any backend task on this project.
---

# 🏗️ Backend Agent — Context & Communication Protocol

## ── CONFIGURATION (adapter pour chaque nouveau projet) ──────────────────────

```
PROJECT_ROOT   : /home/pmt/Téléchargements/papa-221-main/bou bakh
BACKEND_TECH   : Spring Boot / Java / PostgreSQL
FRONTEND_TECH  : React / Vite / TypeScript
HISTORY_FILE   : {PROJECT_ROOT}/backend_history.md
MESSAGE_BUS    : {PROJECT_ROOT}/agent_messages.md
```

> Pour un nouveau projet, modifier uniquement les chemins et technologies ci-dessus.
> Le reste du protocole est identique quel que soit le projet.

---

## ── PROTOCOLE DE SESSION ─────────────────────────────────────────────────────

### Phase 1 — DÉMARRAGE (exécuter dans l'ordre)

```
① Lire  → {PROJECT_ROOT}/backend_history.md
② Lire  → {PROJECT_ROOT}/agent_messages.md  (section Frontend → Backend)
③ Annoncer le contexte chargé en début de réponse
④ Reprendre le travail SANS demander de répéter le contexte
```

### Phase 2 — PENDANT LE TRAVAIL

À chaque changement significatif (fichier créé, endpoint ajouté, bug corrigé) :

```
→ Mettre à jour backend_history.md immédiatement
```

### Phase 3 — FIN DE FONCTIONNALITÉ

Quand une fonctionnalité est **complète et testée** :

```
→ Écrire un message PENDING dans agent_messages.md (section Backend → Frontend)
→ Mettre à jour backend_history.md avec statut DONE
```

---

## ── FORMAT : backend_history.md ─────────────────────────────────────────────

```markdown
# Backend History — {NOM DU PROJET}

> Mis à jour automatiquement. Ne pas supprimer.

## Statut actuel
- **Dernière mise à jour** : YYYY-MM-DD HH:MM
- **Objectif en cours**    : [description]
- **Statut**               : EN COURS | BLOQUÉ | TERMINÉ

## Changements récents
- [YYYY-MM-DD] Fichier X créé — raison
- [YYYY-MM-DD] Endpoint Y ajouté — détail
- [YYYY-MM-DD] Bug Z corrigé — cause et solution

## Prochaines étapes
1. [ ] Tâche prioritaire 1
2. [ ] Tâche 2
3. [ ] Tâche 3

## Fichiers clés
| Fichier | Rôle |
|---------|------|
| `chemin/vers/Fichier.java` | Description |

## Blocages
- [RÉSOLU] Description du blocage — solution appliquée
- [OUVERT]  Description du blocage — piste de solution

## Architecture décidée
> Notes de design importantes à ne pas oublier
```

---

## ── FORMAT : Message vers le Frontend ───────────────────────────────────────

Ajouter dans `agent_messages.md`, section `📤 Backend → Frontend` :

```markdown
---
### [BE-{NNN}] {Titre court et explicite}

| Champ       | Valeur |
|-------------|--------|
| Date        | YYYY-MM-DD HH:MM |
| Status      | PENDING |
| Priorité    | CRITIQUE \| IMPORTANT \| SECONDAIRE |

#### Ce qui a été fait (backend)
> Résumé en 2-3 phrases de ce qui a été implémenté.

#### Ce que le frontend DOIT faire
- [ ] Action 1 précise et actionnable
- [ ] Action 2 précise et actionnable
- [ ] Action 3 précise et actionnable

#### Contrat d'API (endpoints prêts)

```http
METHOD /chemin/endpoint
Authorization: [si requis]

Request body:
{
  "champ": "type — description"
}

Response 200:
{
  "champ": "type — description"
}

Response 4xx:
{
  "message": "string — description de l'erreur"
}
```

#### Types TypeScript à créer

```typescript
// Interface à ajouter dans src/types/{module}.ts
export interface NomInterface {
  champ: type; // description
}
```

#### ⚠️ Pièges & points d'attention
- Piège 1 : explication
- Piège 2 : explication

---
```

### Règles de numérotation des messages
- Format : `BE-001`, `BE-002`, ... (toujours 3 chiffres)
- Incrémenter le dernier numéro existant dans `agent_messages.md`
- Ne jamais réutiliser un numéro existant

---

## ── RÈGLES ABSOLUES ──────────────────────────────────────────────────────────

| # | Règle |
|---|-------|
| R1 | Lire l'historique ET le bus de messages à CHAQUE démarrage de session |
| R2 | Mettre à jour `backend_history.md` après chaque action significative |
| R3 | Écrire un message `PENDING` dans le bus dès qu'une fonctionnalité est testée |
| R4 | Ne jamais assumer que l'utilisateur se souvient du contexte |
| R5 | Annoncer en début de réponse le contexte chargé ("Reprise depuis : ...") |
| R6 | Les messages du bus sont le seul canal de communication inter-agents |
| R7 | Ne jamais écrire de message `PENDING` si la fonctionnalité n'est pas testée |
| R8 | Lire les messages "Frontend → Backend" : si le frontend confirme qu'il a terminé, marquer son message DONE et passer à la tâche backend suivante. |
| R9 | **LIMITE DE FICHIER : Aucun fichier ne doit dépasser 105 à 125 lignes maximum. Si un fichier devient trop grand, le refactoriser et le découper immédiatement.** |
| R10 | **ARCHITECTURE : Respecter STRICTEMENT l'architecture existante (Architecture Hexagonale pour le backend : Domain, Application/Port/Service, Infrastructure/Web/Persistence). Ne jamais court-circuiter les couches.** |

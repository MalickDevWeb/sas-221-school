co# Contrat API - Module Admin
# École 221 - Système de Gestion

## Base URL
```
http://localhost:8080/api
```

## Authentication
Les endpoints admin nécessitent une authentification. Le frontend doit inclure le token JWT dans le header Authorization :
```
Authorization: Bearer <token>
```

---

## 1. AdminController
**Base Path**: `/admin`

### 1.1 Statistiques globales
**Endpoint**: `GET /admin/stats`

**Description**: Récupère les statistiques globales de la plateforme

**Response**:
```json
{
  "studentsCount": 150,
  "professorsCount": 25,
  "coursesCount": 30,
  "classesCount": 8,
  "presentProfessors": "18/25",
  "salleOccupation": "75%"
}
```

---

### 1.2 Assigner un portail
**Endpoint**: `POST /admin/gates/assign`

**Description**: Assigne un gardien/vigil à un portail d'accès

**Request Body**:
```json
{
  "gate": "Portail Principal",
  "guard": "Vigil-001"
}
```
*Note: `guard` peut aussi être spécifié avec `vigilId`*

**Response**:
```json
{
  "success": true,
  "gate": "Portail Principal",
  "assignedTo": "Vigil-001"
}
```

---

### 1.3 Modifier statut étudiant
**Endpoint**: `PATCH /admin/students/{id}/status`

**Description**: Met à jour le statut de frais d'un étudiant

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Request Body**:
```json
{
  "statutFrais": "En Règle"
}
```
*Valeurs possibles: "En Règle", "En Retard"*

**Response**:
```json
{
  "success": true,
  "status": "En Règle"
}
```

---

### 1.4 Logs temps réel
**Endpoint**: `GET /admin/realtime-logs`

**Description**: Retourne les derniers logs d'activité de la plateforme

**Response**:
```json
[
  "[2026-08-13T17:09:25.841780154] Statut financier de l'étudiant 'usr-001' mis à jour à 'En Règle'",
  "[2026-08-13T17:09:25.757215779] Portail 'Portail Principal' assigné au vigil 'Vigil-001'",
  "[2026-08-13T17:08:27.860820739] Système de contrôle initialisé."
]
```

---

### 1.5 Paramètres candidatures
**Endpoint**: `POST /admin/candidatures/settings`

**Description**: Active ou désactive le système de candidature

**Request Body**:
```json
{
  "enabled": true
}
```

**Response**:
```json
{
  "success": true,
  "candidaturesEnabled": true
}
```

---

### 1.6 Liste des utilisateurs
**Endpoint**: `GET /admin/users`

**Description**: Retourne tous les utilisateurs (étudiants, professeurs, promotions)

**Response**:
```json
{
  "students": [
    {
      "id": "usr-001",
      "name": "Mamadou Sall",
      "matricule": "2026-GC-001",
      "promotion_id": "L1-GL",
      "average": 15.5,
      "gpa": 3.5,
      "mood": "stable",
      "statutFrais": "En Règle"
    }
  ],
  "professors": [
    {
      "id": "usr-002",
      "name": "Moussa Diallo",
      "email": "professeur221@gmail.com"
    }
  ],
  "promotions": [
    {
      "id": "L1-GL",
      "name": "L1 Génie Civil",
      "filiere": "Génie Civil",
      "faculte": "Sciences et Technologie"
    }
  ]
}
```

---

### 1.7 Ajouter étudiant
**Endpoint**: `POST /admin/students`

**Description**: Crée un nouvel étudiant

**Request Body**:
```json
{
  "name": "Oumar Fall",
  "matricule": "2026-GC-003",
  "promotion_id": "L1-GL"
}
```

**Response**:
```json
{
  "id": "usr-1786640968981",
  "name": "Oumar Fall",
  "matricule": "2026-GC-003",
  "promotion_id": "L1-GL",
  "average": 0.0,
  "gpa": 0.0,
  "mood": "stable",
  "statutFrais": "En Règle"
}
```

---

### 1.8 Supprimer étudiant
**Endpoint**: `DELETE /admin/students/{id}`

**Description**: Supprime un étudiant par son ID

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Response**:
```json
{
  "success": true,
  "id": "usr-001"
}
```

---

### 1.9 Ajouter professeur
**Endpoint**: `POST /admin/professors`

**Description**: Crée un nouveau professeur

**Request Body**:
```json
{
  "name": "Cheikh Tidiane",
  "email": "cheikh.tidiane@ecole221.sn"
}
```

**Response**:
```json
{
  "id": "usr-1786640969024",
  "name": "Cheikh Tidiane",
  "email": "cheikh.tidiane@ecole221.sn"
}
```

---

### 1.10 Supprimer professeur
**Endpoint**: `DELETE /admin/professors/{id}`

**Description**: Supprime un professeur par son ID

**Path Parameters**:
- `id` (string): Identifiant du professeur

**Response**:
```json
{
  "success": true,
  "id": "usr-002"
}
```

---

## 2. AdminPlanningController
**Base Path**: `/admin/planning`

### 2.1 Liste des salles
**Endpoint**: `GET /admin/planning/rooms`

**Description**: Retourne toutes les salles disponibles

**Response**:
```json
[
  {
    "id": "room-1",
    "name": "Salle 101",
    "capacity": 30
  },
  {
    "id": "room-2",
    "name": "Salle 102",
    "capacity": 40
  },
  {
    "id": "room-3",
    "name": "Amphi A",
    "capacity": 120
  }
]
```

---

### 2.2 Mettre à jour les salles
**Endpoint**: `PUT /admin/planning/rooms`

**Description**: Met à jour la liste complète des salles

**Request Body**:
```json
[
  {
    "id": "room-1",
    "name": "Salle 101",
    "capacity": 35
  },
  {
    "id": "room-2",
    "name": "Salle 102",
    "capacity": 45
  },
  {
    "id": "room-4",
    "name": "Salle 103",
    "capacity": 50
  }
]
```

**Response**: HTTP 200 (No Content)

---

### 2.3 Liste des filières
**Endpoint**: `GET /admin/planning/filieres`

**Description**: Retourne toutes les filières de l'école

**Response**:
```json
[
  {
    "id": "filiere-1",
    "code": "GL",
    "name": "Génie Logiciel"
  },
  {
    "id": "filiere-2",
    "code": "RI",
    "name": "Réseaux et Télécoms"
  }
]
```

---

### 2.4 Mettre à jour les filières
**Endpoint**: `PUT /admin/planning/filieres`

**Description**: Met à jour la liste complète des filières

**Request Body**:
```json
[
  {
    "id": "filiere-1",
    "name": "Génie Logiciel",
    "code": "GL"
  },
  {
    "id": "filiere-3",
    "name": "Génie Civil",
    "code": "GC"
  }
]
```

**Response**: HTTP 200 (No Content)

---

### 2.5 Liste des classes
**Endpoint**: `GET /admin/planning/classes`

**Description**: Retourne toutes les classes de l'école

**Response**:
```json
[
  {
    "id": "class-1",
    "name": "L3 GL",
    "filiereId": "filiere-1"
  },
  {
    "id": "class-2",
    "name": "M1 GL",
    "filiereId": "filiere-1"
  }
]
```

---

### 2.6 Mettre à jour les classes
**Endpoint**: `PUT /admin/planning/classes`

**Description**: Met à jour la liste complète des classes

**Request Body**:
```json
[
  {
    "id": "class-1",
    "name": "L3 GL Modifié",
    "filiereId": "filiere-1"
  },
  {
    "id": "class-3",
    "name": "M2 GL",
    "filiereId": "filiere-1"
  }
]
```

**Response**: HTTP 200 (No Content)

---

### 2.7 Créneaux horaires
**Endpoint**: `GET /admin/planning/slots`

**Description**: Retourne tous les créneaux horaires disponibles

**Response**:
```json
[
  {
    "id": "slot-1",
    "jour": "Lundi",
    "heureDebut": "08:00",
    "heureFin": "11:00",
    "heureStr": "08:00 - 11:00",
    "nom": "Cours",
    "type": "CM",
    "professeur": "Professeur",
    "salle": "Salle",
    "description": "Description",
    "classeId": "class-1",
    "CM": true,
    "TD": false,
    "TP": false
  }
]
```

---

### 2.8 Mettre à jour les créneaux
**Endpoint**: `PUT /admin/planning/slots`

**Description**: Met à jour la liste complète des créneaux horaires

**Request Body**:
```json
[
  {
    "id": "slot-1",
    "jour": "Lundi",
    "heureDebut": "08:00",
    "heureFin": "10:00",
    "nom": "Cours Modifié",
    "type": "CM",
    "professeur": "Prof. A",
    "salle": "Salle 101",
    "classeId": "class-1"
  }
]
```

**Response**: HTTP 200 (No Content)

---

## 3. AdminStudentProfileController
**Base Path**: `/admin`

### 3.1 Profil 360 étudiant
**Endpoint**: `GET /admin/students/{id}/profile360`

**Description**: Récupère le profil complet 360° d'un étudiant

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Response**:
```json
{
  "admissionDetails": {
    "matricule": "MAT-2023-usr-001",
    "dateInscription": "15/09/2023",
    "bacSerie": "S1 Scientifique",
    "bacMention": "Très Bien (16.8/20)",
    "lyceeOrigine": "Lycée Seydou Nourou Tall",
    "commissionAdmission": "Commission Régionale Dakar",
    "dateDecision": "05/09/2023",
    "statut": "ADMIS"
  },
  "ueList": [
    {
      "ue": "UE Scientifique Fondamentale",
      "module": "Mathématiques & Analyse",
      "coefficient": 4,
      "grade": 16.5,
      "teacher": "Mme Sow",
      "status": "VALIDÉ"
    }
  ],
  "connectionLogs": [
    {
      "date": "2026-07-17 08:15",
      "device": "Chrome Desktop",
      "location": "Dakar, Sénégal",
      "status": "RÉUSSI"
    }
  ],
  "activityTrail": [
    {
      "id": "log-1",
      "timestamp": "2026-07-17 08:35",
      "actor": "Étudiant",
      "module": "Planning",
      "action": "Consultation emploi du temps",
      "result": "SUCCÈS"
    }
  ],
  "timeline": [
    {
      "year": "2023-09",
      "title": "Candidature & Admission",
      "desc": "Dossier accepté",
      "status": "COMPLETED"
    }
  ],
  "payments": [
    {
      "label": "Inscription Administrative",
      "amount": "250,000 FCFA",
      "date": "15/09/2023",
      "method": "Orange Money",
      "status": "PAYÉ",
      "receiptNumber": "REC-2023-001"
    }
  ],
  "extra": {
    "sante": "O+,Aucune allergie connue",
    "bourses": "Aucune bourse",
    "messages": [
      {
        "sender": "Administration",
        "text": "Bienvenue sur la plateforme École 221.",
        "date": "10/07/2026 09:00"
      }
    ]
  }
}
```

---

### 3.2 Mettre à jour profil 360
**Endpoint**: `POST /admin/students/{id}/profile360`

**Description**: Met à jour des champs spécifiques du profil 360

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Request Body**:
```json
{
  "bloodGroup": "O+",
  "allergies": "Aucune allergie connue"
}
```

**Response**: Profil mis à jour complet

---

### 3.3 Documents étudiant
**Endpoint**: `GET /admin/students/{id}/documents`

**Description**: Récupère la liste des documents d'un étudiant

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Response**:
```json
[
  {
    "id": "doc-1786640981552",
    "name": "Diplome Bac",
    "size": "2 Mo",
    "url": "http://example.com/diplome.pdf"
  }
]
```

---

### 3.4 Ajouter document
**Endpoint**: `POST /admin/students/{id}/documents`

**Description**: Ajoute un document au dossier étudiant

**Path Parameters**:
- `id` (string): Identifiant de l'étudiant

**Request Body**:
```json
{
  "name": "Certificat Medical",
  "size": "1 Mo",
  "url": "http://example.com/medical.pdf"
}
```

**Response**:
```json
{
  "documents": [
    {
      "id": "doc-1786641408047",
      "name": "Certificat Medical",
      "size": "1 Mo",
      "url": "http://example.com/medical.pdf"
    }
  ]
}
```

---

### 3.5 Générer diagnostic IA
**Endpoint**: `POST /admin/student-diagnostic`

**Description**: Génère un diagnostic académique via IA

**Request Body**:
```json
{
  "studentId": "usr-001"
}
```

**Response**:
```json
{
  "text": "Diagnostic académique pour l'étudiant usr-001 : profil stable, assiduité correcte, progression satisfaisante en UE techniques. Recommandation : renforcer les compétences en planification de projet et en anglais technique."
}
```

---

### 3.6 Assigner emploi du temps
**Endpoint**: `POST /admin/schedule/assign`

**Description**: Assigne un cours à un créneau horaire

**Request Body**:
```json
{
  "courseId": "course-123",
  "day": "Lundi",
  "time": "08:00-11:00",
  "room": "Salle 101"
}
```

**Response**:
```json
{
  "success": true,
  "courseId": "course-123",
  "day": "Lundi",
  "time": "08:00-11:00",
  "room": "Salle 101"
}
```

---

## 4. CandidaturesController
**Base Path**: `/candidatures`

### 4.1 Paramètres candidature
**Endpoint**: `GET /candidatures/settings`

**Description**: Retourne la configuration actuelle des admissions

**Response**:
```json
{
  "ouvert": true,
  "dateOuverture": "2026-06-01",
  "dateFermeture": "2026-08-31",
  "messageAvis": "Les candidatures sont ouvertes",
  "showRegisterButton": true,
  "docsRequis": {
    "cni": true,
    "bulletin": true,
    "diplome": true,
    "motivation": true
  }
}
```

---

### 4.2 Mettre à jour paramètres
**Endpoint**: `POST /candidatures/settings`

**Description**: Met à jour la configuration des admissions

**Request Body**:
```json
{
  "ouvert": true,
  "dateOuverture": "2026-06-01",
  "dateFermeture": "2026-08-31",
  "messageAvis": "Candidatures ouvertes"
}
```

**Response**:
```json
{
  "success": true,
  "settings": {
    "ouvert": true,
    "dateOuverture": "2026-06-01",
    "dateFermeture": "2026-08-31",
    "messageAvis": "Candidatures ouvertes",
    "showRegisterButton": true,
    "docsRequis": {
      "cni": true,
      "bulletin": true,
      "diplome": true,
      "motivation": true
    }
  }
}
```

---

### 4.3 Soumettre candidature
**Endpoint**: `POST /candidatures/submit`

**Description**: Soumet une nouvelle candidature d'admission

**Request Body**:
```json
{
  "nom": "Amadou Ba",
  "email": "amadou.ba@example.com",
  "telephone": "771234567",
  "filiere": "GL"
}
```

**Response**:
```json
{
  "success": true,
  "candidatureId": "cand-1786640986979",
  "message": "Candidature soumise avec succès"
}
```

---

### 4.4 Liste des candidatures
**Endpoint**: `GET /candidatures/candidatures`

**Description**: Retourne toutes les candidatures soumises

**Response**:
```json
{
  "candidatures": [
    {
      "id": "cand-1786640986979",
      "nom": "Amadou Ba",
      "email": "amadou.ba@example.com",
      "telephone": "771234567",
      "filiere": "GL",
      "statut": "EN_ATTENTE",
      "dateSoumission": "2026-08-13T17:09:46.979570316"
    }
  ]
}
```

---

### 4.5 Détails candidature
**Endpoint**: `GET /candidatures/candidatures/{id}`

**Description**: Retourne les détails d'une candidature spécifique

**Path Parameters**:
- `id` (string): Identifiant de la candidature

**Response**:
```json
{
  "id": "cand-1786640986979",
  "nom": "Amadou Ba",
  "email": "amadou.ba@example.com",
  "telephone": "771234567",
  "filiere": "GL",
  "statut": "EN_ATTENTE",
  "dateSoumission": "2026-08-13T17:09:46.979570316"
}
```

---

### 4.6 Modifier statut candidature
**Endpoint**: `PATCH /candidatures/candidatures/{id}/statut`

**Description**: Met à jour le statut d'une candidature

**Path Parameters**:
- `id` (string): Identifiant de la candidature

**Request Body**:
```json
{
  "statut": "ADMIS"
}
```
*Valeurs possibles: "EN_ATTENTE", "ADMIS", "ACCEPTE", "REFUSE"*

**Response**:
```json
{
  "success": true,
  "statut": "ADMIS"
}
```

---

## Codes d'erreur HTTP

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non autorisé (token manquant ou invalide) |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |

## Notes importantes pour le frontend

1. **Content-Type**: Toutes les requêtes POST/PUT/PATCH doivent avoir le header `Content-Type: application/json`

2. **Authentication**: Inclure le token JWT dans le header Authorization pour les endpoints protégés

3. **IDs**: Les IDs sont générés par le backend et ne doivent pas être modifiés par le frontend

4. **Dates**: Les dates sont au format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

5. **Validation**: Le frontend doit valider les formulaires avant envoi selon les règles métier

6. **Error Handling**: Implémenter une gestion d'erreurs appropriée pour les codes HTTP 4xx et 5xx

## Exemple d'implémentation JavaScript

```javascript
const API_BASE = 'http://localhost:8080/api';
const TOKEN = localStorage.getItem('token');

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Exemple: Récupérer les statistiques
async function getStats() {
  return await fetchAPI('/admin/stats');
}

// Exemple: Assigner un portail
async function assignGate(gate, guard) {
  return await fetchAPI('/admin/gates/assign', {
    method: 'POST',
    body: JSON.stringify({ gate, guard })
  });
}
```

---

**Document généré automatiquement - Module Admin - École 221**
**Version**: 1.0
**Date**: 2026-08-13

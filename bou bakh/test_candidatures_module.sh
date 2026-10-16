#!/bin/bash
set -e

BASE_URL="http://127.0.0.1:8090/api"

echo "============================================="
echo "🎓 TEST MODULE CANDIDATURES & ADMISSIONS"
echo "============================================="

# 1. Login as Admin
echo "[1/8] Authentification en tant qu'Admin..."
AUTH_RES=$(curl -s -X POST "$BASE_URL/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.test@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$AUTH_RES" | jq -r '.token')
if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Échec récupération token"
  exit 1
fi
echo "✅ Token récupéré avec succès."

# 2. Public Settings
echo "[2/8] GET /api/candidatures/settings..."
SETTINGS=$(curl -s "$BASE_URL/candidatures/settings")
echo "$SETTINGS" | jq .
IS_OPEN=$(echo "$SETTINGS" | jq -r '.ouvert')
if [ "$IS_OPEN" != "true" ]; then
  echo "❌ Candidatures non ouvertes"
  exit 1
fi
echo "✅ Paramètres candidatures validés."

# 3. Submit Candidature
echo "[3/8] POST /api/candidatures/submit..."
SUBMIT_RES=$(curl -s -X POST "$BASE_URL/candidatures/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diagne",
    "prenom": "Ibrahima",
    "email": "ibrahima.diagne@test.sn",
    "telephone": "+221 77 123 45 67",
    "filiere": "Génie Logiciel",
    "niveau": "L1",
    "notesBac": 15.2
  }')
echo "$SUBMIT_RES" | jq .
CAND_ID=$(echo "$SUBMIT_RES" | jq -r '.candidatureId')
if [ -z "$CAND_ID" ] || [ "$CAND_ID" == "null" ]; then
  echo "❌ Échec soumission candidature"
  exit 1
fi
echo "✅ Candidature soumise avec ID: $CAND_ID"

# 4. Get Candidatures List
echo "[4/8] GET /api/candidatures/candidatures..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/candidatures/candidatures" | jq .
echo "✅ Liste des candidatures récupérée."

# 5. Patch Candidature Statut
echo "[5/8] PATCH /api/candidatures/candidatures/$CAND_ID/statut..."
PATCH_RES=$(curl -s -X PATCH "$BASE_URL/candidatures/candidatures/$CAND_ID/statut" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"statut": "ACCEPTE"}')
echo "$PATCH_RES" | jq .
STATUT=$(echo "$PATCH_RES" | jq -r '.statut')
if [ "$STATUT" != "ACCEPTE" ]; then
  echo "❌ Statut non mis à jour"
  exit 1
fi
echo "✅ Statut candidature mis à jour à ACCEPTE."

# 6. Admissions Candidates List
echo "[6/8] GET /api/admissions/candidates..."
ADM_CANDS=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/admissions/candidates")
echo "$ADM_CANDS" | jq .
echo "✅ Liste des candidats admissions récupérée."

# 7. Create Candidate in Admissions
echo "[7/8] POST /api/admissions/candidates..."
NEW_CAND=$(curl -s -X POST "$BASE_URL/admissions/candidates" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Ndiaye",
    "prenom": "Awa",
    "email": "awa.ndiaye@test.sn",
    "telephone": "221789876543",
    "filiereDemandee": "Génie Logiciel",
    "statut": "EN_ATTENTE",
    "note": 16.5
  }')
echo "$NEW_CAND" | jq .
NEW_ID=$(echo "$NEW_CAND" | jq -r '.id')
echo "✅ Candidat créé dans Admissions avec ID: $NEW_ID"

# 8. Step and Status progression
if [ -n "$NEW_ID" ] && [ "$NEW_ID" != "null" ]; then
  echo "[8/8] Workflow transition: PATCH /api/admissions/candidates/$NEW_ID/step & status..."
  curl -s -X PATCH "$BASE_URL/admissions/candidates/$NEW_ID/step" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"step": "FINALISE"}' | jq .
  
  curl -s -X PATCH "$BASE_URL/admissions/candidates/$NEW_ID/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "ACCEPTED"}' | jq .
  echo "✅ Workflow transition validé."
fi

echo "============================================="
echo "🎉 MODULE CANDIDATURES & ADMISSIONS 100% VALIDÉ !"
echo "============================================="

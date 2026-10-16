#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "🏫 TEST DES ENDPOINTS: BLOC 3 ADMINISTRATION D'ÉCOLE"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification (SUPER_ADMIN autorise aussi /admin/**)"
LOGIN_RES=$(curl -s -X POST "${BASE_URL}/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de récupérer le token"
  exit 1
fi
echo "✅ Authentifié avec succès !"

echo ""
echo "1️⃣ TEST : GET /api/admin/stats (Statistiques globales de l'établissement)"
STATS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/admin/stats" \
  -H "Authorization: Bearer $TOKEN")

STATS_STATUS=$(echo "$STATS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
STATS_BODY=$(echo "$STATS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $STATS_STATUS"
echo "Réponse: $STATS_BODY"

echo ""
echo "2️⃣ TEST : GET /api/admin/users (Liste des utilisateurs : étudiants, professeurs, promotions)"
USERS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/admin/users" \
  -H "Authorization: Bearer $TOKEN")

USERS_STATUS=$(echo "$USERS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
USERS_BODY=$(echo "$USERS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $USERS_STATUS"
echo "Réponse: $USERS_BODY"

echo ""
echo "3️⃣ TEST : POST /api/admin/students (Ajout manuel d'un étudiant)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
ADD_STUDENT_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/admin/students" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Cheikh Tidiane $RANDOM_ID\",
    \"matricule\": \"2026-ET-$RANDOM_ID\",
    \"promotion_id\": \"L1-GL\"
  }")

ADD_STUDENT_STATUS=$(echo "$ADD_STUDENT_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ADD_STUDENT_BODY=$(echo "$ADD_STUDENT_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ADD_STUDENT_STATUS"
echo "Réponse: $ADD_STUDENT_BODY"
STUDENT_ID=$(echo "$ADD_STUDENT_BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo ""
echo "4️⃣ TEST : POST /api/admin/professors (Ajout d'un enseignant)"
ADD_PROF_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/admin/professors" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Dr. Abdoulaye Ba $RANDOM_ID\",
    \"email\": \"prof$RANDOM_ID@ecole221.sn\"
  }")

ADD_PROF_STATUS=$(echo "$ADD_PROF_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ADD_PROF_BODY=$(echo "$ADD_PROF_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ADD_PROF_STATUS"
echo "Réponse: $ADD_PROF_BODY"

echo ""
echo "5️⃣ TEST : GET /api/admin/students/{id}/profile360 (Dossier complet 360° élève)"
# On teste avec un étudiant existant ou nouvellement créé
TEST_ID=${STUDENT_ID:-"usr-001"}
PROFILE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/admin/students/${TEST_ID}/profile360" \
  -H "Authorization: Bearer $TOKEN")

PROFILE_STATUS=$(echo "$PROFILE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
PROFILE_BODY=$(echo "$PROFILE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $PROFILE_STATUS"
echo "Réponse: $PROFILE_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 3 ADMINISTRATION"
echo "=========================================================="

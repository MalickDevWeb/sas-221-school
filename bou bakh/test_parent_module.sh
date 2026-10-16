#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "👪 TEST DES ENDPOINTS: BLOC 6 ESPACE PARENT"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification avec le compte Parent"
LOGIN_RES=$(curl -s -X POST "${BASE_URL}/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"parent.test@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de récupérer le token parent"
  exit 1
fi
echo "✅ Authentifié avec succès en tant que Parent !"

echo ""
echo "1️⃣ TEST : GET /api/parent/enfants (Liste des enfants)"
ENFANTS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/parent/enfants" \
  -H "Authorization: Bearer $TOKEN")

ENFANTS_STATUS=$(echo "$ENFANTS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ENFANTS_BODY=$(echo "$ENFANTS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ENFANTS_STATUS"
echo "Réponse: $ENFANTS_BODY"

ENFANT_ID=$(echo "$ENFANTS_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
ENFANT_ID=${ENFANT_ID:-"usr-001"}
echo "Enfant ID utilisé pour les tests: $ENFANT_ID"

echo ""
echo "2️⃣ TEST : GET /api/parent/enfants/{id}/stats (Statistiques de l'enfant)"
STATS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/parent/enfants/${ENFANT_ID}/stats" \
  -H "Authorization: Bearer $TOKEN")

STATS_STATUS=$(echo "$STATS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
STATS_BODY=$(echo "$STATS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $STATS_STATUS"
echo "Réponse: $STATS_BODY"

echo ""
echo "3️⃣ TEST : GET /api/parent/enfants/{id}/presences (Absences & retards)"
PRESENCES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/parent/enfants/${ENFANT_ID}/presences" \
  -H "Authorization: Bearer $TOKEN")

PRESENCES_STATUS=$(echo "$PRESENCES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
PRESENCES_BODY=$(echo "$PRESENCES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $PRESENCES_STATUS"
echo "Réponse: $PRESENCES_BODY"

echo ""
echo "4️⃣ TEST : GET /api/parent/enfants/{id}/notes (Notes & bulletins)"
NOTES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/parent/enfants/${ENFANT_ID}/notes" \
  -H "Authorization: Bearer $TOKEN")

NOTES_STATUS=$(echo "$NOTES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
NOTES_BODY=$(echo "$NOTES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $NOTES_STATUS"
echo "Réponse: $NOTES_BODY"

echo ""
echo "5️⃣ TEST : GET /api/parent/messages (Messagerie parent-école)"
MESSAGES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/parent/messages" \
  -H "Authorization: Bearer $TOKEN")

MESSAGES_STATUS=$(echo "$MESSAGES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
MESSAGES_BODY=$(echo "$MESSAGES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $MESSAGES_STATUS"
echo "Réponse: $MESSAGES_BODY"

echo ""
echo "6️⃣ TEST : POST /api/parent/messages (Envoi d'un message à l'établissement)"
SEND_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/parent/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destinataireId": "admin-001",
    "sujet": "Demande de rendez-vous trimestriel",
    "message": "Bonjour, je souhaite convenir d un entretien pour le suivi scolaire de mon enfant."
  }')

SEND_STATUS=$(echo "$SEND_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
SEND_BODY=$(echo "$SEND_RES" | sed '/HTTP_STATUS/d')
echo "Status: $SEND_STATUS"
echo "Réponse: $SEND_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 6 PARENT"
echo "=========================================================="

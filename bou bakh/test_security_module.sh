#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "🛡️ TEST DES ENDPOINTS: BLOC 8 SÉCURITÉ & VIGILE"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification (SUPER_ADMIN)"
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
echo "1️⃣ TEST : GET /api/security/checkpoint-status (État des portails et barrières)"
CP_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/security/checkpoint-status" \
  -H "Authorization: Bearer $TOKEN")

CP_STATUS=$(echo "$CP_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
CP_BODY=$(echo "$CP_RES" | sed '/HTTP_STATUS/d')
echo "Status: $CP_STATUS"
echo "Réponse: $CP_BODY"

echo ""
echo "2️⃣ TEST : GET /api/security/vigil-profiles (Profils des agents de sécurité)"
PROFILES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/security/vigil-profiles" \
  -H "Authorization: Bearer $TOKEN")

PROFILES_STATUS=$(echo "$PROFILES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
PROFILES_BODY=$(echo "$PROFILES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $PROFILES_STATUS"
echo "Réponse: $PROFILES_BODY"

echo ""
echo "3️⃣ TEST : POST /api/security/scan-logs (Enregistrement d'un scan de badge)"
SCAN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/security/scan-logs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "usr-001",
    "checkpointId": "gate-nord"
  }')

SCAN_STATUS=$(echo "$SCAN_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
SCAN_BODY=$(echo "$SCAN_RES" | sed '/HTTP_STATUS/d')
echo "Status: $SCAN_STATUS"
echo "Réponse: $SCAN_BODY"

echo ""
echo "4️⃣ TEST : GET /api/vigil/check-ins (Historique des passages en temps réel)"
CHECKINS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/vigil/check-ins" \
  -H "Authorization: Bearer $TOKEN")

CHECKINS_STATUS=$(echo "$CHECKINS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
CHECKINS_BODY=$(echo "$CHECKINS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $CHECKINS_STATUS"
echo "Réponse: $CHECKINS_BODY"

echo ""
echo "5️⃣ TEST : POST /api/vigil/scan (Scan badge étudiant par le vigile)"
VIGIL_SCAN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/vigil/scan" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeId": "SN-2026-1234"
  }')

VIGIL_SCAN_STATUS=$(echo "$VIGIL_SCAN_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
VIGIL_SCAN_BODY=$(echo "$VIGIL_SCAN_RES" | sed '/HTTP_STATUS/d')
echo "Status: $VIGIL_SCAN_STATUS"
echo "Réponse: $VIGIL_SCAN_BODY"

echo ""
echo "6️⃣ TEST : GET /api/vigil/last-scan (Dernier scan enregistré au portail)"
LAST_SCAN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/vigil/last-scan" \
  -H "Authorization: Bearer $TOKEN")

LAST_SCAN_STATUS=$(echo "$LAST_SCAN_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
LAST_SCAN_BODY=$(echo "$LAST_SCAN_RES" | sed '/HTTP_STATUS/d')
echo "Status: $LAST_SCAN_STATUS"
echo "Réponse: $LAST_SCAN_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 8 SÉCURITÉ & VIGILE"
echo "=========================================================="

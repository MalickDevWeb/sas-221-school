#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "🎓 TEST DES ENDPOINTS: BLOC 5 ESPACE ÉTUDIANT"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification (SUPER_ADMIN autorise aussi /student/**)"
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
echo "1️⃣ TEST : GET /api/student/profile (Profil complet de l'élève)"
PROFILE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/student/profile" \
  -H "Authorization: Bearer $TOKEN")

PROFILE_STATUS=$(echo "$PROFILE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
PROFILE_BODY=$(echo "$PROFILE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $PROFILE_STATUS"
echo "Réponse: $PROFILE_BODY"

echo ""
echo "2️⃣ TEST : GET /api/student/dashboard (Tableau de bord étudiant)"
DASHBOARD_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/student/dashboard" \
  -H "Authorization: Bearer $TOKEN")

DASHBOARD_STATUS=$(echo "$DASHBOARD_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
DASHBOARD_BODY=$(echo "$DASHBOARD_RES" | sed '/HTTP_STATUS/d')
echo "Status: $DASHBOARD_STATUS"
echo "Réponse: $DASHBOARD_BODY"

echo ""
echo "3️⃣ TEST : GET /api/student/digital-badge (Badge numérique & token HMAC)"
BADGE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/student/digital-badge" \
  -H "Authorization: Bearer $TOKEN")

BADGE_STATUS=$(echo "$BADGE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
BADGE_BODY=$(echo "$BADGE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $BADGE_STATUS"
echo "Réponse: $BADGE_BODY"

MATRICULE=$(echo "$BADGE_BODY" | grep -o '"matricule":"[^"]*' | cut -d'"' -f4)
TOKEN_QR=$(echo "$BADGE_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
MINUTE_EPOCH=$(echo "$BADGE_BODY" | grep -o '"minuteEpoch":[0-9]*' | cut -d':' -f2)

MATRICULE=${MATRICULE:-"SN-2026-1234"}
MINUTE_EPOCH=${MINUTE_EPOCH:-$(( $(date +%s) / 60 ))}
TOKEN_QR=${TOKEN_QR:-"dummy-token"}

echo ""
echo "4️⃣ TEST : POST /api/student/qr-validate (Validation de scan QR Code)"
QR_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/student/qr-validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"matricule\": \"$MATRICULE\",
    \"minuteEpoch\": $MINUTE_EPOCH,
    \"token\": \"$TOKEN_QR\"
  }")

QR_STATUS=$(echo "$QR_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
QR_BODY=$(echo "$QR_RES" | sed '/HTTP_STATUS/d')
echo "Status: $QR_STATUS"
echo "Réponse: $QR_BODY"

echo ""
echo "5️⃣ TEST : GET /api/student/grades (Relevé de notes de l'élève)"
GRADES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/student/grades" \
  -H "Authorization: Bearer $TOKEN")

GRADES_STATUS=$(echo "$GRADES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
GRADES_BODY=$(echo "$GRADES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $GRADES_STATUS"
echo "Réponse: $GRADES_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 5 ÉTUDIANT"
echo "=========================================================="

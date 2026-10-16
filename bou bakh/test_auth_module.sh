#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "🧪 TEST DES ENDPOINTS: AUTH & ONBOARDING (PORT 8090)"
echo "=========================================================="

echo ""
echo "1️⃣ TEST : POST /api/auth/login-token (Identifiants SuperAdmin)"
LOGIN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

HTTP_STATUS=$(echo "$LOGIN_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$LOGIN_RES" | sed '/HTTP_STATUS/d')

echo "Status: $HTTP_STATUS"
echo "Réponse: $BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
  TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "✅ Token JWT extrait avec succès !"
else
  echo "❌ Échec de la connexion login-token"
  exit 1
fi

echo ""
echo "2️⃣ TEST : GET /api/auth/me (avec le Bearer Token)"
ME_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/auth/me" \
  -H "Authorization: Bearer $TOKEN")

ME_STATUS=$(echo "$ME_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ME_BODY=$(echo "$ME_RES" | sed '/HTTP_STATUS/d')

echo "Status: $ME_STATUS"
echo "Réponse: $ME_BODY"

echo ""
echo "3️⃣ TEST : POST /api/auth/login (Authentification Cookie Web)"
COOKIE_RES=$(curl -s -i -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

echo "$COOKIE_RES" | head -n 15

echo ""
echo "4️⃣ TEST : POST /api/auth/logout (Déconnexion)"
LOGOUT_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

LOGOUT_STATUS=$(echo "$LOGOUT_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
echo "Status: $LOGOUT_STATUS"

echo ""
echo "5️⃣ TEST : POST /api/register-school (Inscription d'un nouvel établissement)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
REGISTER_PAYLOAD=$(cat <<EOF
{
  "schoolName": "Lycée Test Automated $RANDOM_ID",
  "slug": "lycee-test-$RANDOM_ID",
  "adminEmail": "moussa$RANDOM_ID@lyceetest.sn",
  "adminFirstName": "Moussa",
  "adminLastName": "Diallo",
  "adminPhone": "+22177000$RANDOM_ID",
  "primaryColor": "#5B6BF9"
}
EOF
)

REG_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/register-school" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD")

REG_STATUS=$(echo "$REG_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
REG_BODY=$(echo "$REG_RES" | sed '/HTTP_STATUS/d')

echo "Status: $REG_STATUS"
echo "Réponse: $REG_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS AUTH & ONBOARDING"
echo "=========================================================="

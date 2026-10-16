#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "📊 TEST DES ENDPOINTS: BLOC 11 DASHBOARD CEO & ALERTES"
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
echo "1️⃣ TEST : POST /api/dashboard/kpis (Création d'un nouvel indicateur KPI)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
KPI_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/dashboard/kpis" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "kpi-'"$RANDOM_ID"'",
    "name": "Taux d insertion professionnelle '"$RANDOM_ID"'",
    "value": "96.4",
    "unit": "%",
    "trend": "+4.2%"
  }')

KPI_STATUS=$(echo "$KPI_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
KPI_BODY=$(echo "$KPI_RES" | sed '/HTTP_STATUS/d')
echo "Status: $KPI_STATUS"
echo "Réponse: $KPI_BODY"

echo ""
echo "2️⃣ TEST : GET /api/dashboard/kpis (Liste complète des KPIs)"
LIST_KPI_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/dashboard/kpis" \
  -H "Authorization: Bearer $TOKEN")

LIST_KPI_STATUS=$(echo "$LIST_KPI_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
LIST_KPI_BODY=$(echo "$LIST_KPI_RES" | sed '/HTTP_STATUS/d')
echo "Status: $LIST_KPI_STATUS"
echo "Nombre de KPIs retournés: $(echo "$LIST_KPI_BODY" | grep -o '"id":' | wc -l)"

echo ""
echo "3️⃣ TEST : GET /api/dashboard/alerts (Liste des alertes globales)"
ALERTS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/dashboard/alerts" \
  -H "Authorization: Bearer $TOKEN")

ALERTS_STATUS=$(echo "$ALERTS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ALERTS_BODY=$(echo "$ALERTS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ALERTS_STATUS"
echo "Réponse: $ALERTS_BODY"

echo ""
echo "4️⃣ TEST : GET /api/dashboard/alerts/active (Liste des alertes actives en cours)"
ACT_ALERTS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/dashboard/alerts/active" \
  -H "Authorization: Bearer $TOKEN")

ACT_ALERTS_STATUS=$(echo "$ACT_ALERTS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ACT_ALERTS_BODY=$(echo "$ACT_ALERTS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ACT_ALERTS_STATUS"
echo "Réponse: $ACT_ALERTS_BODY"

echo ""
echo "5️⃣ TEST : GET /api/dashboard/activities (Journal des activités récentes de l établissement)"
ACT_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/dashboard/activities?limit=5" \
  -H "Authorization: Bearer $TOKEN")

ACT_STATUS=$(echo "$ACT_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ACT_BODY=$(echo "$ACT_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ACT_STATUS"
echo "Réponse: $ACT_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 11 DASHBOARD"
echo "=========================================================="

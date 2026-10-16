#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "🛡️ TEST DES ENDPOINTS: BLOC 2 SUPER-ADMIN & MULTI-TENANT"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification SuperAdmin pour obtenir le JWT"
LOGIN_RES=$(curl -s -X POST "${BASE_URL}/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de récupérer le token SuperAdmin"
  exit 1
fi
echo "✅ Authentifié avec succès en tant que SuperAdmin !"

echo ""
echo "1️⃣ TEST : GET /api/v1/super-admin/tenants (Liste de toutes les écoles)"
LIST_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/v1/super-admin/tenants" \
  -H "Authorization: Bearer $TOKEN")

LIST_STATUS=$(echo "$LIST_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
LIST_BODY=$(echo "$LIST_RES" | sed '/HTTP_STATUS/d')
echo "Status: $LIST_STATUS"
echo "Nombre de tenants retournés: $(echo "$LIST_BODY" | grep -o '"id":' | wc -l)"

echo ""
echo "2️⃣ TEST : POST /api/v1/super-admin/tenants (Création d'un nouvel établissement)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
CREATE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/super-admin/tenants" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Academie Elite $RANDOM_ID\",
    \"email\": \"contact$RANDOM_ID@academie-elite.sn\",
    \"country\": \"Sénégal\",
    \"city\": \"Dakar\",
    \"address\": \"Point E, Rue $RANDOM_ID\",
    \"phone\": \"+22133888$RANDOM_ID\",
    \"adminNom\": \"Ndiaye\",
    \"adminPrenom\": \"Awa\",
    \"adminEmail\": \"awa$RANDOM_ID@academie-elite.sn\",
    \"adminPhone\": \"+22177666$RANDOM_ID\"
  }")

CREATE_STATUS=$(echo "$CREATE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
CREATE_BODY=$(echo "$CREATE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $CREATE_STATUS"
echo "Réponse: $CREATE_BODY"

TENANT_ID=$(echo "$CREATE_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
TENANT_STATUS=$(echo "$CREATE_BODY" | grep -o '"status":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "Tenant ID créé: $TENANT_ID (Statut initial: $TENANT_STATUS)"

if [ -z "$TENANT_ID" ]; then
  echo "❌ Échec de la création du tenant"
  exit 1
fi

echo ""
echo "3️⃣ TEST : POST /api/v1/super-admin/tenants/{id}/approve (PENDING -> ACTIVE)"
APPROVE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/super-admin/tenants/${TENANT_ID}/approve" \
  -H "Authorization: Bearer $TOKEN")

APPROVE_STATUS=$(echo "$APPROVE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
APPROVE_BODY=$(echo "$APPROVE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $APPROVE_STATUS"
echo "Réponse: $APPROVE_BODY"

echo ""
echo "4️⃣ TEST : POST /api/v1/super-admin/tenants/{id}/suspend (ACTIVE -> SUSPENDED)"
SUSPEND_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/super-admin/tenants/${TENANT_ID}/suspend" \
  -H "Authorization: Bearer $TOKEN")

SUSPEND_STATUS=$(echo "$SUSPEND_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
SUSPEND_BODY=$(echo "$SUSPEND_RES" | sed '/HTTP_STATUS/d')
echo "Status: $SUSPEND_STATUS"
echo "Réponse: $SUSPEND_BODY"

echo ""
echo "5️⃣ TEST : POST /api/v1/super-admin/tenants/{id}/activate (SUSPENDED -> ACTIVE)"
ACTIVATE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/v1/super-admin/tenants/${TENANT_ID}/activate" \
  -H "Authorization: Bearer $TOKEN")

ACTIVATE_STATUS=$(echo "$ACTIVATE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ACTIVATE_BODY=$(echo "$ACTIVATE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ACTIVATE_STATUS"
echo "Réponse: $ACTIVATE_BODY"

echo ""
echo "6️⃣ TEST : DELETE /api/v1/super-admin/tenants/{id} (Archivage logique)"
DELETE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "${BASE_URL}/v1/super-admin/tenants/${TENANT_ID}" \
  -H "Authorization: Bearer $TOKEN")

DELETE_STATUS=$(echo "$DELETE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
echo "Status: $DELETE_STATUS"

echo ""
echo "7️⃣ TEST : Vérification du filtre Archivé vs Actif"
ARCHIVED_RES=$(curl -s -X GET "${BASE_URL}/v1/super-admin/tenants?status=ARCHIVED" \
  -H "Authorization: Bearer $TOKEN")

IS_PRESENT=$(echo "$ARCHIVED_RES" | grep -o "$TENANT_ID" || true)
if [ -n "$IS_PRESENT" ]; then
  echo "✅ L'école apparaît bien dans le filtre ?status=ARCHIVED !"
else
  echo "⚠️ L'école n'a pas été trouvée dans le filtre ?status=ARCHIVED"
fi

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 2 SUPER-ADMIN"
echo "=========================================================="

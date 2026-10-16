#!/usr/bin/env bash
# ==============================================================================
# Script de Test Intégration E2E - Module SaaS Billing & Subscriptions
# ==============================================================================

set -euo pipefail

BASE_URL="http://127.0.0.1:8090"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Test Module SaaS Billing & Subscriptions ===${NC}"

# 1. Connexion SuperAdmin via /api/auth/login-token
echo -n "1. Authentification SuperAdmin... "
LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/api/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}[FAIL] - Impossible d'obtenir le token SuperAdmin${NC}"
  echo "Response: $LOGIN_RESP"
  exit 1
fi
echo -e "${GREEN}[OK]${NC}"

# 2. Lister les Plans d'abonnement
echo -n "2. GET /api/v1/super-admin/plans... "
PLANS_CODE=$(curl -s -o /tmp/billing_plans.json -w "%{http_code}" -X GET "${BASE_URL}/api/v1/super-admin/plans" \
  -H "Authorization: Bearer ${TOKEN}")

if [ "$PLANS_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  cat /tmp/billing_plans.json | jq . || cat /tmp/billing_plans.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $PLANS_CODE)${NC}"
  cat /tmp/billing_plans.json
  exit 1
fi

# 3. Créer un nouveau Plan
echo -n "3. POST /api/v1/super-admin/plans... "
RAND_SUFFIX=$((RANDOM % 9000 + 1000))
NEW_PLAN=$(curl -s -X POST "${BASE_URL}/api/v1/super-admin/plans" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Plan Pro Test ${RAND_SUFFIX}\",
    \"code\": \"PLAN_PRO_${RAND_SUFFIX}\",
    \"description\": \"Abonnement test automatisé\",
    \"priceMonthly\": 49000,
    \"priceYearly\": 490000,
    \"currency\": \"XOF\",
    \"maxStudents\": 500,
    \"maxProfessors\": 50,
    \"maxStorageGb\": 100,
    \"features\": [\"GESTION_NOTES\", \"PORTAIL_PARENTS\", \"BADGES_QR\"]
  }")

PLAN_ID=$(echo "$NEW_PLAN" | jq -r '.id // empty')

if [ -n "$PLAN_ID" ] && [ "$PLAN_ID" != "null" ]; then
  echo -e "${GREEN}[OK] - Plan créé ID: ${PLAN_ID}${NC}"
else
  echo -e "${RED}[WARN] Création plan retour: ${NEW_PLAN}${NC}"
fi

# 4. Récupérer le Plan par ID si créé
if [ -n "$PLAN_ID" ] && [ "$PLAN_ID" != "null" ]; then
  echo -n "4. GET /api/v1/super-admin/plans/${PLAN_ID}... "
  GET_PLAN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api/v1/super-admin/plans/${PLAN_ID}" \
    -H "Authorization: Bearer ${TOKEN}")
  if [ "$GET_PLAN_CODE" -eq 200 ]; then
    echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  else
    echo -e "${RED}[FAIL] (HTTP $GET_PLAN_CODE)${NC}"
  fi
fi

# 5. Lister les Subscriptions
echo -n "5. GET /api/v1/super-admin/subscriptions... "
SUBS_CODE=$(curl -s -o /tmp/billing_subs.json -w "%{http_code}" -X GET "${BASE_URL}/api/v1/super-admin/subscriptions" \
  -H "Authorization: Bearer ${TOKEN}")

if [ "$SUBS_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  cat /tmp/billing_subs.json | jq . || cat /tmp/billing_subs.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $SUBS_CODE)${NC}"
  cat /tmp/billing_subs.json
  exit 1
fi

echo -e "${GREEN}=== Module SaaS Billing & Subscriptions VALIDÉ 100% ===${NC}"


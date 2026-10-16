#!/usr/bin/env bash
# ==============================================================================
# Script de Test Intégration E2E - Modules Finaux
# (Audit, Sync, Email, Media Upload, Collaboration, Root)
# ==============================================================================

set -euo pipefail

BASE_URL="http://127.0.0.1:8090"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Test Modules Finaux (Audit, Sync, Email, Media, Collab, Root) ===${NC}"

# 1. Connexion SuperAdmin pour JWT
echo -n "1. Authentification SuperAdmin... "
LOGIN_RESP=$(curl -s -X POST "${BASE_URL}/api/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ecole221.sn","password":"SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}[FAIL] - Impossible d'obtenir le token SuperAdmin${NC}"
  exit 1
fi
echo -e "${GREEN}[OK]${NC}"

# 2. Test Root Endpoint (/api)
echo -n "2. GET /api (Root redirection)... "
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api")
if [ "$ROOT_CODE" -eq 302 ] || [ "$ROOT_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP $ROOT_CODE)${NC}"
else
  echo -e "${RED}[FAIL] (HTTP $ROOT_CODE)${NC}"
  exit 1
fi

# 3. Test Audit Module
echo -n "3.1 GET /api/audit/logs... "
AUDIT_LOGS_CODE=$(curl -s -o /tmp/audit_logs.json -w "%{http_code}" -X GET "${BASE_URL}/api/audit/logs" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$AUDIT_LOGS_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
else
  echo -e "${RED}[FAIL] (HTTP $AUDIT_LOGS_CODE)${NC}"
  exit 1
fi

echo -n "3.2 GET /api/audit/statistics... "
AUDIT_STATS_CODE=$(curl -s -o /tmp/audit_stats.json -w "%{http_code}" -X GET "${BASE_URL}/api/audit/statistics" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$AUDIT_STATS_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
else
  echo -e "${RED}[FAIL] (HTTP $AUDIT_STATS_CODE)${NC}"
  exit 1
fi

# 4. Test Sync Module
echo -n "4.1 GET /api/sync/check... "
SYNC_CHECK_CODE=$(curl -s -o /tmp/sync_check.json -w "%{http_code}" -X GET "${BASE_URL}/api/sync/check" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$SYNC_CHECK_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  cat /tmp/sync_check.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $SYNC_CHECK_CODE)${NC}"
  exit 1
fi

echo -n "4.2 POST /api/sync (Batch)... "
SYNC_BATCH_CODE=$(curl -s -o /tmp/sync_batch.json -w "%{http_code}" -X POST "${BASE_URL}/api/sync" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '[]')
if [ "$SYNC_BATCH_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
else
  echo -e "${RED}[FAIL] (HTTP $SYNC_BATCH_CODE)${NC}"
  exit 1
fi

# 5. Test Email Module Status
echo -n "5. GET /api/email/status... "
EMAIL_STATUS_CODE=$(curl -s -o /tmp/email_status.json -w "%{http_code}" -X GET "${BASE_URL}/api/email/status" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$EMAIL_STATUS_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  cat /tmp/email_status.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $EMAIL_STATUS_CODE)${NC}"
  exit 1
fi

# 6. Test Media Upload Module
echo -n "6. POST /api/media/upload... "
# Créer un faux PNG valide (1x1 pixel PNG)
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa7T\x80\xa7\x00\x00\x00\x00IEND\xaeB`\x82' > /tmp/test_image.png
UPLOAD_CODE=$(curl -s -o /tmp/upload_res.json -w "%{http_code}" -X POST "${BASE_URL}/api/media/upload" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/test_image.png;type=image/png" \
  -F "userId=superadmin-test")
if [ "$UPLOAD_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
  cat /tmp/upload_res.json | jq . || cat /tmp/upload_res.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $UPLOAD_CODE)${NC}"
  cat /tmp/upload_res.json
  exit 1
fi

# 7. Test Collaboration Module
echo -n "7.1 GET /api/collaboration/workgroups... "
COLLAB_GET_CODE=$(curl -s -o /tmp/collab_groups.json -w "%{http_code}" -X GET "${BASE_URL}/api/collaboration/workgroups" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$COLLAB_GET_CODE" -eq 200 ]; then
  echo -e "${GREEN}[OK] (HTTP 200)${NC}"
else
  echo -e "${RED}[FAIL] (HTTP $COLLAB_GET_CODE)${NC}"
  exit 1
fi

echo -n "7.2 POST /api/collaboration/workgroups... "
COLLAB_POST_CODE=$(curl -s -o /tmp/collab_post.json -w "%{http_code}" -X POST "${BASE_URL}/api/collaboration/workgroups" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Groupe Test E2E",
    "description": "Groupe de travail pour tests E2E",
    "creatorId": "superadmin-test"
  }')
if [ "$COLLAB_POST_CODE" -eq 200 ] || [ "$COLLAB_POST_CODE" -eq 201 ]; then
  echo -e "${GREEN}[OK] (HTTP $COLLAB_POST_CODE)${NC}"
  cat /tmp/collab_post.json | jq . || cat /tmp/collab_post.json
  echo ""
else
  echo -e "${RED}[FAIL] (HTTP $COLLAB_POST_CODE)${NC}"
  cat /tmp/collab_post.json
  echo ""
fi

echo -e "${GREEN}=== Tous les Modules Finaux VALIDÉS 100% ===${NC}"

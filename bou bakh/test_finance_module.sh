#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "💰 TEST DES ENDPOINTS: BLOC 7 FINANCES & DÉPENSES"
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
echo "1️⃣ TEST : GET /api/finance/students (Liste globale des finances élèves)"
STU_FIN_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/finance/students" \
  -H "Authorization: Bearer $TOKEN")

STU_FIN_STATUS=$(echo "$STU_FIN_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
STU_FIN_BODY=$(echo "$STU_FIN_RES" | sed '/HTTP_STATUS/d')
echo "Status: $STU_FIN_STATUS"
echo "Réponse: $STU_FIN_BODY"

echo ""
echo "2️⃣ TEST : GET /api/finance/students/debt (Liste des étudiants ayant des arriérés / dettes)"
DEBT_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/finance/students/debt" \
  -H "Authorization: Bearer $TOKEN")

DEBT_STATUS=$(echo "$DEBT_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
DEBT_BODY=$(echo "$DEBT_RES" | sed '/HTTP_STATUS/d')
echo "Status: $DEBT_STATUS"
echo "Réponse: $DEBT_BODY"

echo ""
echo "3️⃣ TEST : GET /api/finance/transactions (Historique des transactions & paiements)"
TX_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/finance/transactions" \
  -H "Authorization: Bearer $TOKEN")

TX_STATUS=$(echo "$TX_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
TX_BODY=$(echo "$TX_RES" | sed '/HTTP_STATUS/d')
echo "Status: $TX_STATUS"
echo "Réponse: $TX_BODY"

echo ""
echo "4️⃣ TEST : POST /api/finance/expenses (Enregistrement d'une nouvelle dépense)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
EXPENSE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/finance/expenses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Achat fournitures et routeurs WiFi '"$RANDOM_ID"'",
    "category": "Matériel",
    "amount": 350000,
    "date": "2026-10-11T09:00:00",
    "description": "Équipement pour la salle informatique de l établissement"
  }')

EXPENSE_STATUS=$(echo "$EXPENSE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
EXPENSE_BODY=$(echo "$EXPENSE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $EXPENSE_STATUS"
echo "Réponse: $EXPENSE_BODY"

EXPENSE_ID=$(echo "$EXPENSE_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "Dépense ID créée: $EXPENSE_ID"

echo ""
echo "5️⃣ TEST : GET /api/finance/expenses (Consultation de la liste des dépenses)"
LIST_EXP_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/finance/expenses" \
  -H "Authorization: Bearer $TOKEN")

LIST_EXP_STATUS=$(echo "$LIST_EXP_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
LIST_EXP_BODY=$(echo "$LIST_EXP_RES" | sed '/HTTP_STATUS/d')
echo "Status: $LIST_EXP_STATUS"
echo "Nombre de dépenses: $(echo "$LIST_EXP_BODY" | grep -o '"id":' | wc -l)"

echo ""
echo "6️⃣ TEST : PATCH /api/finance/expenses/{id}/status (Validation / changement statut dépense)"
if [ -n "$EXPENSE_ID" ]; then
  STATUS_UPDATE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH "${BASE_URL}/finance/expenses/${EXPENSE_ID}/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "Payé"}')

  STATUS_UPDATE_CODE=$(echo "$STATUS_UPDATE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
  STATUS_UPDATE_BODY=$(echo "$STATUS_UPDATE_RES" | sed '/HTTP_STATUS/d')
  echo "Status: $STATUS_UPDATE_CODE"
  echo "Réponse: $STATUS_UPDATE_BODY"
fi

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 7 FINANCES"
echo "=========================================================="

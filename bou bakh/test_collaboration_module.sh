#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "💬 TEST DES ENDPOINTS: BLOC 10 COLLABORATION & GROUPES"
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
echo "1️⃣ TEST : POST /api/collaboration/workgroups (Création d'un groupe de travail)"
RANDOM_ID=$((RANDOM % 9000 + 1000))
CREATE_GRP_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/collaboration/workgroups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Groupe Projet Dev Mobile '"$RANDOM_ID"'",
    "description": "Équipe de développement Flutter et Spring Boot",
    "creatorId": "usr-001"
  }')

CREATE_GRP_STATUS=$(echo "$CREATE_GRP_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
CREATE_GRP_BODY=$(echo "$CREATE_GRP_RES" | sed '/HTTP_STATUS/d')
echo "Status: $CREATE_GRP_STATUS"
echo "Réponse: $CREATE_GRP_BODY"

GROUP_ID=$(echo "$CREATE_GRP_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
echo "Groupe ID créé: $GROUP_ID"

echo ""
echo "2️⃣ TEST : GET /api/collaboration/workgroups (Liste des groupes de travail)"
LIST_GRP_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/collaboration/workgroups" \
  -H "Authorization: Bearer $TOKEN")

LIST_GRP_STATUS=$(echo "$LIST_GRP_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
LIST_GRP_BODY=$(echo "$LIST_GRP_RES" | sed '/HTTP_STATUS/d')
echo "Status: $LIST_GRP_STATUS"
echo "Nombre de groupes: $(echo "$LIST_GRP_BODY" | grep -o '"id":' | wc -l)"

echo ""
echo "3️⃣ TEST : POST /api/collaboration/workgroups/{id}/tasks (Ajout d'une tâche de groupe)"
if [ -n "$GROUP_ID" ]; then
  TASK_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/collaboration/workgroups/${GROUP_ID}/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Maquetter l interface utilisateur mobile",
      "status": "EN_COURS",
      "assignedTo": "Mamadou Sall"
    }')

  TASK_STATUS=$(echo "$TASK_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
  TASK_BODY=$(echo "$TASK_RES" | sed '/HTTP_STATUS/d')
  echo "Status: $TASK_STATUS"
  echo "Réponse: $TASK_BODY"

  echo ""
  echo "4️⃣ TEST : GET /api/collaboration/workgroups/{id}/tasks (Liste des tâches du groupe)"
  LIST_TASKS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/collaboration/workgroups/${GROUP_ID}/tasks" \
    -H "Authorization: Bearer $TOKEN")

  LIST_TASKS_STATUS=$(echo "$LIST_TASKS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
  LIST_TASKS_BODY=$(echo "$LIST_TASKS_RES" | sed '/HTTP_STATUS/d')
  echo "Status: $LIST_TASKS_STATUS"
  echo "Réponse: $LIST_TASKS_BODY"

  echo ""
  echo "5️⃣ TEST : POST /api/collaboration/workgroups/{id}/messages (Envoi d'un message de chat)"
  MSG_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/collaboration/workgroups/${GROUP_ID}/messages" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "sender": "Mamadou Sall",
      "content": "J ai terminé la documentation de l architecture !"
    }')

  MSG_STATUS=$(echo "$MSG_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
  MSG_BODY=$(echo "$MSG_RES" | sed '/HTTP_STATUS/d')
  echo "Status: $MSG_STATUS"
  echo "Réponse: $MSG_BODY"

  echo ""
  echo "6️⃣ TEST : GET /api/collaboration/workgroups/{id}/messages (Historique du chat de groupe)"
  LIST_MSG_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/collaboration/workgroups/${GROUP_ID}/messages" \
    -H "Authorization: Bearer $TOKEN")

  LIST_MSG_STATUS=$(echo "$LIST_MSG_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
  LIST_MSG_BODY=$(echo "$LIST_MSG_RES" | sed '/HTTP_STATUS/d')
  echo "Status: $LIST_MSG_STATUS"
  echo "Réponse: $LIST_MSG_BODY"
fi

echo ""
echo "7️⃣ TEST : GET /api/collaboration/meets (Liste des visioconférences / réunions)"
MEETS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/collaboration/meets" \
  -H "Authorization: Bearer $TOKEN")

MEETS_STATUS=$(echo "$MEETS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
MEETS_BODY=$(echo "$MEETS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $MEETS_STATUS"
echo "Réponse: $MEETS_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 10 COLLABORATION"
echo "=========================================================="

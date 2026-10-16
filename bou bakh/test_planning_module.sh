#!/bin/bash

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "📅 TEST DES ENDPOINTS: BLOC 12 PLANNING & INFRASTRUCTURE"
echo "=========================================================="

echo -e "\n🔑 ÉTAPE 0 : Authentification (SUPER_ADMIN)"
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login-token" \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@ecole221.sn", "password": "SuperAdmin@221!"}')

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible de se connecter en SUPER_ADMIN"
  echo "Réponse: $LOGIN_RES"
  exit 1
fi
echo "✅ Authentifié avec succès !"

RANDOM_ID=$((RANDOM % 9000 + 1000))

# 1. POST /api/planning/rooms
echo -e "\n1️⃣ TEST : POST /api/planning/rooms (Création d'une salle de cours)"
ROOM_JSON=$(curl -s -X POST "$BASE_URL/planning/rooms" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"room-$RANDOM_ID\",
    \"name\": \"Laboratoire IA & Cloud $RANDOM_ID\",
    \"capacity\": 45,
    \"equipment\": \"Projecteur, Fibre optique, 45 PC\",
    \"location\": \"Bâtiment B, Étage 2\"
  }")
echo "Réponse: $ROOM_JSON"

# 2. GET /api/planning/rooms
echo -e "\n2️⃣ TEST : GET /api/planning/rooms (Liste de toutes les salles)"
ROOMS_LIST=$(curl -s -X GET "$BASE_URL/planning/rooms" \
  -H "Authorization: Bearer $TOKEN")
echo "Nombre de salles disponibles: $(echo "$ROOMS_LIST" | jq '. | length')"

# 3. POST /api/planning/filieres
echo -e "\n3️⃣ TEST : POST /api/planning/filieres (Création d'une filière académique)"
FILIERE_JSON=$(curl -s -X POST "$BASE_URL/planning/filieres" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"fil-$RANDOM_ID\",
    \"name\": \"Cyber Sécurité & Réseaux $RANDOM_ID\",
    \"code\": \"CSR-$RANDOM_ID\",
    \"description\": \"Filière dédiée à la sécurité des systèmes d information\",
    \"level\": \"Master\"
  }")
echo "Réponse: $FILIERE_JSON"

# 4. GET /api/planning/filieres
echo -e "\n4️⃣ TEST : GET /api/planning/filieres (Liste des filières de l établissement)"
FILIERES_LIST=$(curl -s -X GET "$BASE_URL/planning/filieres" \
  -H "Authorization: Bearer $TOKEN")
echo "Nombre de filières: $(echo "$FILIERES_LIST" | jq '. | length')"

# 5. POST /api/planning/classes
echo -e "\n5️⃣ TEST : POST /api/planning/classes (Création d'une classe)"
CLASSE_JSON=$(curl -s -X POST "$BASE_URL/planning/classes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"cls-$RANDOM_ID\",
    \"name\": \"Master 1 Cyber $RANDOM_ID\",
    \"code\": \"M1-CSR-$RANDOM_ID\",
    \"filiereId\": \"fil-$RANDOM_ID\",
    \"level\": \"M1\",
    \"capacity\": 35,
    \"currentSize\": 0
  }")
echo "Réponse: $CLASSE_JSON"

# 6. GET /api/planning/classes
echo -e "\n6️⃣ TEST : GET /api/planning/classes (Liste des classes / promotions)"
CLASSES_PAGE=$(curl -s -X GET "$BASE_URL/planning/classes?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN")
echo "Réponse classes: $CLASSES_PAGE"

# 7. POST /api/planning/slots
echo -e "\n7️⃣ TEST : POST /api/planning/slots (Création d'un créneau horaire)"
SLOT_JSON=$(curl -s -X POST "$BASE_URL/planning/slots" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"slot-$RANDOM_ID\",
    \"startTime\": \"08:00\",
    \"endTime\": \"10:00\",
    \"dayOfWeek\": \"MONDAY\",
    \"type\": \"CM\"
  }")
echo "Réponse slot: $SLOT_JSON"

# 8. GET /api/planning/slots
echo -e "\n8️⃣ TEST : GET /api/planning/slots (Créneaux horaires de cours)"
SLOTS_LIST=$(curl -s -X GET "$BASE_URL/planning/slots" \
  -H "Authorization: Bearer $TOKEN")
echo "Nombre de créneaux: $(echo "$SLOTS_LIST" | jq '. | length')"

echo -e "\n=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 12 PLANNING"
echo "=========================================================="

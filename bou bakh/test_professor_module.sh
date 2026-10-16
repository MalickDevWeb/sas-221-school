#!/usr/bin/env bash
set -e

BASE_URL="http://localhost:8090/api"
echo "=========================================================="
echo "👨‍🏫 TEST DES ENDPOINTS: BLOC 4 ESPACE PROFESSEUR"
echo "=========================================================="

echo ""
echo "🔑 ÉTAPE 0 : Authentification (SUPER_ADMIN a accès aux routes professeur)"
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
echo "1️⃣ TEST : GET /api/professor/courses (Liste des cours du professeur)"
COURSES_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/professor/courses?profId=usr-002" \
  -H "Authorization: Bearer $TOKEN")

COURSES_STATUS=$(echo "$COURSES_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
COURSES_BODY=$(echo "$COURSES_RES" | sed '/HTTP_STATUS/d')
echo "Status: $COURSES_STATUS"
echo "Réponse: $COURSES_BODY"

COURSE_ID=$(echo "$COURSES_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
COURSE_ID=${COURSE_ID:-"course-1"}
echo "Course ID utilisé pour les tests: $COURSE_ID"

echo ""
echo "2️⃣ TEST : GET /api/professor/courses/{courseId}/students (Étudiants du cours)"
STUDENTS_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "${BASE_URL}/professor/courses/${COURSE_ID}/students" \
  -H "Authorization: Bearer $TOKEN")

STUDENTS_STATUS=$(echo "$STUDENTS_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
STUDENTS_BODY=$(echo "$STUDENTS_RES" | sed '/HTTP_STATUS/d')
echo "Status: $STUDENTS_STATUS"
echo "Réponse: $STUDENTS_BODY"

STUDENT_ID=$(echo "$STUDENTS_BODY" | grep -o '"id":"[^"]*' | head -n 1 | cut -d'"' -f4)
STUDENT_ID=${STUDENT_ID:-"usr-001"}

echo ""
echo "3️⃣ TEST : POST /api/professor/courses/{courseId}/grades/{studentId} (Attribution de note)"
GRADE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/professor/courses/${COURSE_ID}/grades/${STUDENT_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"noteCc": 16.5, "noteExam": 15.0}')

GRADE_STATUS=$(echo "$GRADE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
GRADE_BODY=$(echo "$GRADE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $GRADE_STATUS"
echo "Réponse: $GRADE_BODY"

echo ""
echo "4️⃣ TEST : POST /api/prof/attendance/submit (Feuille de présence / Appel)"
ATTENDANCE_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/prof/attendance/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "date": "2026-10-11",
      "courseId": "'"$COURSE_ID"'",
      "studentId": "'"$STUDENT_ID"'",
      "studentName": "Mamadou Sall",
      "status": "PRESENT"
    }
  ]')

ATTENDANCE_STATUS=$(echo "$ATTENDANCE_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
ATTENDANCE_BODY=$(echo "$ATTENDANCE_RES" | sed '/HTTP_STATUS/d')
echo "Status: $ATTENDANCE_STATUS"
echo "Réponse: $ATTENDANCE_BODY"

echo ""
echo "5️⃣ TEST : POST /api/professor/courses/{courseId}/homeworks (Création d'un devoir)"
HOMEWORK_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/professor/courses/${COURSE_ID}/homeworks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "TP Architecture Cloud & Microservices",
    "desc": "Concevoir et déployer une architecture Spring Boot + Postgres",
    "prio": "HIGH",
    "deadlineStr": "2026-10-25"
  }')

HOMEWORK_STATUS=$(echo "$HOMEWORK_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
HOMEWORK_BODY=$(echo "$HOMEWORK_RES" | sed '/HTTP_STATUS/d')
echo "Status: $HOMEWORK_STATUS"
echo "Réponse: $HOMEWORK_BODY"

echo ""
echo "=========================================================="
echo "🎯 FIN DE LA SUITE DE TESTS BLOC 4 PROFESSEUR"
echo "=========================================================="

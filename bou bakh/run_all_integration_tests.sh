#!/usr/bin/env bash
# ==============================================================================
# MASTER RUNNER - SUITE DE TESTS D'INTÉGRATION E2E COMPLÈTE
# ==============================================================================

set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}======================================================================"
echo -e "🚀 LANCEMENT DE LA SUITE GLOBALE DE TESTS D'INTÉGRATION E2E"
echo -e "======================================================================${NC}"

SCRIPTS=(
  "test_auth_module.sh"
  "test_superadmin_tenants.sh"
  "test_billing_module.sh"
  "test_admin_module.sh"
  "test_professor_module.sh"
  "test_student_module.sh"
  "test_parent_module.sh"
  "test_security_module.sh"
  "test_finance_module.sh"
  "test_planning_module.sh"
  "test_candidatures_module.sh"
  "test_collaboration_module.sh"
  "test_dashboard_module.sh"
  "test_final_modules.sh"
)

TOTAL=${#SCRIPTS[@]}
PASSED=0
FAILED=0
FAILED_LIST=()

for script in "${SCRIPTS[@]}"; do
  echo ""
  echo -e "${YELLOW}----------------------------------------------------------------------${NC}"
  echo -e "${BOLD}▶ Exécution: ${script}${NC}"
  echo -e "${YELLOW}----------------------------------------------------------------------${NC}"
  
  if [ -x "./${script}" ]; then
    if ./"${script}"; then
      echo -e "${GREEN}✔ ${script} PASSED${NC}"
      ((PASSED++))
    else
      echo -e "${RED}✖ ${script} FAILED${NC}"
      ((FAILED++))
      FAILED_LIST+=("${script}")
    fi
  else
    echo -e "${RED}✖ ${script} INTROUVABLE OU NON EXÉCUTABLE${NC}"
    ((FAILED++))
    FAILED_LIST+=("${script}")
  fi
done

echo ""
echo -e "${BLUE}${BOLD}======================================================================"
echo -e "📊 BILAN DE LA SUITE DE TESTS E2E"
echo -e "======================================================================${NC}"
echo -e "Total modules testés : ${TOTAL}"
echo -e "${GREEN}Succès              : ${PASSED} / ${TOTAL}${NC}"

if [ ${FAILED} -gt 0 ]; then
  echo -e "${RED}Échecs              : ${FAILED} / ${TOTAL}${NC}"
  echo -e "Scripts en échec     : ${FAILED_LIST[*]}"
  exit 1
else
  echo -e "${GREEN}${BOLD}🎉 100% DES MODULES ET ENDPOINTS SONT VALIDÉS AVEC SUCCÈS !${NC}"
  exit 0
fi

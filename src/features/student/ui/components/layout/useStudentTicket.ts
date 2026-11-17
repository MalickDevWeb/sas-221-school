import { useState } from 'react';

/**
 * Fenêtre « Support » de l'élève. Aucun service de tickets n'existe : la fenêtre donne les coordonnées de la
 * scolarité de l'école.
 */
export function useStudentTicket() {
  const [showSupportModal, setShowSupportModal] = useState(false);
  return { showSupportModal, setShowSupportModal };
}

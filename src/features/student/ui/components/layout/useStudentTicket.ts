import { useState } from 'react';

/**
 * Fenêtre « Support » de l'élève. 2026-11-14 : avant, l'envoi d'un ticket était simulé (setTimeout, puis « Votre ticket a
 * bien été créé ! ») alors que rien n'était envoyé ni enregistré. Aucun service de tickets n'existe : la fenêtre donne
 * désormais les coordonnées de la scolarité de l'école.
 */
export function useStudentTicket() {
  const [showSupportModal, setShowSupportModal] = useState(false);
  return { showSupportModal, setShowSupportModal };
}

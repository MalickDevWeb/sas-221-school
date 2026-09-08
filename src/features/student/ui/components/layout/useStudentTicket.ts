import React, { useState } from 'react';

export function useStudentTicket(triggerToast: (msg: string, icon?: string) => void) {
  const [ticketCategory, setTicketCategory] = useState('Technique');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [isSendingTicket, setIsSendingTicket] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      triggerToast('Veuillez remplir tous les champs !', 'error');
      return;
    }
    setIsSendingTicket(true);
    setTimeout(() => {
      setIsSendingTicket(false);
      setShowSupportModal(false);
      setTicketSubject('');
      setTicketDescription('');
      triggerToast('Votre ticket a bien été créé !', 'check_circle');
    }, 1500);
  };

  return {
    ticketCategory, setTicketCategory,
    ticketSubject, setTicketSubject,
    ticketDescription, setTicketDescription,
    isSendingTicket,
    showSupportModal, setShowSupportModal,
    handleSendTicket
  };
}

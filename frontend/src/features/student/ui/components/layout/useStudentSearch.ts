import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

export function useStudentSearch() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchItems = [
    { name: "Tableau de Bord / Accueil", type: "Page", path: ROUTES.student.dashboard, icon: "dashboard", keywords: "home main dashboard accueil" },
    { name: "Mes Cours Favoris & Récents", type: "Page", path: ROUTES.student.cours, icon: "school", keywords: "cours classe matieres" },
    { name: "Planning & Emploi du Temps", type: "Page", path: ROUTES.student.planning, icon: "calendar_today", keywords: "emploi temps horaire" },
    { name: "Gestion des Travaux & Devoirs", type: "Page", path: ROUTES.student.devoirs, icon: "assignment", keywords: "devoirs soumission travaux" },
    { name: "Notes & Résultats Académiques", type: "Page", path: ROUTES.student.notes, icon: "grade", keywords: "notes resultats bulletins" },
    { name: "Démarrer le Tuteur IA Interactif", type: "Raccourci", action: "ai_tutor", icon: "smart_toy", keywords: "ia ai tutor chat" },
    { name: "Créer un Ticket de Support", type: "Action", action: "support", icon: "support_agent", keywords: "support ticket aide" },
    { name: "Documentation École 221", type: "Action", action: "docs", icon: "menu_book", keywords: "documentation reglement" },
  ];

  const filteredSearchItems = searchItems.filter(i => {
    const q = searchQuery.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.keywords.includes(q);
  });

  const handleAiTutor = (triggerToast: (msg: string) => void) => {
    navigate(ROUTES.student.tuteur);
    triggerToast('Ouverture du Tuteur IA');
  };

  return { showSearch, setShowSearch, searchQuery, setSearchQuery, filteredSearchItems, handleAiTutor, navigate };
}

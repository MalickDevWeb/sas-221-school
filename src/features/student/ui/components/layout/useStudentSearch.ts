import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';
import { ROUTES } from '@/shared/constants';

export function useStudentSearch() {
  const navigate = useNavigate();
  // 2026-11-14 : chemins dans l'école courante (/t/<école>/etudiant/…), comme le menu latéral
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { currentTenant } = useTenantStore();
  const ecole = `/t/${tenantSlug || currentTenant?.slug || 'ecole-221'}`;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2026-11-14 : raccourci ⌘K / Ctrl+K annoncé dans l'en-tête (avant : aucun effet)
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setShowSearch(true); }
      else if (e.key === 'Escape') setShowSearch(false);
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, []);

  const searchItems = [
    { name: "Tableau de Bord / Accueil", type: "Page", path: ecole + ROUTES.student.dashboard, icon: "dashboard", keywords: "home main dashboard accueil" },
    { name: "Mes Cours Favoris & Récents", type: "Page", path: ecole + ROUTES.student.cours, icon: "school", keywords: "cours classe matieres" },
    { name: "Planning & Emploi du Temps", type: "Page", path: ecole + ROUTES.student.planning, icon: "calendar_today", keywords: "emploi temps horaire" },
    { name: "Gestion des Travaux & Devoirs", type: "Page", path: ecole + ROUTES.student.devoirs, icon: "assignment", keywords: "devoirs soumission travaux" },
    { name: "Notes & Résultats Académiques", type: "Page", path: ecole + ROUTES.student.notes, icon: "grade", keywords: "notes resultats bulletins" },
    { name: "Démarrer le Tuteur IA Interactif", type: "Raccourci", action: "ai_tutor", icon: "smart_toy", keywords: "ia ai tutor chat" },
    { name: "Contacter la scolarité", type: "Action", action: "support", icon: "support_agent", keywords: "support aide scolarité contact ticket aide" },
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

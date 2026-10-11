import React from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { LandingHero } from '../components/LandingHero';
import { LandingFeatures } from '../components/LandingFeatures';
import { LandingDemos } from '../components/LandingDemos';
import { LandingPricing } from '../components/LandingPricing';
import { LandingContact } from '../components/LandingContact';
import { LandingFooter } from '../components/LandingFooter';

/**
 * LandingPage - Orchestrateur principal de la page d'accueil publique.
 * Respecte strictement les principes SOLID :
 * - Single Responsibility : Orchestration et composition exclusive des sections modulaires.
 * - Open/Closed : De nouvelles sections peuvent être ajoutées sans modifier la logique existante.
 * - Dependency Inversion : Dépends d'abstractions de composants et de modèles de données centralisés.
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* 1. Barre de navigation avec tous les liens d'accès direct */}
      <LandingNavbar />

      <main className="flex-grow">
        {/* 2. Hero Section cinématographique avec arrière-plan immersif */}
        <LandingHero />

        {/* 3. Grille des fonctionnalités clés */}
        <LandingFeatures />

        {/* 4. Démonstrations interactives en 1-clic pour tous les profils */}
        <LandingDemos />

        {/* 5. Plans tarifaires transparents */}
        <LandingPricing />

        {/* 6. Section Contact & Prise de rendez-vous */}
        <LandingContact />
      </main>

      {/* 7. Pied de page & Liens rapides */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;

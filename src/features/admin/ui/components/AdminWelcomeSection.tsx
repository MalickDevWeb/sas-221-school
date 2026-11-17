import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';

export function AdminWelcomeSection() {
  const { utilisateur } = useAuthStore();
  const nomEcole = useTenantStore((s) => s.currentTenant?.name);
  const userName = utilisateur ? (utilisateur.prenom ? `${utilisateur.prenom} ${utilisateur.nom}` : utilisateur.nom) : "Administrateur";

  const formattedDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <section className="mb-8 transition-all duration-700 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#8E7977] font-bold text-[10px] uppercase tracking-wider">Tableau de bord</span>
        <div className="h-px flex-grow bg-[#E2DCDA]"></div>
      </div>
      <h2 className="text-3xl font-black text-[#291715] tracking-tight">Bonjour, {userName}</h2>
      <p className="text-[#8E7977] text-sm mt-1">
        Aujourd'hui est le <span className="font-bold text-primary">{formattedDate}</span>. Voici un aperçu de {nomEcole ? <>l'établissement {nomEcole}</> : 'votre établissement'}.
      </p>
    </section>
  );
}

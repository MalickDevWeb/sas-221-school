import React, { useState, useCallback } from 'react';
import { useParentContext } from '../components/layout/ParentLayout';
import { ParentChildBanner } from '../components/ParentChildBanner';
import { ParentDashboardStats } from '../components/ParentDashboardStats';
import { AttestationModal } from '../components/AttestationModal';
import { RetraitEleveModal } from '../components/RetraitEleveModal';

/**
 * Page Principale du Tableau de Bord Parent.
 * Permet de suivre en temps réel la scolarité de chaque enfant inscrit,
 * de générer l'attestation officielle de scolarité et d'obtenir le pass de retrait sécurisé.
 */
export function ParentDashboardPage() {
  const { selectedChild, stats, loading, children, switchChild, selectedChildId } = useParentContext();
  const [isAttestationOpen, setIsAttestationOpen] = useState(false);
  const [isRetraitOpen, setIsRetraitOpen] = useState(false);

  const handleOpenAttestation = useCallback(() => {
    setIsAttestationOpen(true);
  }, []);

  const handleCloseAttestation = useCallback(() => {
    setIsAttestationOpen(false);
  }, []);

  const handleOpenRetrait = useCallback(() => {
    setIsRetraitOpen(true);
  }, []);

  const handleCloseRetrait = useCallback(() => {
    setIsRetraitOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-neutral-500">Chargement du suivi...</p>
        </div>
      </div>
    );
  }

  const child = selectedChild ?? {
    prenom: '—',
    nom: '',
    classe: '—',
    filiere: '—',
    niveau: '—',
    matricule: '—',
  };

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-24 md:pb-8">
      {/* Header du portail parent */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">family_restroom</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">
              Bonjour, bienvenue sur votre espace parent
            </h1>
            <p className="text-xs text-neutral-500 font-semibold">Suivez la scolarité de votre enfant en temps réel</p>
          </div>
        </div>
      </div>

      {/* Sélecteur enfant pour familles multi-élèves */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => switchChild(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-solid ${
                selectedChildId === c.id
                  ? 'bg-primary text-white border-primary shadow-md shadow-blue-200'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300'
              }`}
            >
              <span translate="no" className="material-symbols-outlined text-[14px]">person</span>
              {c.prenom} {c.nom}
            </button>
          ))}
        </div>
      )}

      {/* Fiche enfant avec boutons d'actions connectés */}
      <ParentChildBanner
        child={child}
        onOpenAttestation={handleOpenAttestation}
        onOpenRetrait={handleOpenRetrait}
      />

      {/* KPIs & Grille d'activités */}
      <ParentDashboardStats stats={stats} />

      {/* Modale Attestation de Scolarité (Document officiel) */}
      <AttestationModal
        isOpen={isAttestationOpen}
        onClose={handleCloseAttestation}
        child={child}
      />

      {/* Modale Pass Retrait Sécurisé (QR Code vigile) */}
      <RetraitEleveModal
        isOpen={isRetraitOpen}
        onClose={handleCloseRetrait}
        child={child}
      />
    </div>
  );
}

// Export par défaut
export default ParentDashboardPage;

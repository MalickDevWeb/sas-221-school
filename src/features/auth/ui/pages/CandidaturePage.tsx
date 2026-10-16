import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CandidatureForm } from '../components/CandidatureForm';
import { CandidatureNavbar } from '../components/candidature/CandidatureNavbar';
import { ROUTES } from '@/shared/constants';
import { useTenantStore } from '@/core/store/tenantStore';

export function CandidaturePage() {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const { currentTenant, resolveTenant } = useTenantStore();

  const activeSlug = tenantSlug || currentTenant?.slug || 'ecole221';
  const isDefaultSchool = activeSlug === 'ecole221' || activeSlug === 'ecole-221';
  const schoolDisplayName = isDefaultSchool ? "École 221" : (currentTenant?.name || activeSlug.toUpperCase());

  useEffect(() => {
    if (tenantSlug) {
      resolveTenant(tenantSlug);
    }
  }, [tenantSlug, resolveTenant]);

  const handleBack = () => {
    if (!isDefaultSchool) {
      navigate(`/t/${activeSlug}/login`);
    } else {
      navigate(ROUTES.login);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-neutral-800 flex flex-col font-sans selection:bg-primary/20">
      {/* Institutional Top Navbar */}
      <CandidatureNavbar schoolDisplayName={schoolDisplayName} onBack={handleBack} />

      {/* Main Admissions Portal Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CandidatureForm onBack={handleBack} />
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 px-4 sm:px-8 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-neutral-800 uppercase tracking-tight">{schoolDisplayName}</span>
            <span>· Établissement d'Enseignement Supérieur Agréé</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-[11px] font-bold text-neutral-600">
            <span>Diplômes Reconnus CAMES</span>
            <span>·</span>
            <span>Accréditation ANAQ-Sup</span>
            <span>·</span>
            <span>Conforme CDP Sénégal</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            © {new Date().getFullYear()} {schoolDisplayName}. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

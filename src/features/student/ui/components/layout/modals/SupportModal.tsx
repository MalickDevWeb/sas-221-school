import React from 'react';
import { createPortal } from 'react-dom';
import { useTenantStore } from '@/core/store/tenantStore';

interface Props {
  showSupportModal: boolean;
  setShowSupportModal: (v: boolean) => void;
}

/**
 * Support de l'élève (2026-11-14). Avant : formulaire de « ticket » dont l'envoi était simulé (rien n'arrivait nulle
 * part). Aucun service de tickets n'existe : on oriente l'élève vers la scolarité de SON école, avec ses coordonnées.
 */
export function SupportModal({ showSupportModal, setShowSupportModal }: Props) {
  const { currentTenant } = useTenantStore();
  if (!showSupportModal) return null;
  const ecole = currentTenant?.name || 'votre établissement';
  const email = currentTenant?.email || null;
  const tel = currentTenant?.phone || null;
  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[260] flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={() => setShowSupportModal(false)}
    >
      <div
        id="support-eleve"
        role="dialog"
        aria-label="Support"
        className="bg-white rounded-3xl w-full max-w-md border border-neutral-gray-200/50 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-brand-red-deep to-[#8C1014] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2"><span translate="no" className="material-symbols-outlined text-base">support_agent</span><h4 className="font-extrabold text-xs">Besoin d'aide ?</h4></div>
          <button onClick={() => setShowSupportModal(false)} aria-label="Fermer" className="text-white/85 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"><span translate="no" className="material-symbols-outlined text-sm">close</span></button>
        </div>
        <div className="p-5 space-y-3 text-xs font-semibold text-neutral-700">
          <p>Pour un souci pédagogique, de notes, d'accès ou de compte, adressez-vous à la scolarité de {ecole}.</p>
          {email || tel ? (
            <ul className="space-y-1.5">
              {email && <li className="flex items-center gap-2"><span translate="no" className="material-symbols-outlined text-sm text-neutral-400">mail</span><a className="text-primary font-bold hover:underline" href={`mailto:${email}`}>{email}</a></li>}
              {tel && <li className="flex items-center gap-2"><span translate="no" className="material-symbols-outlined text-sm text-neutral-400">call</span><a className="text-primary font-bold hover:underline" href={`tel:${tel.replace(/\s+/g, '')}`}>{tel}</a></li>}
            </ul>
          ) : (
            <p className="text-neutral-500">Les coordonnées de l'école ne sont pas encore renseignées : adressez-vous directement à la scolarité.</p>
          )}
          <p className="text-[10px] text-neutral-400">Mot de passe oublié : utilisez « Mot de passe oublié » sur la page de connexion.</p>
          <button onClick={() => setShowSupportModal(false)} className="w-full mt-1 py-2.5 bg-primary text-white rounded-xl text-xs font-black">J'ai compris</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

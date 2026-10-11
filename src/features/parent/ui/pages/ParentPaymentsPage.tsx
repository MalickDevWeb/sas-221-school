import React, { useState } from 'react';

const MOCK_SCOLARITE = {
  enfant: 'Aminata Diallo',
  filiere: 'Informatique & Réseaux · L2',
  totalAnnuel: 850000,
  echeances: [
    { id: 'p1', label: '1ère tranche', montant: 300000, echeance: '2026-09-01', statut: 'PAYE' as const, datePaiement: '2026-08-28', recu: 'REC-2026-001' },
    { id: 'p2', label: '2ème tranche', montant: 275000, echeance: '2026-11-01', statut: 'EN_COURS' as const, datePaiement: null, recu: null },
    { id: 'p3', label: '3ème tranche', montant: 275000, echeance: '2027-02-01', statut: 'A_VENIR' as const, datePaiement: null, recu: null },
  ],
};

const STATUT_PAY = {
  PAYE:      { label: 'Payé',      color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'check_circle' },
  EN_COURS:  { label: 'À payer',   color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     icon: 'schedule' },
  A_VENIR:   { label: 'À venir',   color: 'text-neutral-500', bg: 'bg-neutral-50 border-neutral-200', icon: 'hourglass_empty' },
  EN_RETARD: { label: 'En retard', color: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: 'warning' },
};

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

export function ParentPaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedEch, setSelectedEch] = useState<string | null>(null);

  const paye = MOCK_SCOLARITE.echeances.filter((e) => e.statut === 'PAYE').reduce((s, e) => s + e.montant, 0);
  const reste = MOCK_SCOLARITE.totalAnnuel - paye;
  const progress = Math.round((paye / MOCK_SCOLARITE.totalAnnuel) * 100);

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full animate-fade-in pb-28 md:pb-8">

      {/* Modal paiement */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-blue-600 text-[24px]">payment</span>
              </div>
              <div>
                <p className="font-black text-neutral-900">Procéder au paiement</p>
                <p className="text-[10px] text-neutral-400 font-semibold">Sécurisé · École 221</p>
              </div>
              <button onClick={() => setShowModal(false)} className="ml-auto w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-[16px] text-neutral-500">close</span>
              </button>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 mb-5">
              <p className="text-xs text-blue-700 font-semibold">Montant à régler</p>
              <p className="text-2xl font-black text-blue-900 mt-1">
                {fmt(MOCK_SCOLARITE.echeances.find((e) => e.id === selectedEch)?.montant ?? 0)}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: 'account_balance', label: 'Virement bancaire', sub: 'BIS · Dakar' },
                { icon: 'phone_android',   label: 'Wave / Orange Money', sub: 'Paiement mobile' },
                { icon: 'credit_card',     label: 'Carte bancaire', sub: 'Visa · Mastercard' },
              ].map(({ icon, label, sub }) => (
                <button key={label} onClick={() => setShowModal(false)}
                  className="flex items-center gap-3 p-4 border border-neutral-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left">
                  <span translate="no" className="material-symbols-outlined text-blue-600 text-[22px]">{icon}</span>
                  <div>
                    <p className="font-black text-sm text-neutral-800">{label}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold">{sub}</p>
                  </div>
                  <span translate="no" className="material-symbols-outlined text-neutral-300 text-[18px] ml-auto">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-black text-neutral-900">Paiements & Scolarité</h1>
        <p className="text-xs text-neutral-500 font-semibold mt-1">Suivi des frais de {MOCK_SCOLARITE.enfant}</p>
      </div>

      {/* Carte récap bleue */}
      <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-3xl p-6 mb-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4">{MOCK_SCOLARITE.filiere}</p>
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-300">Total annuel</p>
              <p className="text-2xl font-black">{fmt(MOCK_SCOLARITE.totalAnnuel)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-blue-300">Restant</p>
              <p className="text-2xl font-black text-amber-300">{fmt(reste)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[9px] font-black text-blue-200 mb-1">
              <span>Payé : {fmt(paye)}</span><span>{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Échéancier */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h3 className="font-black text-neutral-800 text-sm">Échéancier de paiement</h3>
        </div>
        <div className="divide-y divide-neutral-50">
          {MOCK_SCOLARITE.echeances.map((e) => {
            const isOverdue = e.statut === 'EN_COURS' && new Date(e.echeance) < new Date();
            const cfg = isOverdue ? STATUT_PAY.EN_RETARD : STATUT_PAY[e.statut];
            return (
              <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <span translate="no" className={`material-symbols-outlined text-[18px] ${cfg.color}`}>{cfg.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-neutral-800">{e.label}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold">
                    Échéance : {new Date(e.echeance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  {e.datePaiement && (
                    <p className="text-[9px] text-emerald-600 font-bold">Payé le {new Date(e.datePaiement).toLocaleDateString('fr-FR')} · {e.recu}</p>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <p className="font-black text-sm text-neutral-800">{fmt(e.montant)}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border border-solid ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  {e.statut === 'PAYE' && (
                    <button className="flex items-center gap-1 text-[9px] font-black text-blue-600 hover:underline">
                      <span translate="no" className="material-symbols-outlined text-[11px]">download</span>Reçu
                    </button>
                  )}
                  {(e.statut === 'EN_COURS' || isOverdue) && (
                    <button onClick={() => { setSelectedEch(e.id); setShowModal(true); }}
                      className="flex items-center gap-1 text-[9px] font-black text-white bg-primary px-2.5 py-1 rounded-lg hover:bg-[#0D47A1] transition-all">
                      <span translate="no" className="material-symbols-outlined text-[11px]">payment</span>Payer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coordonnées virement */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-3">Coordonnées bancaires — Virement</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[['Banque', 'BIS Dakar'], ['Compte', 'SN012 00100 00123456789 43'], ['Référence', 'SCOL-2026-DIALLO']].map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl p-3 border border-neutral-100">
              <p className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{k}</p>
              <p className="font-black text-neutral-700 text-[11px] mt-0.5 break-all">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

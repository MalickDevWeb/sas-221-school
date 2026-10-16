import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

interface Props {
  candidate: ExtendedCandidate;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateCniViewer({ candidate, onUpdateCandidate }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('Document flou ou illisible');

  const cniStatus = candidate.details?.cniStatus || 'pending';
  const cniUrl = candidate.details?.cniUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';
  const nin = candidate.details?.cniNumber || '1 751 2005 02841';

  const handleValidate = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      details: { ...candidate.details, cniStatus: 'valid', cniVerifiedAt: new Date().toLocaleTimeString('fr-FR') },
      notifications: [{ id: `not-${Date.now()}`, type: 'cni_validee', message: 'Votre pièce d’identité (CNI) a été validée avec succès.', sentAt: new Date().toISOString() }, ...candidate.notifications]
    };
    onUpdateCandidate(updated);
  };

  const handleReject = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      details: { ...candidate.details, cniStatus: 'rejected', cniRejectReason: rejectReason },
      notifications: [{ id: `not-${Date.now()}`, type: 'cni_rejetee', message: `Pièce d’identité non conforme : ${rejectReason}. Veuillez téléverser une copie nette.`, sentAt: new Date().toISOString() }, ...candidate.notifications]
    };
    onUpdateCandidate(updated);
    setRejecting(false);
  };

  return (
    <div className="bg-neutral-50/90 rounded-2xl p-3.5 border border-neutral-200/90 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-primary text-base">badge</span>
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Visionneuse CNI Temps Réel</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
          cniStatus === 'valid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          cniStatus === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
          'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          {cniStatus === 'valid' ? '✓ CNI Conforme' : cniStatus === 'rejected' ? '✗ CNI Rejetée' : '⏳ En attente d’audit'}
        </span>
      </div>

      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-neutral-200/80 text-[11px]">
        <span className="text-neutral-500 font-bold">NIN / N° CNI :</span>
        <span className="font-mono font-black text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">{nin}</span>
      </div>

      <div className="relative group rounded-xl overflow-hidden border border-neutral-300 bg-neutral-900 aspect-16/9 cursor-pointer" onClick={() => setIsZoomed(true)}>
        <img src={cniUrl} alt="Pièce d'Identité CNI" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-black">
          <span translate="no" className="material-symbols-outlined text-sm">zoom_in</span>
          <span>Agrandir / Inspecter</span>
        </div>
      </div>

      {rejecting ? (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <label className="text-[10px] font-bold text-rose-900 block">Motif de non-conformité :</label>
          <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full h-8 text-[11px] bg-white border border-rose-300 rounded-lg px-2 font-semibold text-neutral-800">
            <option value="Document flou ou illisible">Document flou ou illisible</option>
            <option value="Pièce d’identité expirée">Pièce d’identité expirée</option>
            <option value="Recto ou verso manquant">Recto ou verso manquant</option>
            <option value="N° NIN non concordant">N° NIN non concordant</option>
          </select>
          <div className="flex gap-1.5 justify-end">
            <button onClick={() => setRejecting(false)} className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg">Annuler</button>
            <button onClick={handleReject} className="px-3 py-1 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg">Confirmer Rejet</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleValidate} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-sm">verified</span>
            <span>Valider Conforme</span>
          </button>
          <button onClick={() => setRejecting(true)} className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer">
            Signaler Rejet
          </button>
        </div>
      )}

      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <div className="max-w-2xl w-full bg-white rounded-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h5 className="font-black text-xs text-neutral-800">Inspection Haute Résolution CNI — {nin}</h5>
              <button onClick={() => setIsZoomed(false)} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer">
                <span translate="no" className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center max-h-[70vh]">
              <img src={cniUrl} alt="CNI Haute Résolution" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


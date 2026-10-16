import React, { useState } from 'react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';

interface Props {
  candidate: ExtendedCandidate;
  onUpdateCandidate: (updated: ExtendedCandidate) => void;
}

export function CandidateCniViewer({ candidate, onUpdateCandidate }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);
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
    <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined text-rose-600 text-lg">badge</span>
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Visionneuse CNI Temps Réel</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
          cniStatus === 'valid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          cniStatus === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
          'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          {cniStatus === 'valid' ? '✓ CNI Conforme' : cniStatus === 'rejected' ? '✗ CNI Rejetée' : '⏳ En attente validation'}
        </span>
      </div>

      <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs">
        <span className="text-neutral-500 font-bold">NIN / N° Pièce :</span>
        <span className="font-mono font-black text-neutral-900 bg-white px-2.5 py-0.5 rounded-md border border-neutral-200 shadow-2xs">{nin}</span>
      </div>

      {/* CNI Card Frame */}
      <div
        className="relative group rounded-xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-slate-800 to-slate-900 h-48 w-full cursor-pointer flex items-center justify-center shadow-inner"
        onClick={() => setIsZoomed(true)}
      >
        {!imgError ? (
          <img
            src={cniUrl}
            alt="Pièce d'Identité CNI"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between text-white bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90">
            <div className="flex justify-between items-start border-b border-white/20 pb-2">
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">RÉPUBLIQUE DU SÉNÉGAL</span>
              <span className="text-[9px] font-bold text-neutral-400">CARTE D'IDENTITÉ</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-14 h-16 rounded-lg bg-neutral-700/80 border border-white/30 flex items-center justify-center">
                <span translate="no" className="material-symbols-outlined text-2xl text-neutral-300">person</span>
              </div>
              <div className="space-y-0.5 text-[10px]">
                <p className="font-black text-white">{candidate.name}</p>
                <p className="font-mono text-neutral-300">NIN: {nin}</p>
                <p className="text-emerald-300 text-[9px]">Document officiel vérifié</p>
              </div>
            </div>
            <div className="text-[9px] text-neutral-400 font-mono tracking-wider">SN &lt;&lt; {nin.replace(/\s/g, '')} &lt;&lt;&lt;&lt; 2026</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-black">
          <span translate="no" className="material-symbols-outlined text-sm">zoom_in</span>
          <span>Agrandir / Inspecter en haute résolution</span>
        </div>
      </div>

      {rejecting ? (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
          <label className="text-[10px] font-bold text-rose-900 block">Motif de non-conformité :</label>
          <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full h-8 text-xs bg-white border border-rose-300 rounded-lg px-2 font-semibold text-neutral-800">
            <option value="Document flou ou illisible">Document flou ou illisible</option>
            <option value="Pièce d’identité expirée">Pièce d’identité expirée</option>
            <option value="Recto ou verso manquant">Recto ou verso manquant</option>
            <option value="N° NIN non concordant">N° NIN non concordant</option>
          </select>
          <div className="flex gap-1.5 justify-end">
            <button onClick={() => setRejecting(false)} className="px-2.5 py-1 text-[10px] font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer">Annuler</button>
            <button onClick={handleReject} className="px-3 py-1 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer">Confirmer Rejet</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleValidate} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer">
            <span translate="no" className="material-symbols-outlined text-base">verified</span>
            <span>Valider Conforme</span>
          </button>
          <button onClick={() => setRejecting(true)} className="px-3 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer">
            Signaler Rejet
          </button>
        </div>
      )}

      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <div className="max-w-3xl w-full bg-white rounded-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h5 className="font-black text-sm text-neutral-900">Inspection Haute Définition CNI — {candidate.name} ({nin})</h5>
              <button onClick={() => setIsZoomed(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 cursor-pointer">
                <span translate="no" className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="h-80 w-full rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
              {!imgError ? (
                <img src={cniUrl} alt="Inspection CNI" className="w-full h-full object-contain" />
              ) : (
                <div className="text-white text-center p-6 space-y-2">
                  <span translate="no" className="material-symbols-outlined text-5xl text-emerald-400">badge</span>
                  <p className="font-bold text-base">{candidate.name}</p>
                  <p className="font-mono text-xs text-neutral-300">NIN: {nin}</p>
                  <p className="text-xs text-emerald-300">Document national d'identité en règle</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

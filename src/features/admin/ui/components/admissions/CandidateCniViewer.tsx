import React, { useState } from 'react';
import { Icon } from '@iconify/react';
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
  // APP-FE-09 : jamais de pièce ni de NIN de démonstration — un admin ne doit valider que le vrai document
  const cniUrl = candidate.details?.cniUrl || null;
  const nin = candidate.details?.cniNumber || '—';
  const pieceVisible = Boolean(cniUrl) && !imgError;

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
          <Icon icon="solar:user-id-bold-duotone" className="text-rose-600 text-xl" />
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-tight">Visionneuse CNI Temps Réel</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
          cniStatus === 'valid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
          cniStatus === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
          'bg-amber-100 text-amber-800 border border-amber-300'
        }`}>
          <Icon icon={
            cniStatus === 'valid' ? 'solar:check-circle-bold-duotone' :
            cniStatus === 'rejected' ? 'solar:close-circle-bold-duotone' :
            'solar:clock-circle-bold-duotone'
          } className="text-xs" />
          <span>{cniStatus === 'valid' ? 'CNI Conforme' : cniStatus === 'rejected' ? 'CNI Rejetée' : 'En attente validation'}</span>
        </span>
      </div>

      <div className="flex items-center justify-between bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs">
        <span className="text-neutral-500 font-bold">NIN / N° Pièce :</span>
        <span className="font-mono font-black text-neutral-900 bg-white px-2.5 py-0.5 rounded-md border border-neutral-200 shadow-2xs">{nin}</span>
      </div>

      <div
        className="relative group rounded-xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-slate-800 to-slate-900 h-48 w-full cursor-pointer flex items-center justify-center shadow-inner"
        onClick={() => setIsZoomed(true)}
      >
        {pieceVisible ? (
          <img
            src={cniUrl ?? undefined}
            alt="Pièce d'Identité CNI"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 text-center text-white">
            <Icon icon="solar:document-cross-bold-duotone" className="text-3xl text-rose-300" />
            <p className="text-xs font-black">{cniUrl ? 'Pièce illisible ou introuvable' : 'Aucune pièce d’identité fournie'}</p>
            <p className="text-[10px] text-neutral-300">Validation impossible : demander le document au candidat.</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-black">
          <Icon icon="solar:magnifer-zoom-in-bold-duotone" className="text-base" />
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
          <button onClick={handleValidate} disabled={!pieceVisible} title={pieceVisible ? undefined : "Aucune pièce lisible à valider"} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer">
            <Icon icon="solar:verified-check-bold" className="text-base" />
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
                <Icon icon="solar:close-circle-bold" className="text-xl" />
              </button>
            </div>
            <div className="h-80 w-full rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
              {pieceVisible ? (
                <img src={cniUrl ?? undefined} alt="Inspection CNI" className="w-full h-full object-contain" />
              ) : (
                <div className="text-white text-center p-6 space-y-2">
                  <Icon icon="solar:document-cross-bold-duotone" className="text-5xl text-rose-300 inline-block" />
                  <p className="font-bold text-base">{cniUrl ? 'Pièce illisible ou introuvable' : 'Aucune pièce d’identité fournie'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

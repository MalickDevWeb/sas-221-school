import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { ExtendedCandidate } from '../../../domain/AdmissionsExtendedModels';
import { VisionneuseFichier } from '@/shared/components/VisionneuseFichier';
import { usePeutTelecharger } from '@/shared/hooks/usePeutTelecharger';
import { chargerPiece, cheminPiece, type CodePiece, type PieceChargee } from './piecesCandidat';

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
  const cniJointe = Boolean(candidate.details?.cniUrl);
  const nin = candidate.details?.cniNumber || '—';
  // 16/11 : la pièce est remise par le SERVEUR (les PDF étaient refusés par Cloudinary, 401) et affichée selon son
  // type : lecteur PDF intégré ou image. Avant : <img> sur le lien Cloudinary, donc une CNI en PDF était « illisible ».
  const [cni, setCni] = useState<PieceChargee | null>(null);
  const [cniErreur, setCniErreur] = useState('');
  const cniEstPdf = cni?.type === 'application/pdf';
  const pieceVisible = Boolean(cni) && !imgError;
  useEffect(() => {
    if (!cniJointe) return undefined;
    let actif = true;
    let url: string | null = null;
    setCni(null); setCniErreur(''); setImgError(false);
    chargerPiece(candidate.id, 'pieceIdentite')
      .then((p) => { if (actif) { url = p.url; setCni(p); } else URL.revokeObjectURL(p.url); })
      .catch((e: unknown) => { if (actif) setCniErreur(e instanceof Error ? e.message : String(e)); });
    return () => { actif = false; if (url) URL.revokeObjectURL(url); };
  }, [candidate.id, cniJointe]);

  // Pièces jointes au dossier (présence indiquée par le serveur) ; chacune est ouverte par le serveur, PDF compris
  const pieces = ([
    { libelle: "Photo d'identité", code: 'photo', url: candidate.details?.photoUrl },
    { libelle: 'Relevés de notes', code: 'releves', url: candidate.details?.transcriptsUrl },
    { libelle: 'Diplôme / attestation', code: 'diplome', url: candidate.details?.diplomaUrl },
  ] as { libelle: string; code: CodePiece; url?: string | null }[]).filter((p) => typeof p.url === 'string' && /^https?:\/\//i.test(p.url));
  // 17/11 : chaque pièce s'ouvre DANS l'application (visionneuse intégrée) ; « Télécharger » seulement si autorisé
  const telechargeable = usePeutTelecharger('admissions');
  const [visionnee, setVisionnee] = useState<{ code: CodePiece; libelle: string } | null>(null);
  const messageAbsence = !cniJointe ? 'Aucune pièce d’identité fournie'
    : cniErreur || (imgError ? 'Pièce illisible' : 'Chargement de la pièce…');

  const handleValidate = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      details: { ...candidate.details, cniStatus: 'valid', cniVerifiedAt: new Date().toLocaleTimeString('fr-FR') },
      notifications: [{ id: `not-${Date.now()}`, type: 'cni_validee', message: 'Votre pièce d’identité (CNI) a été validée avec succès.', sentAt: new Date().toISOString() }, ...(candidate.notifications ?? [])]
    };
    onUpdateCandidate(updated);
  };

  const handleReject = () => {
    const updated: ExtendedCandidate = {
      ...candidate,
      details: { ...candidate.details, cniStatus: 'rejected', cniRejectReason: rejectReason },
      notifications: [{ id: `not-${Date.now()}`, type: 'cni_rejetee', message: `Pièce d’identité non conforme : ${rejectReason}. Veuillez téléverser une copie nette.`, sentAt: new Date().toISOString() }, ...(candidate.notifications ?? [])]
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

      {pieces.length > 0 && (
        <ul className="bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 text-xs space-y-1" aria-label="Pièces envoyées">
          {pieces.map(p => (
            <li key={p.libelle} className="flex items-center justify-between gap-2">
              <span className="text-neutral-600 font-bold">{p.libelle}</span>
              <button type="button" onClick={() => setVisionnee({ code: p.code, libelle: p.libelle })} className="font-black text-primary hover:underline cursor-pointer bg-transparent border-0 p-0">Voir</button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="relative group rounded-xl overflow-hidden border-2 border-neutral-200 bg-gradient-to-br from-slate-800 to-slate-900 h-48 w-full cursor-pointer flex items-center justify-center shadow-inner"
        onClick={() => setIsZoomed(true)}
      >
        {pieceVisible && cni && cniEstPdf ? (
          // Aperçu : le clic agrandit (le lecteur PDF ne capte pas la souris ici)
          <iframe src={`${cni.url}#toolbar=0&view=FitH`} title="Pièce d'identité (PDF)" className="w-full h-full bg-white pointer-events-none" />
        ) : pieceVisible && cni ? (
          <img
            src={cni.url}
            alt="Pièce d'Identité CNI"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-2 text-center text-white">
            <Icon icon="solar:file-remove-bold-duotone" className="text-3xl text-rose-300" />
            <p className="text-xs font-black">{messageAbsence}</p>
            {(!cniJointe || cniErreur || imgError) && (
              <p className="text-[10px] text-neutral-300">Validation impossible : demander le document au candidat.</p>
            )}
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

      {isZoomed && cni && (
        <VisionneuseFichier titre={`Pièce d'identité — ${candidate.name} (${nin})`} local={cni}
          telechargeable={telechargeable} nomFichier="piece-identite" onFermer={() => setIsZoomed(false)} />
      )}
      {visionnee && (
        <VisionneuseFichier titre={`${visionnee.libelle} — ${candidate.name}`} chemin={cheminPiece(candidate.id, visionnee.code)}
          telechargeable={telechargeable} nomFichier={visionnee.code} onFermer={() => setVisionnee(null)} />
      )}
    </div>
  );
}

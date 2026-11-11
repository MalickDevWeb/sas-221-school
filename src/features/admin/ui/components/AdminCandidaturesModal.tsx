import React, { useEffect, useState } from 'react';
import { AdminCandidatureCard } from './AdminCandidatureCard';
import { AdminAdmissionConfig } from './AdminAdmissionConfig';
import { apiClient } from '@/shared/lib/apiClient';

interface Candidature {
  id: string; nomComplet: string; email: string; telephone: string;
  typeDepot: 'En ligne' | 'Présentiel'; promotionNom: string; motivation: string;
  statut: 'En attente' | 'Accepté' | 'Refusé'; dateSoumission: string;
  numeroCni?: string; dernierEtablissement?: string; dernierDiplome?: string;
  nomFichierCni?: string; nomFichierBulletin?: string; nomFichierDiplome?: string;
}

/** Forme renvoyée par CandidaturesController GET /candidatures/candidatures. */
interface CandidatureApi {
  id: string;
  nom?: string; prenom?: string; nomComplet?: string;
  email?: string; telephone?: string; filiere?: string;
  statut?: string; dateSoumission?: string; motivation?: string;
  typeDepot?: string;
}

/** Clé CandidateStatus backend (ou ancienne variante) → libellé de l'écran. */
function toStatutLabel(raw?: string): Candidature['statut'] {
  const key = (raw ?? '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  if (['ACCEPTED', 'ACCEPTE', 'ACCEPTEE', 'VALIDE', 'FINALISE', 'FINALISEE'].includes(key)) return 'Accepté';
  if (['REJECTED', 'REFUSE', 'REJETE'].includes(key)) return 'Refusé';
  return 'En attente';
}

const STATUT_KEYS: Record<'Accepté' | 'Refusé', string> = { 'Accepté': 'ACCEPTED', 'Refusé': 'REJECTED' };

function toCandidature(c: CandidatureApi): Candidature {
  return {
    id: c.id,
    nomComplet: c.nomComplet ?? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim(),
    email: c.email ?? '',
    telephone: c.telephone ?? '',
    typeDepot: c.typeDepot === 'Présentiel' ? 'Présentiel' : 'En ligne',
    promotionNom: c.filiere ?? '',
    motivation: c.motivation ?? '',
    statut: toStatutLabel(c.statut),
    dateSoumission: c.dateSoumission ?? '',
  };
}

export function AdminCandidaturesModal({ onClose, onRefreshData }: { onClose: () => void; onRefreshData: () => Promise<void> }) {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'settings'>('list');
  const [filterType, setFilterType] = useState<'Tous' | 'En ligne' | 'Présentiel'>('Tous');
  const [filterStatus, setFilterStatus] = useState<'En attente' | 'Accepté' | 'Refusé'>('En attente');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCandidatures = async () => {
    try {
      // Route réelle : @RequestMapping("/candidatures") + @GetMapping("/candidatures") — APP-ARC-01
      const { data } = await apiClient.get<{ candidatures?: CandidatureApi[] }>('/candidatures/candidatures');
      setCandidatures((data?.candidatures ?? []).map(toCandidature));
    } catch { /* handled by apiClient interceptor */ }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'Accepté' | 'Refusé') => {
    setProcessingId(id);
    try {
      // PATCH /candidatures/candidatures/{id}/statut, corps { statut } normalisé par CandidateStatus.from
      await apiClient.patch(`/candidatures/candidatures/${id}/statut`, { statut: STATUT_KEYS[newStatus] });
      await fetchCandidatures();
      await onRefreshData();
    } catch { /* handled by apiClient interceptor */ } finally {
      setProcessingId(null);
    }
  };

  const filtered = candidatures.filter(c => 
    (filterType === 'Tous' || c.typeDepot === filterType) && c.statut === filterStatus
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-[#FAF8F6] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] border border-[#E2DCDA] animate-fade-in">
        <div className="p-4 bg-white border-b border-[#E2DCDA] flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm text-[#291715]">Gestion des Inscriptions</h3>
            <p className="text-[10px] text-[#8E7977] font-bold uppercase">Scolarité, Campagnes & Sélection</p>
          </div>
          <button onClick={onClose} className="text-[#8E7977] hover:text-primary text-xs font-black">[ Fermer ]</button>
        </div>

        <div className="flex border-b border-[#E2DCDA] bg-white px-4">
          <button 
            onClick={() => setActiveTab('list')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 px-4 transition-all ${activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-[#8E7977] hover:text-[#291715]'}`}
          >
            📂 Dossiers reçus
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 px-4 transition-all ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-[#8E7977] hover:text-[#291715]'}`}
          >
            ⚙️ Paramètres de Campagne
          </button>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="p-2.5 bg-white border-b border-[#E2DCDA] flex flex-wrap gap-2 justify-between items-center text-xs">
              <div className="flex gap-1 bg-[#FAF8F6] p-1 rounded-lg border border-[#E2DCDA]">
                {(['Tous', 'En ligne', 'Présentiel'] as const).map(t => (
                  <button key={t} onClick={() => setFilterType(t)} className={`px-2 py-1 rounded-md font-bold text-[9.5px] transition-all ${filterType === t ? 'bg-primary text-white' : 'text-[#8E7977]'}`}>{t}</button>
                ))}
              </div>
              <div className="flex gap-1 bg-[#FAF8F6] p-1 rounded-lg border border-[#E2DCDA]">
                {(['En attente', 'Accepté', 'Refusé'] as const).map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`px-2 py-1 rounded-md font-bold text-[9.5px] transition-all ${filterStatus === s ? 'bg-white border border-[#E2DCDA] text-[#291715]' : 'text-[#8E7977]'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {filtered.length === 0 ? (
                <p className="text-center text-xs text-[#8E7977] py-8 font-medium">Aucun dossier trouvé dans cette catégorie.</p>
              ) : (
                filtered.map(cand => (
                  <AdminCandidatureCard key={cand.id} cand={cand} processingId={processingId} onUpdateStatus={handleUpdateStatus} />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="p-4 flex-1 overflow-y-auto bg-white">
            <AdminAdmissionConfig />
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import type { AdminPromotion, AdminProfessor } from '../../domain/AdminModels';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

/** Niveaux proposés (champ obligatoire côté serveur). */
const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

interface ClassFiliereProps {
  promotions: AdminPromotion[];
  professors: AdminProfessor[];
  onCreated: () => void;
}

export function AdminClassFiliereManager({ promotions, professors, onCreated }: ClassFiliereProps) {
  const [promoName, setPromoName] = useState('');
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');
  const [capacite, setCapacite] = useState('');
  
  const [courseTitre, setCourseTitre] = useState('');
  const [heures, setHeures] = useState('');
  const [profId, setProfId] = useState('');
  const [promoId, setPromoId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName || !filiere || !niveau || !capacite) return;   // champs « required » : messages personnalisés affichés
    setLoading(true);
    try {
      await apiClient.post('/admin/promotions', { name: promoName.trim(), filiere: filiere.trim(), level: niveau, capacity: capacite });
      toast.success(`Classe ${promoName.trim()} créée.`);
      setPromoName(''); setFiliere(''); setNiveau(''); setCapacite('');
      onCreated();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally { setLoading(false); }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitre || !promoId || !profId) return;   // classe et enseignant obligatoires (plus de choix implicite)
    setLoading(true);
    try {
      const corps: Record<string, string> = { titre: courseTitre.trim(), professeur_id: profId, promotion_id: promoId };
      if (heures) corps.volumeHoraire = heures;
      await apiClient.post('/admin/courses', corps);
      toast.success(`Matière ${courseTitre.trim()} créée.`);
      setCourseTitre(''); setHeures('');
      onCreated();
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-3.5 border border-[#E2DCDA] rounded-xl text-xs space-y-4" id="admin-class-filiere-manager">
      <div className="pb-1.5 border-b border-[#E2DCDA]/60 flex justify-between items-center">
        <h5 className="font-extrabold text-primary uppercase tracking-wider text-[10.5px]">Création Classes & Filières</h5>
        <span className="text-[9px] text-[#8E7977] font-bold">Structure pédagogique</span>
      </div>

      <form onSubmit={handleCreatePromo} className="space-y-2 bg-[#FAF8F6] p-2.5 rounded-xl border border-[#E2DCDA]/40 animate-fade-in">
        <h6 className="font-bold text-primary uppercase tracking-wide text-[9.5px]">1. Créer une Classe / Promotion</h6>
        <div className="grid grid-cols-2 gap-2">
          <input value={promoName} onChange={e => setPromoName(e.target.value)} placeholder="Nom (ex: 221-CD)" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required />
          <input value={filiere} onChange={e => setFiliere(e.target.value)} placeholder="Spécialité / Filière" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required />
          <select value={niveau} onChange={e => setNiveau(e.target.value)} className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg text-[11px] px-1 font-bold" required data-msg-requis="Choisissez le niveau de la classe.">
            <option value="">-- Niveau --</option>
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <input value={capacite} type="number" min="1" max="1000" onChange={e => setCapacite(e.target.value)} placeholder="Capacité (places)" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required data-msg-requis="Indiquez le nombre de places." />
        </div>
        <button type="submit" disabled={loading} className="w-full h-8 bg-[#3E2927] hover:bg-[#291715] text-white font-bold uppercase rounded-lg tracking-wider text-[10px]">Créer la Classe</button>
      </form>

      <form onSubmit={handleCreateCourse} className="space-y-2 bg-[#FAF8F6] p-2.5 rounded-xl border border-[#E2DCDA]/40 animate-fade-in">
        <h6 className="font-bold text-primary uppercase tracking-wide text-[9.5px]">2. Créer une Matière & Assigner Enseignant</h6>
        <div className="space-y-1.5">
          <input value={courseTitre} onChange={e => setCourseTitre(e.target.value)} placeholder="Nom du Cours (ex: Intelligence Artificielle)" className="w-full h-8 bg-white border border-[#E2DCDA] rounded-lg px-2 text-[11px]" required />
          <div className="grid grid-cols-3 gap-1.5">
            <select value={promoId} onChange={e => setPromoId(e.target.value)} className="bg-white border border-[#E2DCDA] h-8 rounded-lg text-[10px] px-1 font-bold" required data-msg-requis="Choisissez la classe.">
              <option value="">-- Classe --</option>
              {promotions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={profId} onChange={e => setProfId(e.target.value)} className="bg-white border border-[#E2DCDA] h-8 rounded-lg text-[10px] px-1" required data-msg-requis="Choisissez l'enseignant.">
              <option value="">-- Enseignant --</option>
              {professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input value={heures} type="number" onChange={e => setHeures(e.target.value)} placeholder="Heures" title="Volume horaire (facultatif)" className="bg-white border border-[#E2DCDA] h-8 rounded-lg text-[10px] px-2" min="1" max="500" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full h-8 bg-primary hover:bg-[#8F1316] text-white font-bold uppercase rounded-lg tracking-wider text-[10px]">Ajouter la Matière</button>
      </form>
    </div>
  );
}

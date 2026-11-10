import React, { useState } from 'react';
import { X, Building2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformStore } from '../../store/usePlatformStore';
import type { CreateTenantCommand } from '../../domain/models/PlatformModels';
import { TenantFormSections } from './tenants/TenantFormSections';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM: CreateTenantCommand = {
  name: '', email: '', country: '', city: '', address: '', phone: '', website: '', logo: '',
  adminNom: '', adminPrenom: '', adminEmail: '', adminPhone: '',
};

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose }) => {
  const { createTenant } = usePlatformStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTenantCommand>(EMPTY_FORM);
  // Identifiants de l'administrateur créé, affichés UNE fois (avant : mot de passe devinable « e-mail + 221! »)
  const [identifiants, setIdentifiants] = useState<{ ecole: string; email: string; motDePasse: string } | null>(null);
  const [copie, setCopie] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.adminNom || !formData.adminPrenom || !formData.adminEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      const cree = await createTenant(formData);
      toast.success(`L'établissement "${formData.name}" a été créé.`);
      if (cree?.motDePasseProvisoireAdmin) {
        setIdentifiants({ ecole: formData.name, email: formData.adminEmail, motDePasse: cree.motDePasseProvisoireAdmin });
      } else {
        onClose();
      }
      setFormData(EMPTY_FORM);
    } catch (error: any) {
      toast.error(resolveErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (identifiants) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-sm text-slate-200" role="dialog" aria-label="Identifiants de l'administrateur">
          <h2 className="text-base font-bold text-white">Établissement « {identifiants.ecole} » créé</h2>
          <p>Identifiant de connexion de l'administrateur : <span className="font-mono text-white">{identifiants.email}</span></p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <p className="text-xs font-bold text-amber-300">Mot de passe provisoire à transmettre :</p>
            <div className="flex gap-2">
              <code className="flex-1 px-3 py-2 rounded-lg bg-black/40 font-mono text-white select-all break-all">{identifiants.motDePasse}</code>
              <button type="button" className="px-3 rounded-lg bg-amber-500 text-black text-xs font-bold"
                onClick={async () => { try { await navigator.clipboard.writeText(identifiants.motDePasse); setCopie(true); } catch { /* copie manuelle */ } }}>
                {copie ? 'Copié' : 'Copier'}
              </button>
            </div>
            <p className="text-[11px] text-amber-200">Il ne sera plus affiché après la fermeture de cette fenêtre.</p>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => { setIdentifiants(null); setCopie(false); onClose(); }}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold">J'ai transmis le mot de passe</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0B0F1F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ajouter un Établissement</h2>
              <p className="text-[11px] text-slate-400">Création d'un nouvel environnement multi-tenant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TenantFormSections formData={formData} onChange={handleChange} />
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 border border-white/10 hover:bg-white/5">
              Annuler
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center shadow-lg shadow-indigo-500/20 hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Créer le Campus
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Building2, Mail, MapPin, Phone, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';

import { usePlatformStore } from '../../store/usePlatformStore';
import type { CreateTenantCommand } from '../../domain/models/PlatformModels';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM: CreateTenantCommand = {
  name: '',
  email: '',
  country: '',
  city: '',
  address: '',
  phone: '',
  website: '',
  logo: '',
  adminNom: '',
  adminPrenom: '',
  adminEmail: '',
  adminPhone: '',
};

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose }) => {
  const { createTenant } = usePlatformStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTenantCommand>(EMPTY_FORM);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await createTenant(formData);
      toast.success(`L'établissement "${formData.name}" a été créé avec succès.`, {
        description: `Compte admin créé pour ${formData.adminPrenom} ${formData.adminNom} — MDP temporaire : ${formData.adminEmail}221!`,
        duration: 8000,
      });
      setFormData(EMPTY_FORM);
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Erreur lors de la création de l\'établissement.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/20 p-2 rounded-lg text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Ajouter une École</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form id="add-tenant-form" onSubmit={handleSubmit} className="space-y-5">

            {/* ── Section Établissement ── */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informations de l'établissement</p>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nom de l'établissement <span className="text-rose-500">*</span></label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                placeholder="Ex: Lycée d'Excellence Dakar"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Administratif <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                    placeholder="direction@ecole.sn"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Ville</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                    placeholder="Ex: Dakar"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pays</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                  placeholder="Ex: Sénégal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                    placeholder="+221 XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* ── Section Admin ── */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Compte Administrateur Initial</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-amber-700">
                  Un compte admin sera créé automatiquement. Le mot de passe temporaire sera : <strong className="font-mono">[adminEmail]221!</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nom Admin <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      type="text"
                      name="adminNom"
                      value={formData.adminNom}
                      onChange={handleChange}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                      placeholder="Diallo"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Prénom Admin <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      required
                      type="text"
                      name="adminPrenom"
                      value={formData.adminPrenom}
                      onChange={handleChange}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                      placeholder="Mamadou"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mt-5">
                <label className="text-sm font-semibold text-slate-700">Email de connexion Admin <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-colors"
                    placeholder="admin@mon-ecole.sn"
                  />
                </div>
                {formData.adminEmail && (
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    MDP temp : <span className="text-amber-600 font-semibold">{formData.adminEmail}221!</span>
                  </p>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="add-tenant-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center transition-all shadow-lg shadow-indigo-500/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            Créer l'Établissement
          </button>
        </div>

      </div>
    </div>
  );
};


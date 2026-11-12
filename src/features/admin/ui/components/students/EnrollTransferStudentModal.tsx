import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTenantStore } from '@/core/store/tenantStore';
import { apiClient } from '@/shared/lib/apiClient';
import { reporterErreurServeur } from '@/shared/errors/erreursServeurChamps';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schemaInscription = z.object({
  studentId: z.string().trim().min(1, "Saisissez l'identifiant du compte élève.")
    .refine(v => !/\s/.test(v), "L'identifiant ne contient pas d'espace : recopiez-le tel qu'il apparaît sur la fiche de l'élève."),
});
type Saisie = z.infer<typeof schemaInscription>;

/**
 * Inscription d'un élève existant dans l'école courante (APP-FE-14 : react-hook-form + zod).
 *
 * Avant : un bouton « Oui, archiver & Transférer » envoyait un transfert depuis une école inventée
 * (« autre-ecole-id ») et l'école courante pouvait être remplacée par « default-tenant-id ». Le serveur
 * n'autorise un administrateur d'école à transférer que DEPUIS sa propre école : le transfert vers cette
 * école se demande donc à l'école d'origine (ou à l'administration de la plateforme).
 */
export function EnrollTransferStudentModal({ isOpen, onClose, onSuccess }: Props) {
  const { currentTenant } = useTenantStore();
  const [erreur, setErreur] = useState<string | null>(null);
  const [activeAilleurs, setActiveAilleurs] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Saisie>({
    resolver: zodResolver(schemaInscription), defaultValues: { studentId: '' }, mode: 'onTouched',
  });

  if (!isOpen) return null;

  const inscrire = async ({ studentId }: Saisie) => {
    setErreur(null);
    setActiveAilleurs(false);
    if (!currentTenant?.id) {
      setErreur("École courante inconnue : rechargez la page avant d'inscrire un élève.");
      return;
    }
    try {
      await apiClient.post(`/platform/students/${encodeURIComponent(studentId.trim())}/enroll`, { organizationId: currentTenant.id });
      onSuccess();
      onClose();
    } catch (err) {
      const statut = (err as { response?: { status?: number } })?.response?.status;
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '';
      if (statut === 409 && /seule école/i.test(message)) {
        setActiveAilleurs(true);
        return;
      }
      if (statut === 403) {
        // Les routes /platform/** sont réservées à l'administration de la plateforme (SecurityConfig) :
        // un administrateur d'école ne peut pas encore inscrire lui-même un élève existant.
        setErreur("L'inscription d'un élève déjà enregistré sur la plateforme est réservée, pour l'instant, à l'administration "
          + "de la plateforme : transmettez-lui l'identifiant de l'élève. Pour un nouvel élève, utilisez « Importation Excel ».");
        return;
      }
      setErreur(reporterErreurServeur(err, setError, { motsCles: { studentId: /élève introuvable|compte élève|déjà inscrit/i } }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="titre-inscription-eleve">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 id="titre-inscription-eleve" className="font-extrabold text-slate-800 text-sm">Inscrire un élève existant</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-slate-400 hover:text-slate-600">
            <span translate="no" className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form id="form-inscription-eleve" onSubmit={handleSubmit(inscrire)} noValidate data-validation-externe className="space-y-4">
            <div>
              <label htmlFor="inscription-studentId" className="block text-[10px] uppercase tracking-wider font-black text-slate-500 mb-1">Identifiant du compte élève</label>
              <input
                id="inscription-studentId"
                type="text"
                placeholder="Identifiant figurant sur la fiche de l'élève"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-primary aria-[invalid=true]:border-rose-400"
                {...register('studentId')}
                {...(errors.studentId ? { 'aria-invalid': true, 'aria-describedby': 'inscription-studentId-erreur' } : {})}
              />
              {errors.studentId && (
                <p id="inscription-studentId-erreur" role="alert" className="mt-1 text-[11px] font-bold text-rose-700">{errors.studentId.message}</p>
              )}
            </div>

            {erreur && (
              <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-bold">{erreur}</div>
            )}

            {activeAilleurs && (
              <div role="alert" id="inscription-active-ailleurs" className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-[11px] font-bold leading-relaxed">
                Cet élève est déjà actif dans une autre école : un élève ne peut être inscrit que dans une seule école à la fois.
                Le transfert vers votre école doit être lancé par son école d'origine (ou par l'administration de la plateforme).
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              onMouseDown={e => e.preventDefault()}
              className="w-full py-2 bg-[#1E293B] hover:bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {isSubmitting ? 'Inscription...' : 'Inscrire cet élève'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

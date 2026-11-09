import React, { useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';

interface AdminAlertsModalProps {
  onClose: () => void;
}

export function AdminAlertsModal({ onClose }: AdminAlertsModalProps) {
  const [alertText, setAlertText] = useState('');
  const [category, setCategory] = useState<'Système' | 'Inscriptions' | 'IT Admin'>('Système');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const texte = alertText.trim();
    if (!texte || loading) return;
    setLoading(true);
    setError(null);
    try {
      // Diffusion réelle : notification adressée à tout l'établissement (destinataire « ALL »).
      const { data } = await apiClient.post('/v1/notifications', {
        recipientId: 'ALL',
        title: `Alerte globale — ${category}`,
        content: texte,
        type: 'WARNING',
      });
      if (!data?.id) throw new Error('Réponse du serveur incomplète');
      toast.success("Alerte globale enregistrée par le serveur pour tout l'établissement.");
      onClose();
    } catch (err) {
      const message = resolveErrorMessage(err);
      setError(message);
      toast.error("L'alerte n'a pas été diffusée.", { description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#FAF8F6] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-[#E2DCDA]">
        <div className="p-4 bg-white border-b border-[#E2DCDA] flex justify-between items-center">
          <h3 className="font-black text-base text-[#291715]">Alerte Globale</h3>
          <button onClick={onClose} className="text-[#8E7977] hover:text-primary font-bold">[ Fermer ]</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8E7977] uppercase block">Catégorie</label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full bg-white border border-[#E2DCDA] rounded-xl p-2.5 text-xs outline-none focus:border-primary"
            >
              <option value="Système">Système (Info)</option>
              <option value="Inscriptions">Inscriptions (Scolarité)</option>
              <option value="IT Admin">IT Admin (Maintenance)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#8E7977] uppercase block">Contenu de l'Alerte</label>
            <textarea
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              placeholder="Saisissez le message d'alerte à diffuser..."
              rows={4}
              className="w-full bg-white border border-[#E2DCDA] rounded-xl p-2.5 text-xs outline-none focus:border-primary"
              required
            />
          </div>

          {error && (
            <p className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#8F1316] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-[#B3181C]/15 transition-all"
          >
            {loading ? 'Diffusion...' : 'Diffuser l\'Alerte'}
          </button>
        </form>
      </div>
    </div>
  );
}

import React from 'react';

export const AVAILABLE_CAMPAIGN_DOCS = [
  { id: 'CNI', label: "Carte Nationale d'Identité (Recto/Verso) ou Passeport", required: true, icon: 'badge' },
  { id: 'BAC_DIPLOME', label: 'Attestation de Réussite ou Diplôme du Baccalauréat', required: false, icon: 'school' },
  { id: 'RELEVES_NOTES', label: 'Relevé de notes officiel ou Bulletins scolaires', required: false, icon: 'description' },
  { id: 'PHOTO', label: "Photo d'Identité récente (Format officiel)", required: false, icon: 'account_box' },
  { id: 'LETTRE_CV', label: 'Curriculum Vitae (CV) & Lettre de motivation', required: false, icon: 'article' },
  { id: 'CERTIFICAT_NAT', label: 'Certificat de Nationalité ou Casier Judiciaire', required: false, icon: 'verified_user' },
] as const;

interface Props {
  selectedDocs: string[];
  onChange: (docs: string[]) => void;
}

export function CampaignDocSelector({ selectedDocs, onChange }: Props) {
  const toggleDoc = (id: string) => {
    if (selectedDocs.includes(id)) {
      onChange(selectedDocs.filter(d => d !== id));
    } else {
      onChange([...selectedDocs, id]);
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t border-neutral-100">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase text-neutral-700 flex items-center gap-1.5">
          <span translate="no" className="material-symbols-outlined text-xs text-primary">rule_folder</span>
          <span>Pièces & Documents Exigés du Candidat</span>
        </label>
        <span className="text-[10px] text-neutral-400 font-bold">{selectedDocs.length} sélectionnée(s)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {AVAILABLE_CAMPAIGN_DOCS.map(doc => {
          const isSelected = selectedDocs.includes(doc.id);
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => toggleDoc(doc.id)}
              className={`p-2 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-primary/5 border-primary/40 text-neutral-900 shadow-2xs'
                  : 'bg-neutral-50/70 border-neutral-200/80 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                isSelected ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-500'
              }`}>
                <span translate="no" className="material-symbols-outlined text-sm">
                  {isSelected ? 'check' : doc.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold leading-tight truncate ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>
                  {doc.label}
                </p>
                <span className="text-[9px] font-semibold text-neutral-400 block mt-0.5">
                  {doc.id === 'CNI' ? '⚠️ Pièce d’identité obligatoire' : isSelected ? 'Exigé à l’inscription' : 'Non requis'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


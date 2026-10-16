import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
  onClear: () => void;
  isSaving: boolean;
}

export const BrandingBackgroundUploader: React.FC<Props> = ({ currentUrl, onUpload, onClear, isSaving }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('L\'image dépasse 8 Mo. Veuillez choisir une image plus légère.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-neutral-300 hover:border-primary/60 bg-neutral-50/70 hover:bg-neutral-50'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-primary">
          <UploadCloud className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-black text-neutral-800">
            Glissez-déposez la photo du campus ici, ou <span className="text-primary underline">parcourez vos fichiers</span>
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">JPG, PNG, WebP haute résolution supportés (jusqu'à 8 Mo)</p>
        </div>
      </div>

      {currentUrl && (
        <div className="relative rounded-xl overflow-hidden border border-neutral-200 h-36 bg-neutral-900 group shadow-sm">
          <img src={currentUrl} alt="Aperçu fond personnalisé" className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
            <div className="flex items-center gap-2 text-white">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Check size={10} /> Fond Actif
              </span>
              {fileName && <span className="text-[11px] text-neutral-200 truncate max-w-xs">{fileName}</span>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-3 py-1 bg-white/90 hover:bg-white text-neutral-800 text-[10px] font-bold rounded-lg shadow-sm transition-all cursor-pointer">
                Remplacer
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); setFileName(''); }} className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-all cursor-pointer" title="Supprimer">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


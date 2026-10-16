import React, { useRef, useState } from 'react';
import { UploadCloud, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
  onClear: () => void;
}

export const BrandingLogoUploader: React.FC<Props> = ({ currentUrl, onUpload, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Format non supporté. Veuillez choisir un fichier PNG, SVG ou JPG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5 Mo).');
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
      <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-neutral-300 hover:border-primary/60 bg-neutral-50/70 hover:bg-neutral-50'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-primary">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-black text-neutral-800">
            Téléverser le logo officiel depuis votre appareil
          </p>
          <p className="text-[10px] text-neutral-400 mt-0.5">PNG transparent ou SVG haute qualité recommandé</p>
        </div>
      </div>

      {currentUrl && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-white flex items-center justify-center p-1 shadow-2xs overflow-hidden">
              <img src={currentUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Check size={12} className="text-emerald-600" /> Logo sélectionné
              </div>
              {fileName ? <div className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{fileName}</div> : <div className="text-[10px] text-slate-400">Image active</div>}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-[10px] font-bold rounded-lg cursor-pointer">
              Changer
            </button>
            <button type="button" onClick={() => { onClear(); setFileName(''); }} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer" title="Supprimer">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


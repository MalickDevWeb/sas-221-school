import React from 'react';

export function Step1Personal({ personal, setPersonal, setStep }: any) {
  return (
    <div className="space-y-3">
      <span className="text-[9px] font-black uppercase tracking-wider text-primary">1. Informations Personnelles</span>
      <div className="space-y-2">
        <input required type="text" placeholder="Nom Complet" value={personal.name} onChange={e => setPersonal({ ...personal, name: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <input required type="email" placeholder="Adresse Email" value={personal.email} onChange={e => setPersonal({ ...personal, email: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <input required type="text" placeholder="Téléphone (+221)" value={personal.phone} onChange={e => setPersonal({ ...personal, phone: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <input required type="text" placeholder="N° CNI ou Passeport" value={personal.cni} onChange={e => setPersonal({ ...personal, cni: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
      </div>
      <button disabled={!personal.name || !personal.email} onClick={() => setStep(2)} className="w-full py-2.5 bg-[#1E293B] hover:bg-[#0F172A] text-white rounded-xl uppercase font-black text-[10px] tracking-wider transition-all disabled:opacity-50">Continuer</button>
    </div>
  );
}

export function Step2Academic({ academic, setAcademic, setStep }: any) {
  return (
    <div className="space-y-3">
      <span className="text-[9px] font-black uppercase tracking-wider text-primary">2. Informations Académiques</span>
      <div className="space-y-2">
        <input placeholder="Dernier Établissement fréquenté" value={academic.school} onChange={e => setAcademic({ ...academic, school: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <input placeholder="Dernier Diplôme obtenu" value={academic.diploma} onChange={e => setAcademic({ ...academic, diploma: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <div>
          <label className="text-[9px] text-neutral-400 block mb-1">Cible Cursus</label>
          <input disabled value={academic.target} className="w-full h-11 bg-neutral-100 border border-neutral-200 rounded-xl px-3 outline-none cursor-not-allowed" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl uppercase font-black text-[10px]">Retour</button>
        <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-[#1E293B] text-white rounded-xl uppercase font-black text-[10px]">Suivant</button>
      </div>
    </div>
  );
}

export function Step3Docs({ docs, setDocs, setStep, calculateDocProgress }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black uppercase tracking-wider text-primary">3. Documents Requis</span>
        <span className="text-[10px] text-emerald-600 font-extrabold">Téléchargement : {calculateDocProgress()}%</span>
      </div>
      <div className="space-y-2 bg-[#FAF8F6] p-3.5 border border-neutral-200 rounded-xl">
        <label className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-xl cursor-pointer">
          <span>Pièce d'identité (CNI/Passeport)</span>
          <input type="checkbox" checked={docs.idCard} onChange={e => setDocs({ ...docs, idCard: e.target.checked })} className="accent-primary" />
        </label>
        <label className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-xl cursor-pointer">
          <span>Dernier Diplôme d'accès</span>
          <input type="checkbox" checked={docs.diploma} onChange={e => setDocs({ ...docs, diploma: e.target.checked })} className="accent-primary" />
        </label>
        <label className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-xl cursor-pointer">
          <span>Relevés de notes originaux</span>
          <input type="checkbox" checked={docs.transcripts} onChange={e => setDocs({ ...docs, transcripts: e.target.checked })} className="accent-primary" />
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl uppercase font-black text-[10px]">Retour</button>
        <button onClick={() => setStep(4)} className="flex-1 py-2.5 bg-[#1E293B] text-white rounded-xl uppercase font-black text-[10px]">Suivant</button>
      </div>
    </div>
  );
}

export function Step4Fees({ feePaid, setFeePaid, setStep, campaignFees }: any) {
  return (
    <div className="space-y-3">
      <span className="text-[9px] font-black uppercase tracking-wider text-primary">4. Frais d'Étude de Dossier</span>
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center space-y-2">
        <div className="text-xl font-black text-yellow-900">{campaignFees.toLocaleString()} FCFA</div>
        <p className="text-[10px] text-yellow-800 font-semibold leading-relaxed">
          Veuillez confirmer le paiement fictif des frais de traitement de dossier pour finaliser.
        </p>
        <button onClick={() => setFeePaid(!feePaid)} className={`px-4 py-1.5 rounded-lg text-[9.5px] font-black uppercase border transition-all ${
          feePaid ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-yellow-800 border-yellow-300'
        }`}>
          {feePaid ? 'Frais Validés ✓' : 'Valider le paiement de simulation'}
        </button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl uppercase font-black text-[10px]">Retour</button>
        <button disabled={!feePaid} onClick={() => setStep(5)} className="flex-1 py-2.5 bg-[#1E293B] text-white rounded-xl uppercase font-black text-[10px] disabled:opacity-50">Suivant</button>
      </div>
    </div>
  );
}

export function Step5Credentials({ credentials, setCredentials, setStep, handleFinalSubmit }: any) {
  return (
    <form onSubmit={handleFinalSubmit} className="space-y-3">
      <span className="text-[9px] font-black uppercase tracking-wider text-primary">5. Configuration de l'Espace Sécurisé</span>
      <div className="space-y-2">
        <input required type="password" placeholder="Créer votre mot de passe" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <input required type="password" placeholder="Confirmer le mot de passe" value={credentials.confirm} onChange={e => setCredentials({ ...credentials, confirm: e.target.value })} className="w-full h-11 bg-neutral-50 border border-neutral-200 rounded-xl px-3 outline-none" />
        <label className="flex items-start gap-2.5 p-2 bg-[#FAF8F6] border border-neutral-200 rounded-xl cursor-pointer">
          <input type="checkbox" checked={credentials.accept} onChange={e => setCredentials({ ...credentials, accept: e.target.checked })} className="mt-0.5 accent-primary" />
          <span className="text-[9.5px] text-neutral-500 font-semibold leading-snug">J'accepte les conditions générales de scolarité de l'établissement.</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setStep(4)} className="flex-1 py-2.5 bg-neutral-100 text-neutral-600 rounded-xl uppercase font-black text-[10px]">Retour</button>
        <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl uppercase font-black text-[10px]">Soumettre</button>
      </div>
    </form>
  );
}

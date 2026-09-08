import React, { useState } from 'react';

export function ParentProfilePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'parent221@gmail.com',
    telephone: '77 123 45 67',
    adresse: 'Dakar, Sénégal',
    profession: 'Ingénieur',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const inputCls = "w-full h-11 px-4 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 font-semibold focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 outline-none transition-all placeholder-neutral-300";

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full animate-fade-in pb-28 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1565C0] to-[#0D47A1] flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <span translate="no" className="material-symbols-outlined text-white text-[20px]">person</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-neutral-900 leading-tight">Mon Profil</h1>
            <p className="text-xs text-neutral-500 font-semibold">Gérez vos informations personnelles et de contact</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-black shadow-inner">
            {form.prenom[0]}{form.nom[0]}
          </div>
          <div className="text-center sm:text-left flex-1 mt-2">
            <h2 className="text-2xl font-black text-neutral-900">{form.prenom} {form.nom}</h2>
            <p className="text-sm text-neutral-500 font-semibold mt-1">{form.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-wider border border-blue-200">
                Parent d'élève
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-3">
              <span translate="no" className="material-symbols-outlined text-emerald-600">check_circle</span>
              Profil mis à jour avec succès
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Prénom</label>
              <input className={inputCls} value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Nom</label>
              <input className={inputCls} value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Email</label>
              <input type="email" className={inputCls} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Téléphone</label>
              <input type="tel" className={inputCls} value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Adresse complète</label>
              <input className={inputCls} value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-black text-neutral-600 uppercase tracking-wider">Profession</label>
              <input className={inputCls} value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} />
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white rounded-xl text-xs font-black shadow-md shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

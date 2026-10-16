import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export function TenantFinderPage() {
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) {
      setError('Veuillez saisir le slug de votre établissement');
      return;
    }
    navigate(`/t/${cleanSlug}/login`);
  };

  return (
    <div className="min-h-screen w-full bg-[#070A13] text-white flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <img src="/myschool-icon.png" alt="My School" className="h-10 w-10 object-contain drop-shadow" />
          <span className="text-xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors">My School</span>
        </Link>
        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
          <Icon icon="solar:arrow-left-linear" className="text-base" /><span>Accueil</span>
        </Link>
      </header>

      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-[#0D1322]/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">
              <Icon icon="solar:buildings-3-bold-duotone" className="text-sm" /><span>Portail Multi-Campus</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Accéder à votre École</h1>
            <p className="text-xs text-slate-400 font-medium">Saisissez le slug de votre établissement pour rejoindre votre espace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="school-slug" className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Identifiant de l'école (Slug)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">/t/</span>
                <input
                  id="school-slug"
                  type="text"
                  required
                  autoFocus
                  placeholder="ex: ecole-221"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              {error && <p className="text-[11px] text-rose-400 font-bold mt-1.5">{error}</p>}
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 border-0 active:scale-[0.99]">
              <span>Accéder à l'espace de connexion</span>
              <Icon icon="solar:arrow-right-line-duotone" className="text-lg" />
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">Établissement disponible :</span>
            <button
              type="button"
              onClick={() => navigate('/t/ecole-221/login')}
              className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-black text-xs border border-red-500/20">221</span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">École 221</div>
                  <div className="text-[10px] text-slate-500 font-mono">/t/ecole-221/login</div>
                </div>
              </div>
              <Icon icon="solar:alt-arrow-right-line-duotone" className="text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2">
            <Link to="/register-school" className="hover:text-indigo-300 transition-colors">+ Inscrire mon école</Link>
            <Link to="/super-admin" className="hover:text-purple-300 transition-colors flex items-center gap-1">
              <Icon icon="solar:shield-check-bold" className="text-sm text-purple-400" />
              <span>Super Admin</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center text-[10px] text-slate-500 py-3">
        © 2026 My School SaaS Platform • Multi-Tenant Education Infrastructure
      </footer>
    </div>
  );
}


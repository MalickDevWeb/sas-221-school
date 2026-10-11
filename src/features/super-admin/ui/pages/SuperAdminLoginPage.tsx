import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';

export const SuperAdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { executer, etat, erreur } = useLogin();
  const loading = etat === 'CHARGEMENT';
  const { utilisateur, deconnexion } = useAuthStore();
  const navigate = useNavigate();

  // Vérifie que le token stocké est vraiment valide côté backend avant de rediriger
  React.useEffect(() => {
    if (!utilisateur) return;
    if (utilisateur.role !== 'SUPER_ADMIN' && utilisateur.role !== 'PLATFORM_OWNER') {
      // Mauvais rôle — déconnecter et rester sur cette page
      deconnexion();
      return;
    }
    // Valider le token en appelant /auth/me
    import('@/shared/lib/apiClient').then(({ apiClient }) => {
      apiClient.get('/auth/me').then(() => {
        navigate('/super-admin/dashboard');
      }).catch(() => {
        // Token invalide ou expiré → déconnecter et rester ici
        deconnexion();
      });
    });
  }, [utilisateur, navigate, deconnexion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    executer({ email, motDePasse: password });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Platform Control</h1>
          <p className="text-slate-400">Restricted access for Super Administrators</p>
        </div>

        <div className="bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {erreur && (
              <div className="flex items-start gap-3 p-4 text-sm text-rose-200 bg-rose-500/15 border border-rose-500/30 rounded-xl">
                <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{erreur}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
                  placeholder="admin@platform.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20 mt-8"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Secure Login <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 mb-2">
            Protected by advanced encryption. Unauthorized access is strictly prohibited.
          </p>
          <div className="inline-block bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-slate-400 font-mono">
              Test: <strong>superadmin@ecole221.sn</strong> / <strong>SuperAdmin@221!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


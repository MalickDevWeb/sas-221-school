import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  CreditCard, 
  BarChart3, 
  TrendingUp, 
  Settings2, 
  HelpCircle,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';

export const SuperAdminLayout = () => {
  const { deconnexion, utilisateur } = useAuthStore();

  const handleLogout = () => {
    deconnexion();
    window.location.href = '/super-admin';
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Vue d'ensemble", path: '/super-admin/dashboard' },
    { icon: <Globe size={18} />, label: 'Établissements', path: '/super-admin/tenants' },
    { icon: <Users size={18} />, label: 'Utilisateurs', path: '/super-admin/users' },
    { icon: <CreditCard size={18} />, label: 'Facturation SaaS', path: '/super-admin/billing' },
    { icon: <BarChart3 size={18} />, label: 'Rapports & Audit', path: '/super-admin/reports' },
    { icon: <TrendingUp size={18} />, label: 'Analytiques', path: '/super-admin/analytics' },
    { icon: <Settings2 size={18} />, label: 'Système & Santé', path: '/super-admin/system' },
    { icon: <HelpCircle size={18} />, label: 'Support & Tickets', path: '/super-admin/support' },
    { icon: <Settings size={18} />, label: 'Paramètres', path: '/super-admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#070A14] text-slate-100 font-sans relative overflow-hidden select-none isolate">
      {/* Background ambient neon glows matching landing page */}
      <div 
        className="absolute -top-32 left-1/4 w-[750px] h-[500px] rounded-full pointer-events-none -z-10 opacity-70"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.03) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[600px] h-[450px] rounded-full pointer-events-none -z-10 opacity-70"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0.02) 50%, transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <aside className="w-68 bg-[#090D1C]/90 backdrop-blur-2xl border-r border-white/[0.07] text-white flex flex-col h-full z-20 shrink-0">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0">
              <div className="w-full h-full bg-[#0B0F1F] rounded-[10px] flex items-center justify-center">
                <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-purple-400 text-[20px]">
                  school
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white tracking-tight">My School</span>
                <Sparkles size={13} className="text-amber-400 animate-pulse" />
              </div>
              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Super Admin
              </span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <span className="mr-3 opacity-90">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-white/[0.07] mt-auto space-y-3">
          <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-bold text-slate-200 truncate">{utilisateur?.nom || 'Super Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">Opérationnel • Neon DB</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-xs font-bold text-rose-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut size={16} className="mr-2.5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

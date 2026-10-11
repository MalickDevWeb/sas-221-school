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
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/core/store/authStore';

export const SuperAdminLayout = () => {
  const { deconnexion } = useAuthStore();

  const handleLogout = () => {
    deconnexion();
    window.location.href = '/super-admin';
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Vue d'ensemble", path: '/super-admin/dashboard' },
    { icon: <Globe size={20} />, label: 'Écoles', path: '/super-admin/tenants' },
    { icon: <Users size={20} />, label: 'Utilisateurs', path: '/super-admin/users' },
    { icon: <CreditCard size={20} />, label: 'Facturation', path: '/super-admin/billing' },
    { icon: <BarChart3 size={20} />, label: 'Rapports', path: '/super-admin/reports' },
    { icon: <TrendingUp size={20} />, label: 'Analytiques', path: '/super-admin/analytics' },
    { icon: <Settings2 size={20} />, label: 'Système', path: '/super-admin/system' },
    { icon: <HelpCircle size={20} />, label: 'Support', path: '/super-admin/support' },
    { icon: <Settings size={20} />, label: 'Paramètres', path: '/super-admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E2235] text-white flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm font-bold">shield</span>
            </div>
            <h2 className="text-xl font-bold tracking-wide">Plateforme</h2>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar - Logout */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


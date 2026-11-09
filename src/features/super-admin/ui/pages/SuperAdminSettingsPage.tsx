import React, { useState } from 'react';
import { Globe, Shield, Server, Save, Sparkles } from 'lucide-react';
import { SettingsGeneralTab } from '../components/settings/SettingsGeneralTab';
import { SettingsSecurityTab } from '../components/settings/SettingsSecurityTab';
import { SettingsSystemTab } from '../components/settings/SettingsSystemTab';

export const SuperAdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  // Aucun service serveur ne stocke les paramètres de la plateforme : aucune valeur inventée,
  // champs et sauvegarde désactivés (plus de faux « sauvegardé avec succès »).
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [require2fa, setRequire2fa] = useState(false);

  const navItems = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'system', label: 'Système', icon: Server },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles size={12} className="text-cyan-400" /> Configuration Globale
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Paramètres Plateforme</h1>
          <p className="text-xs text-slate-400 mt-1">Supervisez les variables environnementales et les seuils de sécurité.</p>
        </div>
        <button
          type="button" disabled aria-disabled="true"
          title="Fonctionnalité non disponible : aucune source de données"
          className="flex items-center gap-2 bg-white/10 text-slate-400 px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed w-fit"
        >
          <Save size={16} />
          <span>Sauvegarder</span>
        </button>
      </div>

      <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-semibold">
        Fonctionnalité non disponible : aucune source de données. Les paramètres globaux de la plateforme ne sont pas encore stockés côté serveur ; rien n'est affiché ni enregistré.
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-56 flex md:flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === item.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <fieldset disabled className="flex-1 min-w-0 opacity-60 bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-xl">
          {activeTab === 'general' && (
            <SettingsGeneralTab platformName={platformName} setPlatformName={setPlatformName} supportEmail={supportEmail} setSupportEmail={setSupportEmail} />
          )}
          {activeTab === 'security' && (
            <SettingsSecurityTab require2fa={require2fa} setRequire2fa={setRequire2fa} />
          )}
          {activeTab === 'system' && (
            <SettingsSystemTab maintenanceMode={maintenanceMode} setMaintenanceMode={setMaintenanceMode} />
          )}
        </fieldset>
      </div>
    </div>
  );
};

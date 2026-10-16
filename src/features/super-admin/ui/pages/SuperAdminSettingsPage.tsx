import React, { useState } from 'react';
import { Globe, Shield, Bell, Server, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsGeneralTab } from '../components/settings/SettingsGeneralTab';
import { SettingsSecurityTab } from '../components/settings/SettingsSecurityTab';
import { SettingsSystemTab } from '../components/settings/SettingsSystemTab';

export const SuperAdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState('My School SaaS');
  const [supportEmail, setSupportEmail] = useState('contact@myschool.sn');
  const [require2fa, setRequire2fa] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres globaux sauvegardés avec succès !');
    }, 600);
  };

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
          onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 w-fit"
        >
          {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>Sauvegarder</span>
        </button>
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
        <div className="flex-1 bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl rounded-2xl overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-xl">
          {activeTab === 'general' && (
            <SettingsGeneralTab platformName={platformName} setPlatformName={setPlatformName} supportEmail={supportEmail} setSupportEmail={setSupportEmail} />
          )}
          {activeTab === 'security' && (
            <SettingsSecurityTab require2fa={require2fa} setRequire2fa={setRequire2fa} />
          )}
          {activeTab === 'system' && (
            <SettingsSystemTab maintenanceMode={maintenanceMode} setMaintenanceMode={setMaintenanceMode} />
          )}
        </div>
      </div>
    </div>
  );
};

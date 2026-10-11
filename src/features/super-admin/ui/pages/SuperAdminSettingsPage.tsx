import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  Server,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

export const SuperAdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // States pour les paramètres
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState('Ecole 221 SaaS');
  const [supportEmail, setSupportEmail] = useState('support@ecole221.sn');
  const [require2fa, setRequire2fa] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulation API
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Paramètres globaux sauvegardés avec succès.');
    }, 800);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres Globaux</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez la configuration système de toute la plateforme SaaS</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center shadow-lg shadow-indigo-500/20 disabled:opacity-70"
        >
          {isSaving ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Sauvegarder
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'general' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Globe className="w-5 h-5 mr-3" /> Général
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'security' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Shield className="w-5 h-5 mr-3" /> Sécurité
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'notifications' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Bell className="w-5 h-5 mr-3" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'system' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <Server className="w-5 h-5 mr-3" /> Système
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
          
          {activeTab === 'general' && (
            <div className="p-8 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-primary/80" />
                Configuration Générale
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom de la Plateforme</label>
                  <input 
                    type="text" 
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/80/50 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">S'affiche dans les entêtes d'emails et la facturation globale.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email de Support Principal</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email" 
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/80/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Localisation par défaut</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Fuseau Horaire</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/80/50 outline-none">
                        <option>GMT (Dakar, Londres)</option>
                        <option>GMT+1 (Paris, Kinshasa)</option>
                        <option>GMT+2 (Le Caire, Johannesburg)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Langue par défaut</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/80/50 outline-none">
                        <option>Français</option>
                        <option>Anglais</option>
                        <option>Arabe</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-8 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary/80" />
                Sécurité Globale
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Authentification à Double Facteur (2FA)</h3>
                    <p className="text-xs text-gray-500 mt-1">Exiger le 2FA pour tous les Administrateurs (Super Admin et Admin École).</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={require2fa} onChange={() => setRequire2fa(!require2fa)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration de session (en minutes)</label>
                  <input type="number" defaultValue={120} className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/80/50 outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-8 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Server className="w-5 h-5 mr-2 text-primary/80" />
                Contrôle du Système
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-rose-800 text-sm">Mode Maintenance</h3>
                      <p className="text-xs text-rose-600 mt-1 max-w-md">
                        Désactive l'accès à la plateforme pour tous les utilisateurs non-super-admin. Une page "En maintenance" sera affichée.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rose-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary/80" />
                Configuration des Notifications
              </h2>
              <p className="text-gray-500 text-sm">Connectez votre fournisseur SMTP ou de SMS pour la plateforme entière ici.</p>
              {/* Placeholder Content */}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


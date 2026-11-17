import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut } from 'lucide-react';
import { useRbacStore } from '@/core/store/rbacStore';
import { useAuthStore } from '@/core/store/authStore';
import { useTenantStore } from '@/core/store/tenantStore';
import { sectionsVisibles } from '@/features/admin/ui/components/menuAdmin';

interface MobilePlusMenuProps {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

export function MobilePlusMenu({ menuOpen, setMenuOpen, activeTab, onSelectTab, onLogout }: MobilePlusMenuProps) {
  // Mêmes sections et mêmes droits que la barre latérale (menuAdmin.ts)
  const mesDroits = useRbacStore((s) => s.mesDroits);
  const chargerMesDroits = useRbacStore((s) => s.chargerMesDroits);
  const { utilisateur } = useAuthStore();
  const { currentTenant } = useTenantStore();
  // Sur téléphone, AdminSidebar n'est pas montée (AdminPage) : sans ce chargement, mesDroits resterait
  // null et le menu « Plus » serait vide (seule « Déconnexion » apparaîtrait).
  useEffect(() => { void chargerMesDroits(); }, [chargerMesDroits, utilisateur?.id, currentTenant?.slug]);
  const sections = sectionsVisibles(mesDroits);
  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div id="mobile-plus-menu" initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 bg-slate-950 z-[999] flex flex-col p-6 text-white">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <h3 className="font-black text-lg">Menu</h3>
              <p className="text-[10px] text-[#B3181C] font-extrabold uppercase tracking-widest">Administration</p>
            </div>
            <button onClick={() => setMenuOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto py-4 space-y-5">
            {sections.map((section) => (
              <div key={section.titre ?? 'accueil'} data-section-menu={section.titre ?? 'accueil'}>
                {section.titre && <p className="pb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{section.titre}</p>}
                <div className="grid grid-cols-2 gap-2.5">
                  {section.entrees.map(({ id, label, icon }) => (
                    <button key={id} type="button" data-onglet={id} onClick={() => { onSelectTab(id); setMenuOpen(false); }}
                      aria-current={activeTab === id ? 'page' : undefined}
                      className={`flex items-center p-3 rounded-2xl gap-2.5 text-left transition-all cursor-pointer min-w-0 ${activeTab === id ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>
                      <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
                      <span className="text-xs font-bold leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/10 flex gap-4">
            <button onClick={() => { onLogout(); setMenuOpen(false); }} className="flex-1 py-3 bg-[#B3181C] hover:bg-[#B3181C]/90 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

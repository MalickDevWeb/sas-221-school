import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, CreditCard, Mail, Menu } from 'lucide-react';
import { useDeviceStore } from '../../hooks/useDeviceStore';
import { MobilePlusMenu } from './MobilePlusMenu';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
}

const MAIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Élèves', icon: Users },
  { id: 'finances', label: 'Finances', icon: CreditCard },
  { id: 'notifications', label: 'Notifs', icon: Mail },
];

export function MobileBottomNav({ activeTab, onSelectTab, onLogout }: Props) {
  const { isMobile } = useDeviceStore();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <>
      <div id="mobile-bottom-nav" className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-slate-200/60 shadow-2xl z-50 px-3 flex items-center justify-between">
        {MAIN_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id && !menuOpen;
          return (
            <button key={id} onClick={() => { onSelectTab(id); setMenuOpen(false); }} className={`relative flex flex-col items-center justify-center flex-1 h-full py-2.5 gap-1 transition-colors cursor-pointer ${isActive ? 'text-[#B3181C]' : 'text-slate-400 hover:text-slate-600'}`}>
              {isActive && <motion.div layoutId="activeTabIndicator" className="absolute top-0 left-3 right-3 h-[3px] bg-[#B3181C] rounded-b-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <motion.div animate={{ scale: isActive ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="flex flex-col items-center justify-center gap-0.5">
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
              </motion.div>
            </button>
          );
        })}

        <button onClick={() => setMenuOpen(true)} className={`relative flex flex-col items-center justify-center flex-1 h-full py-2.5 gap-1 transition-colors cursor-pointer ${menuOpen ? 'text-[#B3181C]' : 'text-slate-400 hover:text-slate-600'}`}>
          {menuOpen && <motion.div layoutId="activeTabIndicator" className="absolute top-0 left-3 right-3 h-[3px] bg-[#B3181C] rounded-b-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
          <motion.div animate={{ scale: menuOpen ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} className="flex flex-col items-center justify-center gap-0.5">
            <Menu className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider">Plus</span>
          </motion.div>
        </button>
      </div>
      <MobilePlusMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} activeTab={activeTab} onSelectTab={onSelectTab} onLogout={onLogout} />
    </>
  );
}

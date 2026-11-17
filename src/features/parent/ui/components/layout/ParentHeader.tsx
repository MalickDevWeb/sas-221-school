import { useNavigate, useLocation } from 'react-router-dom';
import { useParentContext } from './ParentContext';
import { useTenantStore } from '@/core/store/tenantStore';
import { useAuthStore } from '@/core/store/authStore';
import { ClocheNotifications } from '@/shared/components/ClocheNotifications';

export function ParentHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useParentContext();
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const schoolName = currentTenant?.name || 'École 221';
  // Initiales du compte connecté
  const utilisateur = useAuthStore((s) => s.utilisateur);
  const prenomCompte = (utilisateur as { prenom?: string } | null)?.prenom?.trim() || '';
  const initiales = `${prenomCompte[0] ?? ''}${utilisateur?.nom?.trim()?.[0] ?? ''}`.toUpperCase() || '—';

  const match = location.pathname.match(/\/t\/([^/]+)/);
  const activeSlug = match ? match[1] : 'ecole-221';
  const base = `/t/${activeSlug}/parent`;

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <p className="text-sm font-black text-neutral-800 md:hidden">{schoolName}</p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications réelles du compte (annonces de l'école, alertes) */}
        <ClocheNotifications
          classeBouton="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors relative cursor-pointer text-neutral-600"
          pied={unreadCount > 0 ? (
            <button type="button" onClick={() => navigate(`${base}/messages`)}
              className="w-full px-3.5 py-2.5 flex items-center gap-2 text-[11px] font-bold text-primary hover:bg-primary/5 cursor-pointer">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">mail</span>
              {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''} : ouvrir les messages
            </button>
          ) : undefined}
        />

        <div onClick={() => navigate(`${base}/profil`)} className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200 cursor-pointer hover:opacity-80 active:scale-95 transition-all" title="Mon Profil">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#0D47A1] text-white flex items-center justify-center text-xs font-black shadow-sm" id="parent-header-initiales">{initiales}</div>
        </div>
      </div>
    </header>
  );
}

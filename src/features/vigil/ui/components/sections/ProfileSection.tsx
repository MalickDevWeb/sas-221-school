import { LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { ROUTES } from '@/shared/constants';

export function ProfileSection() {
  const navigate = useNavigate();
  const { deconnexion, utilisateur } = useAuthStore();
  const nom = utilisateur?.nom?.trim() || '—';
  const initiales = nom === '—' ? '—' : nom.split(/\s+/).map(m => m[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-xs flex flex-col gap-4 items-center text-center">
        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#E31E24]/30 bg-neutral-100 flex items-center justify-center text-2xl font-black text-neutral-500">{initiales}</div>
        <div><h3 className="font-black text-lg text-neutral-800">{nom}</h3><p className="text-xs font-bold text-primary uppercase tracking-wider mt-0.5">Vigile • Sécurité</p></div>
        <div className="w-full border-t border-neutral-100 pt-4 flex justify-between text-left text-xs text-neutral-500 px-2 font-semibold mb-1"><div><p className="text-[10px] text-neutral-400 font-extrabold uppercase">E-mail</p><p className="text-neutral-700 font-extrabold">{utilisateur?.email || '—'}</p></div><div className="text-right"><p className="text-[10px] text-neutral-400 font-extrabold uppercase">Service</p><p className="text-neutral-700 font-extrabold">—</p></div></div>
        <div className="w-full flex flex-col gap-2.5"><button onClick={() => { deconnexion(); navigate(ROUTES.login, { replace: true }); }} className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-primary font-bold text-xs py-3 rounded-2xl transition-all border border-red-100/60 active:scale-98 cursor-pointer"><LogOut className="h-4 w-4 stroke-[2.5]" />Se déconnecter</button></div>
      </div>
    </div>
  );
}

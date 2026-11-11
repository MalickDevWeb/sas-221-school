import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export function VisitorDashboard() {
  const { utilisateur, deconnexion } = useAuthStore();

  // Compte sans rôle dans cette école (VISITEUR). Avant : « Dossier déposé ✓ » et « En attente » affichés à
  // tout visiteur, qu'il ait déposé un dossier ou non. Le suivi réel d'une candidature se fait sur le portail
  // candidat (email + mot de passe de suivi, APP-BE-12).
  const slug = window.location.pathname.match(/\/t\/([^/]+)/)?.[1] ?? 'ecole-221';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-primary/80 selection:text-white" id="visitor-dashboard">
      <header className="border-b border-white/5 py-4 px-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
          <h1 className="font-extrabold text-sm tracking-tight uppercase text-white">École 221 Admissions</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400 font-mono">Cand. {utilisateur?.nom}</span>
          <button onClick={deconnexion} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />
          <h2 className="text-lg font-black tracking-tight text-white mb-2 text-center">Aucun espace associé à ce compte</h2>
          <p className="text-xs text-slate-400 font-semibold mb-6 text-center">
            Votre compte n'est encore rattaché à aucun espace de l'école (élève, parent, enseignant…).
            Si vous avez déposé une candidature, suivez sa décision depuis le portail candidat avec l'email du dossier
            et le mot de passe choisi lors du dépôt.
          </p>
          <div className="flex justify-center">
            <a href={`/t/${slug}/candidature`} id="visiteur-suivi-candidature"
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider">
              Suivre ma candidature
            </a>
          </div>
        </motion.div>
      </main>

      <footer className="py-4 text-center border-t border-white/5 bg-slate-900/30">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">École 221 • Espace Candidat Unifié</p>
      </footer>
    </div>
  );
}

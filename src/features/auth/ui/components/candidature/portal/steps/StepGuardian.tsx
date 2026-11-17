import { motion } from 'motion/react';
import { Champ, ChoixBoutons, NavigationEtape } from './champs';
import { inputCls, useChamp } from './champsCandidature';

const RELATIONS = ['Père', 'Mère', 'Tuteur Légal', 'Autre'];

export function StepGuardian({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const champ = useChamp();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">2. Tuteur Légal & Contact d'Urgence</h3>
        <p className="text-xs text-neutral-500 font-medium">Personne à contacter pour le suivi administratif et financier du dossier.</p>
      </div>

      <Champ id="guardianRelationship" label="Lien de parenté / Relation *">
        <ChoixBoutons id="guardianRelationship" options={RELATIONS.map(r => ({ valeur: r, libelle: r }))} />
      </Champ>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="guardianName" label="Nom complet du garant *"><input type="text" placeholder="Ex: El Hadji Babacar Diop" className={inputCls} {...champ('guardianName')} /></Champ>
        <Champ id="guardianProfession" label="Profession / Activité"><input type="text" placeholder="Ex: Enseignant" className={inputCls} {...champ('guardianProfession')} /></Champ>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="guardianPhone" label="Téléphone portable du garant *"><input type="tel" placeholder="77 654 32 10" className={inputCls} {...champ('guardianPhone')} /></Champ>
        <Champ id="guardianEmail" label="Email du garant"><input type="email" placeholder="tuteur@domaine.sn" className={inputCls} {...champ('guardianEmail')} /></Champ>
      </div>

      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2.5 text-neutral-600 text-[11px]">
        <span translate="no" className="material-symbols-outlined text-primary text-base">info</span>
        <span>Ces coordonnées sont jointes à votre dossier : l'école pourra contacter votre garant pour son suivi.</span>
      </div>

      <NavigationEtape onPrev={onPrev} onNext={onNext} libelleSuivant="Suivant : Parcours Académique" />
    </motion.div>
  );
}

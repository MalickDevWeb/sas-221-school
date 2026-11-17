import { motion } from 'motion/react';
import { Champ, ChoixBoutons, NavigationEtape } from './champs';
import { inputCls, useChamp } from './champsCandidature';
import { ChoixPays } from '@/shared/components/ChoixPays';

export function StepIdentity({ onNext }: { onNext: () => void }) {
  const champ = useChamp();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">1. Identité & État Civil</h3>
        <p className="text-xs text-neutral-500 font-medium">Informations officielles figurant sur votre pièce d'identité nationale ou passeport.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="firstName" label="Prénom(s) *"><input type="text" placeholder="Ex: Moussa" className={inputCls} {...champ('firstName')} /></Champ>
        <Champ id="lastName" label="Nom de famille *"><input type="text" placeholder="Ex: Diop" className={inputCls} {...champ('lastName')} /></Champ>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Champ id="gender" label="Sexe *">
          <ChoixBoutons id="gender" options={[{ valeur: 'M', libelle: 'Masculin' }, { valeur: 'F', libelle: 'Féminin' }]} />
        </Champ>
        <Champ id="birthDate" label="Date de naissance *"><input type="date" className={inputCls} {...champ('birthDate')} /></Champ>
        <Champ id="birthPlace" label="Lieu de naissance *"><input type="text" placeholder="Ex: Dakar" className={inputCls} {...champ('birthPlace')} /></Champ>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="phone" label="Téléphone & WhatsApp *"><input type="tel" placeholder="77 123 45 67" className={inputCls} {...champ('phone')} /></Champ>
        <Champ id="email" label="Email personnel *"><input type="email" placeholder="moussa.diop@gmail.com" className={inputCls} {...champ('email')} /></Champ>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Champ id="cniNumber" label="N° CNI (NIN) ou Passeport *">
          <input type="text" placeholder="Ex: 1 751 2005 02841" className={`${inputCls} font-mono`} {...champ('cniNumber')} />
        </Champ>
        <Champ id="nationality" label="Nationalité *"><ChoixPays className={inputCls} {...champ('nationality')} /></Champ>
        <Champ id="address" label="Ville & Quartier de résidence"><input type="text" placeholder="Ex: Sacré-Cœur 3, Dakar" className={inputCls} {...champ('address')} /></Champ>
      </div>

      <NavigationEtape onNext={onNext} libelleSuivant="Suivant : Tuteur / Garant" />
    </motion.div>
  );
}

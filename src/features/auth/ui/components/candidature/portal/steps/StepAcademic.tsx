import { motion } from 'motion/react';
import type { Campaign } from '../admissionsTypes';
import { Champ, ChoixBoutons, NavigationEtape } from './champs';
import { inputCls, useChamp } from './champsCandidature';

const SERIES_BAC = ['S1', 'S2', 'S3', "L'", 'L1', 'L2', 'G', 'STEG', 'T1', 'T2', 'Autre'];
const MENTIONS = ['Passable', 'Assez Bien', 'Bien', 'Très Bien'];
const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

/**
 * La filière, le niveau et la session viennent de la campagne choisie (publiée par l'école).
 * Avant : une liste de filières inventée, sans lien avec la campagne, et une session « Février 2027 » fictive.
 */
export function StepAcademic({ campaign, onNext, onPrev }: { campaign: Campaign; onNext: () => void; onPrev: () => void }) {
  const champ = useChamp();
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
      <div>
        <h3 className="text-base font-black text-neutral-900 tracking-tight">3. Parcours Scolaire & Formation demandée</h3>
        <p className="text-xs text-neutral-500 font-medium">Diplôme d'entrée et formation pour laquelle vous candidatez.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="previousSchool" label="Dernier établissement fréquenté *">
          <input type="text" placeholder="Ex: Lycée Lamine Guèye / Faculté FST" className={inputCls} {...champ('previousSchool')} />
        </Champ>
        <Champ id="bacYear" label="Année d'obtention du Bac / Diplôme *">
          <input inputMode="numeric" placeholder={`Ex: ${new Date().getFullYear()}`} className={inputCls} {...champ('bacYear')} />
        </Champ>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Champ id="bacSeries" label="Série du Baccalauréat *">
          <select className={inputCls} {...champ('bacSeries')}>
            <option value="">— Choisir —</option>
            {SERIES_BAC.map(s => <option key={s} value={s}>{s === 'Autre' ? 'Autre / équivalent' : `Série ${s}`}</option>)}
          </select>
        </Champ>
        <Champ id="bacMention" label="Mention obtenue">
          <ChoixBoutons id="bacMention" options={MENTIONS.map(m => ({ valeur: m, libelle: m }))} />
        </Champ>
      </div>

      <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 block">Formation demandée</span>
          <span className="font-black text-neutral-900">{campaign.title}</span>
        </div>
        {campaign.level ? (
          <div>
            <span className="text-[11px] font-bold text-neutral-500 block">Niveau d'entrée</span>
            <span className="font-black text-neutral-900">{campaign.level}</span>
          </div>
        ) : (
          <Champ id="targetLevel" label="Niveau d'entrée sollicité *">
            <select className={inputCls} {...champ('targetLevel')}>
              <option value="">— Choisir —</option>
              {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Champ>
        )}
        {campaign.intake && (
          <div>
            <span className="text-[11px] font-bold text-neutral-500 block">Session de rentrée</span>
            <span className="font-black text-neutral-900">{campaign.intake}</span>
          </div>
        )}
      </div>

      <NavigationEtape onPrev={onPrev} onNext={onNext} libelleSuivant="Suivant : Pièces Justificatives" />
    </motion.div>
  );
}

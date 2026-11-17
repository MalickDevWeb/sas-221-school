import React, { useState } from 'react';
import { toast } from 'sonner';
import { Student } from '../../../domain/StudentModels';
import { useDeviceStore } from '@/features/screenguard/hooks/useDeviceStore';
import { MobileStudentCards } from '@/features/screenguard/ui/components/MobileStudentCards';
import { EnrollTransferStudentModal } from "./EnrollTransferStudentModal";
import { NouvelEleveModal } from "./NouvelEleveModal";
import { useAuthStore } from '@/core/store/authStore';
import { useRbacStore } from '@/core/store/rbacStore';
import { EnTeteModule } from '@/shared/components/EnTeteModule';
import { BarreFiltres } from '@/shared/components/BarreFiltres';
import { Button } from '@/design-system/components/Button';
import { avecNombre } from '@/shared/lib/pluriel';
import { sectionsVisibles } from '../menuAdmin';
import { ouvrirOngletAdmin } from '../navigationAdmin';

interface Props {
  students: Student[];
  /** Chargement de la liste en cours (squelette tant qu'aucun élève n'est affiché). */
  chargement?: boolean;
  /** Échec du chargement (message lisible) : affiché dans le tableau, avec « Réessayer ». */
  erreur?: string | null;
  onUpdateStudents: (list: Student[]) => void;
  onViewProfile: (student: Student) => void;
  /** Suspension / réactivation réelle (PATCH /admin/students/{id}/toggle-status). */
  onToggleQrStatus?: (id: string) => void;
  onRefresh?: () => void;
}

/**
 * Annuaire des élèves : en-tête commun (EnTeteModule), barre de filtres commune, états vide / filtré / chargement /
 * erreur dans le tableau, et une carte par élève quand la carte de contenu est étroite (moins de 44rem).
 * Repères des tests conservés : #student-grid-tab, ligne `tr` contenant le nom ou le matricule, bouton « Profil 360° »,
 * texte « menu « Transferts d'élèves » ».
 */
export function StudentDataGridTab({ students, chargement, erreur, onViewProfile, onToggleQrStatus, onRefresh }: Props) {
  const { isMobile } = useDeviceStore();
  const role = useAuthStore((st) => st.utilisateur?.role) as string | undefined;
  const originalSuperAdminRole = useAuthStore((st) => st.originalSuperAdminRole);
  const estPlateforme = role === 'SUPER_ADMIN' || role === 'PLATFORM_OWNER' || role === 'PLATFORM_ADMIN' || Boolean(originalSuperAdminRole);
  const mesDroits = useRbacStore((s) => s.mesDroits);
  const peutOuvrirTransferts = sectionsVisibles(mesDroits).some((s) => s.entrees.some((e) => e.id === 'transferts'));
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterQr, setFilterQr] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nouvelEleveOuvert, setNouvelEleveOuvert] = useState(false);

  // Plus de bascule locale : l'état affiché ne change qu'après confirmation du serveur
  const toggleQrStatus = (id: string) => {
    if (onToggleQrStatus) onToggleQrStatus(id);
    else toast.error("Action indisponible : la suspension n'est pas reliée au serveur ici.");
  };

  const enTete = (
    <EnTeteModule
      icone="group"
      titre="Annuaire des élèves"
      sousTitre="Les élèves inscrits, leur classe et leur accès par QR code."
      aide={!estPlateforme && (
        // Les écoles demandent un transfert dans « Transferts d'élèves », où l'école d'accueil accepte ou refuse
        <>
          Transfert vers une autre école : menu « {peutOuvrirTransferts ? (
            <button type="button" onClick={() => ouvrirOngletAdmin('transferts')}
              className="font-semibold text-primary underline underline-offset-2 hover:no-underline cursor-pointer bg-transparent border-0 p-0">
              Transferts d'élèves
            </button>
          ) : "Transferts d'élèves"} ».
        </>
      )}
      actions={
        <>
          {/* Route de la plateforme (super-administrateur) ; les écoles passent par « Transferts d'élèves » */}
          {estPlateforme && (
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Inscrire / Transférer
            </Button>
          )}
          {/* Inscription directe : POST /admin/students, e-mail ou « sans e-mail » (connexion par matricule) */}
          <Button id="eleves-nouvel-eleve" onClick={() => setNouvelEleveOuvert(true)}>
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            Nouvel élève
          </Button>
        </>
      }
    />
  );

  const fenetres = (
    <>
      <NouvelEleveModal isOpen={nouvelEleveOuvert} onClose={() => setNouvelEleveOuvert(false)} onCreated={() => onRefresh?.()} />
      <EnrollTransferStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          toast.success('Élève inscrit ou transféré.');
          onRefresh?.();
        }}
      />
    </>
  );

  const etatErreur = (
    <div role="alert" className="flex flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold text-rose-700">Liste des élèves non chargée : {erreur}</p>
      {onRefresh && (
        <Button variant="outline" onClick={() => onRefresh()}>
          <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">refresh</span>
          Réessayer
        </Button>
      )}
    </div>
  );
  const etatVide = (
    <div className="flex flex-col items-center gap-3 text-center">
      <span translate="no" aria-hidden="true" className="material-symbols-outlined text-4xl text-slate-300">school</span>
      <p className="text-sm font-semibold text-slate-700">Aucun élève pour l'instant.</p>
      <Button onClick={() => setNouvelEleveOuvert(true)}>
        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
        Inscrire un élève
      </Button>
    </div>
  );
  const squelette = (
    <div className="space-y-2" aria-busy="true" aria-label="Chargement des élèves">
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-10 rounded-xl bg-neutral-100 animate-pulse" />)}
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-4" id="student-grid-tab">
        {enTete}
        {erreur && students.length === 0 ? etatErreur : chargement && students.length === 0 ? squelette : (
          <MobileStudentCards
            students={students}
            onToggleQr={toggleQrStatus}
            onViewProfile={(carte) => { const s = students.find((x) => x.id === carte.id); if (s) onViewProfile(s); }}
            onInscrire={() => setNouvelEleveOuvert(true)}
          />
        )}
        {fenetres}
      </div>
    );
  }

  const q = search.toLowerCase().trim();
  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(q) || s.matricule.toLowerCase().includes(q);
    const matchesClass = filterClass === 'ALL' || s.classe === filterClass;
    const matchesQr = filterQr === 'ALL' || s.qrStatus === filterQr;
    return matchesSearch && matchesClass && matchesQr;
  });
  const effacerFiltres = () => { setSearch(''); setFilterClass('ALL'); setFilterQr('ALL'); };
  const classes = Array.from(new Set(students.map(s => s.classe))).filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr'));

  // Une ligne pleine largeur pour les états (vide, filtré, chargement, erreur) : le tableau n'est jamais une bande vide
  const ligneEtat = (contenu: React.ReactNode) => (
    <tr className="block @[44rem]:table-row">
      <td colSpan={5} className="block @[44rem]:table-cell px-4 py-10">{contenu}</td>
    </tr>
  );

  let corps: React.ReactNode;
  if (erreur && students.length === 0) corps = ligneEtat(etatErreur);
  else if (chargement && students.length === 0) corps = ligneEtat(squelette);
  else if (students.length === 0) corps = ligneEtat(etatVide);
  else if (filtered.length === 0) {
    corps = ligneEtat(
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-slate-700">Aucun élève ne correspond à votre recherche.</p>
        <Button variant="outline" onClick={effacerFiltres}>Effacer les filtres</Button>
      </div>,
    );
  } else {
    corps = filtered.map(s => {
      const autorise = s.qrStatus === 'AUTORISÉ';
      return (
        <tr key={s.id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-3 border-t border-neutral-100 first:border-t-0 hover:bg-neutral-50/70 @[44rem]:table-row @[44rem]:p-0">
          <td className="order-2 @[44rem]:order-none @[44rem]:px-4 @[44rem]:py-3 font-mono text-[11px] @[44rem]:text-xs font-semibold text-slate-700 truncate">
            {s.matricule || '—'}
          </td>
          <td className="order-1 basis-full min-w-0 @[44rem]:order-none @[44rem]:px-4 @[44rem]:py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span aria-hidden="true" className="w-8 h-8 shrink-0 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center">
                {(s.name[0] || '?').toUpperCase()}
              </span>
              <span className="text-[13px] font-bold text-slate-900 break-words min-w-0">{s.name}</span>
            </div>
          </td>
          <td className="order-3 @[44rem]:order-none @[44rem]:px-4 @[44rem]:py-3 text-xs font-medium text-slate-600 truncate">
            {s.classe || '—'}
          </td>
          <td className="order-4 @[44rem]:order-none @[44rem]:px-4 @[44rem]:py-3">
            <button type="button" onClick={() => toggleQrStatus(s.id)}
              title={autorise ? 'Accès autorisé : cliquer pour suspendre' : 'Accès suspendu : cliquer pour réactiver'}
              aria-label={autorise ? `Suspendre l'accès de ${s.name}` : `Réactiver l'accès de ${s.name}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold cursor-pointer ${
                autorise ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}>
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[14px]">{autorise ? 'verified_user' : 'block'}</span>
              {autorise ? 'Autorisé' : 'Suspendu'}
            </button>
          </td>
          <td className="order-5 ml-auto @[44rem]:order-none @[44rem]:ml-0 @[44rem]:px-4 @[44rem]:py-3 text-right">
            <button type="button" onClick={() => onViewProfile(s)} aria-label={`Ouvrir le profil 360° de ${s.name}`}
              className="text-xs font-semibold text-primary hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0">
              Profil 360°
            </button>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="space-y-4 font-sans text-xs" id="student-grid-tab">
      {enTete}

      <BarreFiltres
        recherche={search}
        onRecherche={setSearch}
        libelleRecherche="Rechercher un élève"
        indication="Rechercher par nom ou matricule…"
        filtres={[
          {
            libelle: 'Filtrer par classe', valeur: filterClass, onChange: setFilterClass,
            options: [{ valeur: 'ALL', libelle: 'Toutes les classes' }, ...classes.map((c) => ({ valeur: c, libelle: c }))],
          },
          {
            libelle: "Filtrer par accès", valeur: filterQr, onChange: setFilterQr,
            options: [{ valeur: 'ALL', libelle: 'Tous les accès' }, { valeur: 'AUTORISÉ', libelle: 'Accès autorisé' }, { valeur: 'SUSPENDU', libelle: 'Accès suspendu' }],
          },
        ]}
      />

      <div className="@container">
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <table className="block @[44rem]:table w-full @[44rem]:table-fixed text-left border-collapse">
            <caption className="sr-only">Annuaire des élèves</caption>
            <thead className="hidden @[44rem]:table-header-group">
              <tr className="bg-[#FAF8F6] border-b border-neutral-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                <th scope="col" className="w-36 px-4 py-2.5">Matricule</th>
                <th scope="col" className="px-4 py-2.5">Élève</th>
                <th scope="col" className="w-36 px-4 py-2.5">Classe</th>
                <th scope="col" className="w-32 px-4 py-2.5">Accès</th>
                <th scope="col" className="w-28 px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block @[44rem]:table-row-group">{corps}</tbody>
          </table>
          {students.length > 0 && (
            <div className="px-4 py-2.5 border-t border-neutral-200 bg-[#FAF8F6]">
              <p className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {avecNombre(filtered.length, 'élève')}{filtered.length !== students.length ? ` sur ${students.length.toLocaleString('fr-FR')}` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
      {fenetres}
    </div>
  );
}

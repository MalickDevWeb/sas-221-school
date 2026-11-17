import React, { useState, useMemo, useRef } from 'react';
import { StaffMember, libelleRole } from '../../../domain/PersonnelModels';
import { AccountsFilterBar } from './accounts/AccountsFilterBar';
import { StaffTable } from './accounts/StaffTable';
import { AddStaffCard, NouveauCollaborateur, ResultatCreation } from './accounts/AddStaffCard';
import { EditStaffModal } from './accounts/EditStaffModal';
import { DeleteStaffModal } from './accounts/DeleteStaffModal';
import { MotDePasseProvisoireModal } from '../MotDePasseProvisoireModal';
import { useAuthStore } from '@/core/store/authStore';
import { useRbacStore } from '@/core/store/rbacStore';
import { LienAccesModal, type CompteLien } from '../liensAcces/LienAccesModal';
import { LiensEnAttente } from '../liensAcces/LiensEnAttente';
import { EnTeteModule } from '@/shared/components/EnTeteModule';
import { Button } from '@/design-system/components/Button';

interface Props {
  staff: StaffMember[];
  /** Premier chargement de la liste du personnel. */
  chargement?: boolean;
  onAddStaff: (member: NouveauCollaborateur) => Promise<ResultatCreation | null>;
  onUpdateStaff: (updated: StaffMember) => Promise<boolean>;
  onDeleteStaff: (id: string) => Promise<boolean>;
  onToggleStatus: (id: string) => void;
}

/**
 * Personnel › Comptes du personnel. Mise en page du 16/11 : en-tête commun (titre, sous-titre, bouton principal
 * « Ajouter un membre »), formulaire d'ajout dans un panneau pleine largeur ouvert par ce bouton, puis recherche et
 * filtres, puis tableau pleine largeur. Avant : formulaire permanent à droite, qui rétrécissait le tableau au point de
 * le faire déborder (première colonne coupée).
 */
export function AccountsTab({
  staff,
  chargement,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStatus,
}: Props) {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const boutonAjout = useRef<HTMLButtonElement>(null);
  const [motDePasseInfo, setMotDePasseInfo] = useState<{ nom: string; email: string; motDePasse: string; id: string; telephone?: string } | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [lienPour, setLienPour] = useState<CompteLien | null>(null);
  // Liens d'accès : routes réservées à l'administration de l'école (hors matrice des droits du personnel)
  const administration = useRbacStore((s) => s.mesDroits?.administration ?? false);
  const moi = useAuthStore((s) => s.utilisateur?.id ?? null);
  const noms = useMemo(
    () => Object.fromEntries(staff.map((s) => [s.id, `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || libelleRole(s)])),
    [staff],
  );

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const rMatch = filterRole === 'ALL' || libelleRole(s) === filterRole;
      const sMatch = filterStatus === 'ALL' || s.status === filterStatus;
      const q = search.toLowerCase().trim();
      const qMatch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
        || (s.phone || '').toLowerCase().includes(q) || (s.matricule || '').toLowerCase().includes(q);
      return rMatch && sMatch && qMatch;
    });
  }, [staff, filterRole, filterStatus, search]);

  const filtresActifs = filterRole !== 'ALL' || filterStatus !== 'ALL' || search.trim() !== '';
  const effacerFiltres = () => { setFilterRole('ALL'); setFilterStatus('ALL'); setSearch(''); };
  const fermerAjout = () => { setAjoutOuvert(false); boutonAjout.current?.focus(); };

  return (
    <div className="space-y-4" id="accounts-tab-root">
      <EnTeteModule
        icone="badge"
        titre="Comptes du personnel"
        sousTitre="Les membres de l'équipe qui se connectent à l'espace de l'école, avec leur rôle et leur statut."
        actions={
          <Button ref={boutonAjout} id="personnel-ajouter-membre" type="button" onClick={() => setAjoutOuvert((o) => !o)}
            aria-expanded={ajoutOuvert} aria-controls="panneau-ajout-membre">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
            Ajouter un membre
          </Button>
        }
      />

      {administration && <LiensEnAttente noms={noms} moi={moi} />}

      {ajoutOuvert && (
        <AddStaffCard
          onAddStaff={onAddStaff}
          onFermer={fermerAjout}
          onCreated={({ member, motDePasseProvisoire }) => {
            if (motDePasseProvisoire) {
              setMotDePasseInfo({ nom: `${member.firstName} ${member.lastName}`.trim(), email: member.email, motDePasse: motDePasseProvisoire, id: member.id, telephone: member.phone });
            }
          }}
        />
      )}

      <AccountsFilterBar
        search={search}
        onSearchChange={setSearch}
        filterRole={filterRole}
        onFilterRoleChange={setFilterRole}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />
      <StaffTable
        staff={filteredStaff}
        total={staff.length}
        chargement={chargement}
        onEdit={setEditingStaff}
        onToggleStatus={onToggleStatus}
        onDelete={setDeletingStaffId}
        onLienAcces={administration
          ? (m) => setLienPour({ id: m.id, nom: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || libelleRole(m), telephone: m.phone, email: m.email })
          : undefined}
        moi={moi}
        onEffacerFiltres={filtresActifs ? effacerFiltres : undefined}
      />

      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={async (updated) => {
            // La fenêtre ne se ferme qu'après confirmation du serveur
            if (await onUpdateStaff(updated)) setEditingStaff(null);
          }}
        />
      )}

      <DeleteStaffModal
        isOpen={Boolean(deletingStaffId)}
        onClose={() => setDeletingStaffId(null)}
        onConfirm={async () => {
          if (deletingStaffId && (await onDeleteStaff(deletingStaffId))) setDeletingStaffId(null);
        }}
      />

      {lienPour && <LienAccesModal compte={lienPour} onClose={() => setLienPour(null)} />}

      {motDePasseInfo && (
        <MotDePasseProvisoireModal
          nom={motDePasseInfo.nom}
          identifiant={motDePasseInfo.email}
          motDePasse={motDePasseInfo.motDePasse}
          onClose={() => setMotDePasseInfo(null)}
          envoiAcces={{ id: motDePasseInfo.id, nom: motDePasseInfo.nom, telephone: motDePasseInfo.telephone, email: motDePasseInfo.email }}
        />
      )}
    </div>
  );
}

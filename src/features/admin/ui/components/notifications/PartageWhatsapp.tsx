import { useState } from 'react';
import { useTenantStore } from '@/core/store/tenantStore';
import { resolveErrorMessage } from '@/shared/errors/errorDictionary';
import { copierTexte, lienPartageWhatsapp, messageAnnonceWhatsapp } from '@/shared/lib/whatsapp';
import type { DestinatairesAnnonce } from '../../../domain/NotificationsModels';
import { libelleDestinataires } from './useNotificationsHub';
import { groupesPour, quandPartage, useGroupesWhatsapp, useNoterPartage } from './groupesWhatsappApi';

export interface AnnonceEnvoyee { titre: string; message: string; destinataires: DestinatairesAnnonce }

/**
 * Après l'envoi d'une annonce avec le canal WhatsApp (FEAT-007, US-02) : un bouton par groupe du public choisi ouvre
 * WhatsApp avec le message prêt (l'administrateur choisit le groupe et envoie) ; l'heure d'ouverture est notée.
 */
export function PartageWhatsapp({ annonce, onFermer }: { annonce: AnnonceEnvoyee; onFermer: () => void }) {
  const tenant = useTenantStore((s) => s.currentTenant);
  const groupes = groupesPour(useGroupesWhatsapp().data, annonce.destinataires);
  const noter = useNoterPartage();
  const [partages, setPartages] = useState<Record<string, string>>({});
  const [copies, setCopies] = useState<Record<string, boolean>>({});
  const [erreur, setErreur] = useState('');
  const [copie, setCopie] = useState(false);
  const texte = messageAnnonceWhatsapp({
    titre: annonce.titre, message: annonce.message, ecole: tenant?.name ?? null,
    lien: tenant?.slug ? `${window.location.origin}/t/${tenant.slug}` : null,
  });

  const noterPartage = (id: string) => {
    setErreur('');
    noter.mutate({ groupeId: id, titre: annonce.titre }, {
      onSuccess: (p) => setPartages((x) => ({ ...x, [id]: quandPartage(p.partageLe) })),
      onError: (e) => setErreur(`Partage non noté : ${resolveErrorMessage(e)}`),
    });
  };
  /*
   * 16/11 : « Ouvrir le groupe » — le message est copié, puis le lien d'invitation du groupe est ouvert : pour un membre,
   * il ouvre DIRECTEMENT la discussion du groupe ; il reste à coller et envoyer (aucun choix de groupe à faire).
   * L'onglet est ouvert avant la copie (une ouverture après une attente serait bloquée par le navigateur).
   */
  const ouvrirGroupe = (id: string, lien: string) => {
    const onglet = window.open(lien, '_blank', 'noopener');
    void copierTexte(texte).then((ok) => setCopies((x) => ({ ...x, [id]: ok })));
    if (!onglet) setErreur('Ouverture bloquée par le navigateur : autorisez les fenêtres pour ce site, puis réessayez.');
    noterPartage(id);
  };
  /** « Choisir dans WhatsApp » : WhatsApp s'ouvre avec le message prêt, on choisit le groupe dans la liste. */
  const choisirDansWhatsapp = (id: string) => {
    window.open(lienPartageWhatsapp(texte), '_blank', 'noopener');
    noterPartage(id);
  };
  const copier = async () => setCopie(await copierTexte(texte));

  return (
    <section id="partage-whatsapp" aria-labelledby="partage-whatsapp-titre" className="space-y-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 id="partage-whatsapp-titre" className="text-[13px] font-black text-emerald-900">Partager dans les groupes WhatsApp</h4>
          <p className="text-[11px] font-semibold text-emerald-800">
            « Ouvrir le groupe » copie le message et ouvre la discussion du groupe : collez-le (Ctrl+V ou appui long › Coller) puis envoyez.
          </p>
        </div>
        <button type="button" onClick={onFermer} aria-label="Fermer" className="text-emerald-700 cursor-pointer shrink-0">
          <span translate="no" className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      {groupes.length === 0 ? (
        <p className="text-[12px] font-semibold text-amber-800">
          Aucun groupe WhatsApp enregistré pour « {libelleDestinataires(annonce.destinataires)} ». Ajoutez-en dans l’onglet « Groupes WhatsApp ».
        </p>
      ) : (
        <ul className="space-y-2">
          {groupes.map((g) => (
            <li key={g.id} className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-emerald-100">
              {/* nom sur toute la largeur, boutons dessous (avant : nom écrasé à côté des deux boutons, lu mot par mot) */}
              <span className="min-w-0">
                <span className="block text-[12px] font-black text-neutral-900">{g.nom}</span>
                <span className="block text-[10px] font-semibold text-neutral-500">
                  {partages[g.id]
                    ? `Ouvert dans WhatsApp le ${partages[g.id]}${copies[g.id] ? ' · message copié : collez-le dans le groupe' : ''}`
                    : `${libelleDestinataires(g.public)}${g.classe ? ` · ${g.classe}` : ''}`}
                </span>
              </span>
              <span className="flex flex-wrap gap-2">
              <button type="button" data-groupe={g.id} data-action="ouvrir" onClick={() => ouvrirGroupe(g.id, g.lien)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer flex items-center gap-1 ${partages[g.id] ? 'bg-white border border-emerald-300 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[16px]">{partages[g.id] ? 'done' : 'open_in_new'}</span>
                {partages[g.id] ? 'Rouvrir le groupe' : 'Ouvrir le groupe'}
              </button>
              <button type="button" data-groupe={g.id} data-action="choisir" onClick={() => choisirDansWhatsapp(g.id)}
                title="WhatsApp s’ouvre avec le message prêt ; choisissez le groupe dans la liste"
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50">
                Choisir dans WhatsApp
              </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {erreur && <p role="alert" className="text-[11px] font-bold text-red-700">{erreur}</p>}
      <button type="button" onClick={() => void copier()} className="text-[11px] font-bold text-emerald-800 underline cursor-pointer">
        {copie ? 'Message copié' : 'Copier le message'}
      </button>
    </section>
  );
}

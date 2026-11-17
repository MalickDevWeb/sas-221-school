import { useMassSend, MASS_TEMPLATES } from './useMassSend';
import { MassSendPreview } from './MassSendPreview';
import { Canaux, ChoixDestinataires } from './EtatReelDiffusion';
import { CONTENU_MAX, TITRE_MAX } from './useNotificationsHub';
import { PartageWhatsapp } from './PartageWhatsapp';
import { useGroupesWhatsapp } from './groupesWhatsappApi';

const champ = 'w-full px-3 py-2 border bg-white rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary';
const libelle = 'block text-[10px] font-black uppercase tracking-wider text-neutral-500';

/** Annonce envoyée dans l'application des destinataires choisis (POST /v1/notifications/annonces, nature ANNONCE). */
export function MassSendTab({ compact = false }: { compact?: boolean }) {
  const f = useMassSend('ANNONCE');
  const groupesActifs = (useGroupesWhatsapp().data ?? []).filter(g => g.actif).length;

  return (
    <div className="space-y-5 text-xs text-[#4A5568]" id="mass-send-tab">
      <div className={`grid grid-cols-1 ${compact ? '' : 'lg:grid-cols-2'} gap-5`}>
        <form onSubmit={f.handleSubmit} noValidate className="space-y-4 min-w-0">
          <div className="space-y-1.5">
            <span className={libelle}>Modèles à compléter</span>
            <div className="flex flex-wrap gap-1.5">
              {MASS_TEMPLATES.map(t => (
                <button key={t.id} type="button" onClick={() => f.applyTemplate(t.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:border-primary/50 text-[11px] font-bold cursor-pointer">
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <ChoixDestinataires nom="annonce-destinataires" valeur={f.destinataires} onChange={f.setDestinataires} erreur={f.erreurs.destinataires} />

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="annonce-titre" className={libelle}>Titre <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-semibold text-neutral-400">{f.title.length} / {TITRE_MAX}</span>
            </div>
            <input id="annonce-titre" type="text" maxLength={TITRE_MAX} placeholder="Ex. : Rattrapages du semestre 2" value={f.title}
              onChange={e => f.setTitle(e.target.value)} aria-invalid={f.erreurs.title ? true : undefined}
              aria-describedby={f.erreurs.title ? 'annonce-titre-erreur' : undefined}
              className={`${champ} font-bold ${f.erreurs.title ? 'border-red-400' : 'border-neutral-200'}`} />
            {f.erreurs.title && <p id="annonce-titre-erreur" className="text-[10px] text-red-600 font-semibold">{f.erreurs.title}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="annonce-message" className={libelle}>Message <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-semibold text-neutral-400">{f.content.length} / {CONTENU_MAX}</span>
            </div>
            <textarea id="annonce-message" rows={5} maxLength={CONTENU_MAX} placeholder="Écrivez le message…" value={f.content}
              onChange={e => f.setContent(e.target.value)} aria-invalid={f.erreurs.content ? true : undefined}
              aria-describedby={f.erreurs.content ? 'annonce-message-erreur' : undefined}
              className={`${champ} font-medium resize-y ${f.erreurs.content ? 'border-red-400' : 'border-neutral-200'}`} />
            {f.erreurs.content && <p id="annonce-message-erreur" className="text-[10px] text-red-600 font-semibold">{f.erreurs.content}</p>}
          </div>

          <Canaux whatsapp={f.whatsapp} onWhatsapp={f.setWhatsapp} groupes={groupesActifs} />

          {f.erreurs.serveur && (
            <p id="annonce-erreur" role="alert" className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-[11px] font-bold text-red-700">
              Annonce non envoyée : {f.erreurs.serveur}
            </p>
          )}
          {f.confirmation && (
            <div id="annonce-confirmation" role="status" className="flex items-start gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">
              <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
              <p className="text-[11px] font-bold flex-1">{f.confirmation}</p>
              <button type="button" onClick={() => f.setConfirmation('')} aria-label="Fermer le message" className="shrink-0 cursor-pointer text-emerald-700">
                <span translate="no" className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {f.aPartager && <PartageWhatsapp annonce={f.aPartager} onFermer={f.fermerPartage} />}

          <button type="submit" id="annonce-envoyer" disabled={f.sending}
            className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">{f.sending ? 'sync' : 'send'}</span>
            <span>{f.sending ? 'Envoi…' : 'Envoyer l’annonce'}</span>
          </button>
        </form>

        {!compact && <MassSendPreview title={f.title} content={f.content} />}
      </div>
    </div>
  );
}

import { useMassSend } from './useMassSend';
import { PartageWhatsapp } from './PartageWhatsapp';
import { useGroupesWhatsapp } from './groupesWhatsappApi';
import { MassSendPreview } from './MassSendPreview';
import { Canaux, ChoixDestinataires } from './EtatReelDiffusion';
import { CONTENU_MAX } from './useNotificationsHub';

const EMERGENCY_TYPES = [
  { type: 'Incident majeur ou évacuation', desc: 'Danger immédiat dans l’établissement', icone: 'emergency' },
  { type: 'Alerte météo ou inondation', desc: 'Suspension des cours, fermeture de l’établissement', icone: 'thunderstorm' },
  { type: 'Réunion d’urgence', desc: 'Réunion exceptionnelle de l’administration', icone: 'groups' },
  { type: 'Alerte sanitaire', desc: 'Consignes de précaution ou de confinement', icone: 'medical_services' },
];

/** Alerte d'urgence : envoyée dans l'application des destinataires choisis, mise en évidence (nature URGENCE). */
export function EmergencyTab() {
  const f = useMassSend('URGENCE', { titre: 'urgence-type-0', message: 'urgence-consignes' });
  const groupesActifs = (useGroupesWhatsapp().data ?? []).filter(g => g.actif).length;

  return (
    <div className="space-y-5 text-xs text-[#4A5568]" id="emergency-tab">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <form onSubmit={f.handleSubmit} noValidate className="space-y-4 min-w-0">
          <fieldset className="space-y-2 border-0 p-0 m-0 min-w-0">
            <legend className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2">Nature de l’alerte <span className="text-red-500">*</span></legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMERGENCY_TYPES.map((item, i) => (
                <label key={item.type} className={`flex items-start gap-2.5 p-2.5 border rounded-xl cursor-pointer min-w-0 ${f.title === item.type ? 'bg-red-50 border-red-300 text-red-950' : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}>
                  <input id={`urgence-type-${i}`} type="radio" name="emergency-type" checked={f.title === item.type} onChange={() => f.setTitle(item.type)} className="mt-0.5 w-4 h-4 accent-red-600 cursor-pointer shrink-0" />
                  <span translate="no" aria-hidden="true" className={`material-symbols-outlined text-[18px] shrink-0 ${f.title === item.type ? 'text-red-600' : 'text-neutral-400'}`}>{item.icone}</span>
                  <span className="min-w-0">
                    <span className="block font-extrabold text-xs">{item.type}</span>
                    <span className="block text-[10px] text-neutral-500 font-semibold">{item.desc}</span>
                  </span>
                </label>
              ))}
            </div>
            {f.erreurs.title && <p className="text-[10px] text-red-600 font-semibold">Choisissez la nature de l’alerte.</p>}
          </fieldset>

          <ChoixDestinataires nom="urgence-destinataires" valeur={f.destinataires} onChange={f.setDestinataires} erreur={f.erreurs.destinataires} urgence />

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor="urgence-consignes" className="block text-[10px] font-black uppercase tracking-wider text-neutral-500">Consignes <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-semibold text-neutral-400">{f.content.length} / {CONTENU_MAX}</span>
            </div>
            <textarea id="urgence-consignes" rows={4} maxLength={CONTENU_MAX} value={f.content}
              onChange={e => f.setContent(e.target.value)}
              aria-invalid={f.erreurs.content ? true : undefined} aria-describedby={f.erreurs.content ? 'urgence-consignes-erreur' : undefined}
              placeholder="Ex. : rassemblement immédiat sur le terrain de sport."
              className={`w-full px-3 py-2 border bg-white rounded-xl text-neutral-800 placeholder:text-neutral-400 text-xs outline-none focus:border-red-400 ${f.erreurs.content ? 'border-red-400' : 'border-neutral-200'}`} />
            {f.erreurs.content && <p id="urgence-consignes-erreur" className="text-[10px] text-red-600 font-semibold">{f.erreurs.content}</p>}
          </div>

          <Canaux whatsapp={f.whatsapp} onWhatsapp={f.setWhatsapp} groupes={groupesActifs} />
          {f.aPartager && <PartageWhatsapp annonce={f.aPartager} onFermer={f.fermerPartage} />}

          {f.erreurs.serveur && (
            <p id="urgence-erreur" role="alert" className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-[11px] font-bold text-red-700">
              Alerte non envoyée : {f.erreurs.serveur}
            </p>
          )}
          {f.confirmation && (
            <p id="urgence-confirmation" role="status" className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-800">{f.confirmation}</p>
          )}

          <button type="submit" id="urgence-envoyer" disabled={f.sending}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2">
            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">emergency</span>
            <span>{f.sending ? 'Envoi…' : 'Envoyer l’alerte'}</span>
          </button>
        </form>

        <MassSendPreview title={f.title} content={f.content} urgence />
      </div>
    </div>
  );
}

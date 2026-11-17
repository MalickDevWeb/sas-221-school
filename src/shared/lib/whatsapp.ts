/*
 * Partage WhatsApp SANS API payante (FEAT-007, 16/11). Le lien https://wa.me/?text=… ouvre WhatsApp (téléphone, WhatsApp
 * Web ou Desktop) avec le message prêt ; on y choisit le groupe puis on appuie sur « Envoyer ». Aucun lien gratuit ne
 * permet de publier directement dans un groupe précis : le lien d'invitation (chat.whatsapp.com/…) sert à le rejoindre.
 */

/** Lien qui ouvre WhatsApp avec ce texte prêt à envoyer. */
export function lienPartageWhatsapp(texte: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texte)}`;
}

/**
 * Lien qui ouvre la conversation WhatsApp de CE numéro avec le texte prêt (17/11) ; null si le numéro est inutilisable.
 * Numéro sénégalais à 9 chiffres (« 77 123 45 67 ») complété par l'indicatif 221.
 */
export function lienWhatsappVers(numero: string | null | undefined, texte: string): string | null {
  let chiffres = (numero ?? '').replace(/\D/g, '');
  if (chiffres.startsWith('00')) chiffres = chiffres.slice(2);
  if (chiffres.length === 9 && /^[37]/.test(chiffres)) chiffres = `221${chiffres}`;
  if (chiffres.length < 8 || chiffres.length > 15) return null;
  return `https://wa.me/${chiffres}?text=${encodeURIComponent(texte)}`;
}

/** Message partagé (BR-10) : titre en gras WhatsApp, texte, nom de l'école et lien vers son espace. */
export function messageAnnonceWhatsapp(p: { titre: string; message: string; ecole?: string | null; lien?: string | null }): string {
  const lignes = [`*${p.titre.trim()}*`, '', p.message.trim()];
  if (p.ecole || p.lien) {
    lignes.push('', `— ${p.ecole ?? 'Votre école'}${p.lien ? ` : ${p.lien}` : ''}`);
  }
  return lignes.join('\n');
}

/**
 * Copie un texte dans le presse-papiers, y compris hors HTTPS (adresse du réseau local, où navigator.clipboard
 * n'existe pas) ; vrai si la copie a réussi. À appeler pendant le clic de l'utilisateur.
 */
export async function copierTexte(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texte);
      return true;
    }
  } catch { /* repli ci-dessous */ }
  const zone = document.createElement('textarea');
  zone.value = texte;
  zone.setAttribute('readonly', '');
  zone.style.position = 'fixed';
  zone.style.opacity = '0';
  document.body.appendChild(zone);
  zone.select();
  let ok: boolean;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(zone);
  return ok;
}

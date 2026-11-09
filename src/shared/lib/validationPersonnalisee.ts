/**
 * Validation personnalisée des formulaires (demande du Tech Lead, 2026-11-09).
 *
 * Les règles restent celles déclarées sur les champs (required, type="email", minLength,
 * pattern, min/max…), mais la bulle native du navigateur (« Veuillez renseigner ce champ. »)
 * est remplacée par un message en français affiché SOUS le champ, dans le style de l'application.
 *
 * Fonctionne pour tous les formulaires sans les modifier un par un :
 * - l'événement `invalid` est intercepté (phase de capture) → bulle native supprimée ;
 * - le champ reçoit aria-invalid="true" et un message lié par aria-describedby ;
 * - le message disparaît dès que la saisie devient valide.
 *
 * Personnalisation possible par champ :
 *   data-msg-requis="…"  (champ vide)      data-msg-format="…"  (pattern / type)
 *   setCustomValidity("…") depuis le code reste prioritaire.
 */

type Champ = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const CLASSE_MESSAGE = 'erreur-champ';
let premierChampInvalide: Champ | null = null;

function estChamp(cible: EventTarget | null): cible is Champ {
  return cible instanceof HTMLInputElement || cible instanceof HTMLSelectElement || cible instanceof HTMLTextAreaElement;
}

/** Message en français correspondant à l'état de validité du champ. */
export function messagePour(champ: Champ): string {
  const v = champ.validity;
  const d = champ.dataset;
  if (v.customError) return champ.validationMessage;
  if (v.valueMissing) {
    if (d.msgRequis) return d.msgRequis;
    if (champ instanceof HTMLInputElement && champ.type === 'checkbox') return 'Veuillez cocher cette case pour continuer.';
    if (champ instanceof HTMLInputElement && champ.type === 'file') return 'Veuillez joindre un fichier.';
    if (champ instanceof HTMLSelectElement) return 'Veuillez choisir une option.';
    return 'Ce champ est obligatoire.';
  }
  if (v.typeMismatch) {
    if (d.msgFormat) return d.msgFormat;
    const type = champ instanceof HTMLInputElement ? champ.type : '';
    if (type === 'email') return 'Adresse e-mail invalide (exemple : nom@ecole.sn).';
    if (type === 'url') return 'Adresse web invalide (exemple : https://ecole.sn).';
    return 'Format invalide.';
  }
  if (v.patternMismatch) return d.msgFormat || champ.getAttribute('title') || 'Format invalide.';
  if (v.tooShort && 'minLength' in champ) {
    return `Au moins ${champ.minLength} caractères (actuellement ${champ.value.length}).`;
  }
  if (v.tooLong && 'maxLength' in champ) return `${champ.maxLength} caractères au maximum.`;
  if (v.rangeUnderflow) return `La valeur doit être supérieure ou égale à ${champ.getAttribute('min')}.`;
  if (v.rangeOverflow) return `La valeur doit être inférieure ou égale à ${champ.getAttribute('max')}.`;
  if (v.stepMismatch) return 'Valeur non autorisée pour ce champ.';
  if (v.badInput) return 'Valeur invalide.';
  return 'Valeur invalide.';
}

/** Élément après lequel placer le message : après le conteneur « relative » qui porte une icône, sinon après le champ. */
function ancre(champ: Champ): Element {
  const parent = champ.parentElement;
  if (parent && parent.classList.contains('relative') && parent.children.length <= 3) return parent;
  return champ;
}

function idMessage(champ: Champ): string {
  if (!champ.dataset.idErreur) {
    champ.dataset.idErreur = `erreur-${champ.id || champ.name || 'champ'}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return champ.dataset.idErreur;
}

export function afficherErreur(champ: Champ, message: string): void {
  const id = idMessage(champ);
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('p');
    el.id = id;
    el.className = CLASSE_MESSAGE;
    el.setAttribute('role', 'alert');
    ancre(champ).insertAdjacentElement('afterend', el);
  }
  el.textContent = message;
  champ.setAttribute('aria-invalid', 'true');
  const decrits = new Set((champ.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  decrits.add(id);
  champ.setAttribute('aria-describedby', Array.from(decrits).join(' '));
}

export function effacerErreur(champ: Champ): void {
  const id = champ.dataset.idErreur;
  if (id) document.getElementById(id)?.remove();
  champ.removeAttribute('aria-invalid');
  if (id) {
    const restants = (champ.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
    if (restants.length) champ.setAttribute('aria-describedby', restants.join(' '));
    else champ.removeAttribute('aria-describedby');
  }
}

function surInvalide(e: Event): void {
  if (!estChamp(e.target)) return;
  e.preventDefault(); // supprime la bulle native du navigateur
  const champ = e.target;
  afficherErreur(champ, messagePour(champ));
  // le navigateur ne place plus le curseur : on le place sur le PREMIER champ invalide de la soumission
  if (!premierChampInvalide) {
    premierChampInvalide = champ;
    queueMicrotask(() => {
      premierChampInvalide?.focus({ preventScroll: false });
      premierChampInvalide = null;
    });
  }
}

function surSaisie(e: Event): void {
  if (!estChamp(e.target)) return;
  const champ = e.target;
  if (champ.getAttribute('aria-invalid') !== 'true') return;
  if (champ.validity.valid) effacerErreur(champ);   // validity.valid : pas de nouvel événement « invalid »
  else afficherErreur(champ, messagePour(champ)); // message mis à jour (ex. « actuellement 3 caractères »)
}

let installe = false;

/** À appeler une fois au démarrage (main.tsx). */
export function installerValidationPersonnalisee(doc: Document = document): void {
  if (installe) return;
  installe = true;
  doc.addEventListener('invalid', surInvalide, true);
  doc.addEventListener('input', surSaisie, true);
  doc.addEventListener('change', surSaisie, true);
}

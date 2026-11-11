/**
 * Confirmation personnalisée (remplace window.confirm, demande du Tech Lead : plus de
 * boîtes natives du navigateur). Usage : if (await demanderConfirmation('Supprimer ?')) { … }
 * Échap ou clic hors de la fenêtre = annuler ; Entrée = confirmer.
 */
export function demanderConfirmation(
  message: string,
  options: { titre?: string; confirmer?: string; annuler?: string; danger?: boolean } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const precedent = document.activeElement as HTMLElement | null;
    const fond = document.createElement('div');
    fond.className = 'confirmation-fond';
    fond.innerHTML = `
      <div class="confirmation-boite" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-titre" aria-describedby="confirmation-texte">
        <h2 id="confirmation-titre"></h2>
        <p id="confirmation-texte"></p>
        <div class="confirmation-actions">
          <button type="button" data-choix="non" class="confirmation-annuler"></button>
          <button type="button" data-choix="oui" class="confirmation-confirmer"></button>
        </div>
      </div>`;
    // textContent : le message n'est jamais interprété comme du HTML
    fond.querySelector('#confirmation-titre')!.textContent = options.titre ?? 'Confirmation';
    fond.querySelector('#confirmation-texte')!.textContent = message;
    const non = fond.querySelector<HTMLButtonElement>('[data-choix="non"]')!;
    const oui = fond.querySelector<HTMLButtonElement>('[data-choix="oui"]')!;
    non.textContent = options.annuler ?? 'Annuler';
    oui.textContent = options.confirmer ?? 'Confirmer';
    if (options.danger !== false) oui.classList.add('confirmation-danger');

    const fermer = (reponse: boolean) => {
      document.removeEventListener('keydown', clavier, true);
      fond.remove();
      precedent?.focus?.();
      resolve(reponse);
    };
    const clavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); fermer(false); }
      if (e.key === 'Enter') { e.preventDefault(); fermer(true); }
    };
    non.addEventListener('click', () => fermer(false));
    oui.addEventListener('click', () => fermer(true));
    fond.addEventListener('click', (e) => { if (e.target === fond) fermer(false); });
    document.addEventListener('keydown', clavier, true);
    document.body.appendChild(fond);
    non.focus();   // l'action par défaut au clavier est la plus prudente
  });
}

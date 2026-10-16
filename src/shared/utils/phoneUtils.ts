/**
 * Utilitaires pour la validation et normalisation des numéros de téléphone.
 * Standardise les numéros vers le format international E.164 (ex: +221771719013).
 */

export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/[\s.\-_()]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // Format local sénégalais : 9 chiffres débutant par 7 (77, 78, 76, 75, 70) ou 33
  if (/^[73]\d{8}$/.test(cleaned)) {
    return `+221${cleaned}`;
  }

  // Cas où le 221 est saisi sans le '+' initial
  if (/^221\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  if (!cleaned.startsWith('+') && cleaned.length > 0) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export function formatPhoneInput(raw: string): string {
  const norm = normalizePhoneNumber(raw);
  if (norm.startsWith('+221') && norm.length === 13) {
    return `+221 ${norm.slice(4, 6)} ${norm.slice(6, 9)} ${norm.slice(9, 11)} ${norm.slice(11, 13)}`;
  }
  return raw;
}


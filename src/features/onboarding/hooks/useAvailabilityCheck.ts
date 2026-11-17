import { useState, useEffect } from 'react';
import { publicApiClient } from '@/shared/lib/apiClient';
import { normalizePhoneNumber } from '@/shared/utils/phoneUtils';

export type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export interface Disponibilites {
  emailAvailable?: boolean;
  phoneAvailable?: boolean;
  slugAvailable?: boolean;
}

/**
 * Vérification immédiate (sans délai de frappe), faite avant de changer d'étape et avant l'envoi de l'inscription.
 * null si le serveur ne répond pas : on ne bloque pas alors, l'inscription revérifie de toute façon côté serveur.
 */
export async function verifierDisponibilite(params: { email?: string; phone?: string; slug?: string }): Promise<Disponibilites | null> {
  const requete: Record<string, string> = {};
  if (params.email) requete.email = params.email;
  if (params.phone) requete.phone = params.phone;
  if (params.slug) requete.slug = params.slug;
  if (Object.keys(requete).length === 0) return {};
  try {
    const { data } = await publicApiClient.get<Disponibilites>('/public/check-availability', { params: requete });
    return data ?? {};
  } catch {
    return null;
  }
}

export function useAvailabilityCheck(email?: string, phone?: string, slug?: string) {
  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>('idle');
  const [phoneStatus, setPhoneStatus] = useState<AvailabilityStatus>('idle');
  const [slugStatus, setSlugStatus] = useState<AvailabilityStatus>('idle');

  useEffect(() => {
    const normPhone = normalizePhoneNumber(phone);
    const validEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = normPhone && normPhone.length >= 9;
    const validSlug = slug && slug.length >= 3;

    if (!validEmail && !validPhone && !validSlug) {
      setEmailStatus('idle');
      setPhoneStatus('idle');
      setSlugStatus('idle');
      return;
    }

    if (validEmail) setEmailStatus('checking');
    if (validPhone) setPhoneStatus('checking');
    if (validSlug) setSlugStatus('checking');

    const timer = setTimeout(async () => {
      try {
        const params: Record<string, string> = {};
        if (validEmail) params.email = email;
        if (validPhone) params.phone = normPhone;
        if (validSlug) params.slug = slug;

        const { data } = await publicApiClient.get<{
          emailAvailable?: boolean;
          phoneAvailable?: boolean;
          slugAvailable?: boolean;
        }>('/public/check-availability', { params });

        if (validEmail && data.emailAvailable !== undefined) {
          setEmailStatus(data.emailAvailable ? 'available' : 'unavailable');
        }
        if (validPhone && data.phoneAvailable !== undefined) {
          setPhoneStatus(data.phoneAvailable ? 'available' : 'unavailable');
        }
        if (validSlug && data.slugAvailable !== undefined) {
          setSlugStatus(data.slugAvailable ? 'available' : 'unavailable');
        }
      } catch {
        // En cas d'erreur réseau, ne pas bloquer
        setEmailStatus('idle');
        setPhoneStatus('idle');
        setSlugStatus('idle');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email, phone, slug]);

  return { emailStatus, phoneStatus, slugStatus };
}

